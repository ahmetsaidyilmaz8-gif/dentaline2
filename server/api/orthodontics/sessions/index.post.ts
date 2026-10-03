import { OrthodonticSession } from '../../../models/OrthodonticSession';
import { OrthodonticPlan } from '../../../models/OrthodonticPlan';
import { Payment } from '../../../models/Payment';
import { User } from '../../../models/User';
import { Appointment } from '../../../models/Appointment';
import { Patient } from '../../../models/Patient';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const body = await readBody(event);

    if (!body.patientId || !body.date || !body.sessionNotes) {
      throw createError({
        statusCode: 400,
        message: 'Hasta seçimi, seans tarihi ve seans notu (yapılan işlem) zorunludur.'
      });
    }

    const patient = await Patient.findById(body.patientId);
    if (!patient) {
      throw createError({
        statusCode: 404,
        message: 'Hasta bulunamadı.'
      });
    }

    // İlgili ortodonti anlaşmasını bul (varsa)
    let plan: any = null;
    if (body.planId) {
      plan = await OrthodonticPlan.findById(body.planId);
    } else {
      plan = await OrthodonticPlan.findOne({
        patientId: body.patientId,
        status: { $in: ['active', 'paused'] }
      });
    }

    let doctorId = body.doctorId || (plan ? plan.doctorId : null) || patient.doctorId;
    if (!doctorId || String(doctorId) === '6aa1cd9f6be357016bee9c25') {
      const defaultDoc = await User.findOne({ username: 'dtselo' }) || await User.findOne({ name: /Selman/i });
      if (defaultDoc) {
        doctorId = defaultDoc._id;
      } else {
        doctorId = currentDoctor?._id || null;
      }
    }
    let sessionNumber = Number(body.sessionNumber);
    if (!sessionNumber || sessionNumber < 1) {
      const lastSession = await OrthodonticSession.findOne({ patientId: body.patientId })
        .sort({ sessionNumber: -1 })
        .lean();
      sessionNumber = ((lastSession as any)?.sessionNumber || 0) + 1;
    }

    const paymentAmount = Number(body.paymentAmount) || 0;
    const paymentMethod = body.paymentMethod || 'cash';
    let createdPayment: any = null;

    // Eğer bu seansta bir ödeme / tahsilat alındıysa:
    if (paymentAmount > 0) {
      const doctorUser = await User.findById(doctorId);
      let doctorRate = 0;
      let doctorEarning = 0;
      if (doctorUser && (doctorUser.type || 'percentage') === 'percentage') {
        doctorRate = doctorUser.rate !== undefined ? doctorUser.rate : 30;
        doctorEarning = Math.round(paymentAmount * (doctorRate / 100) * 100) / 100;
      }

      // 1. Ödeme / Tahsilat kaydını oluştur (Hekimin cariyesine ve klinik kasasına işlenir)
      createdPayment = new Payment({
        patientId: body.patientId,
        amount: paymentAmount,
        method: paymentMethod,
        date: body.date,
        notes: body.paymentNotes || `Ortodonti ${sessionNumber}. Seans Tahsilatı`,
        doctorId,
        doctorRate,
        doctorEarning,
        isOrthodontic: true,
        orthodonticPlanId: plan ? plan._id : null
      });
      await createdPayment.save();

      // 2. Eğer hastanın aktif ortodonti anlaşması varsa, vadesi gelmiş/ödenmemiş taksitlerinden düş
      if (plan && plan.installments && plan.installments.length > 0) {
        let unallocated = paymentAmount;
        for (const inst of plan.installments) {
          if (inst.status !== 'paid' && unallocated > 0) {
            const needed = (inst.amount || 0) - (inst.paidAmount || 0);
            if (unallocated >= needed) {
              inst.status = 'paid';
              inst.paidAmount = inst.amount;
              inst.paymentDate = body.date;
              inst.paymentId = createdPayment._id;
              unallocated -= needed;
            } else {
              inst.paidAmount = (inst.paidAmount || 0) + unallocated;
              inst.paymentDate = body.date;
              inst.paymentId = createdPayment._id;
              unallocated = 0;
            }
          }
        }

        // Tüm taksitler kapandıysa anlaşmayı tamamlandı yap
        const allPaid = plan.installments.every((i: any) => i.status === 'paid');
        if (allPaid && plan.status === 'active') {
          plan.status = 'completed';
        }

        await plan.save();
      }
    }

    const session = new OrthodonticSession({
      patientId: body.patientId,
      planId: plan ? plan._id : (body.planId || null),
      doctorId,
      sessionNumber,
      date: body.date,
      time: body.time || '10:00',
      sessionNotes: body.sessionNotes.trim(),
      archwireUpper: body.archwireUpper ? body.archwireUpper.trim() : '',
      archwireLower: body.archwireLower ? body.archwireLower.trim() : '',
      elastics: body.elastics ? body.elastics.trim() : '',
      nextAppointmentDate: body.nextAppointmentDate || '',
      nextAppointmentNotes: body.nextAppointmentNotes ? body.nextAppointmentNotes.trim() : '',
      status: body.status || 'completed',
      paymentAmount: paymentAmount > 0 ? paymentAmount : 0,
      paymentMethod: paymentAmount > 0 ? paymentMethod : 'cash',
      paymentId: createdPayment ? createdPayment._id : null
    });

    await session.save();

    if (body.nextAppointmentDate) {
      try {
        const nextAppt = new Appointment({
          patientId: body.patientId,
          date: body.nextAppointmentDate,
          time: body.nextAppointmentTime || '11:00',
          procedure: `Ortodonti ${sessionNumber + 1}. Seans Kontrolü`,
          duration: 30,
          notes: body.nextAppointmentNotes ? `Ortodonti Notu: ${body.nextAppointmentNotes}` : 'Ortodontik seans kontrolü',
          status: 'pending',
          doctorId
        });
        await nextAppt.save();
      } catch (apptErr) {
        console.warn('Otomatik randevu oluşturulurken uyarı:', apptErr);
      }
    }

    return {
      session,
      payment: createdPayment,
      plan
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Seans kaydedilirken hata oluştu.'
    });
  }
});

