import { Payment } from '../../models/Payment';
import { Patient } from '../../models/Patient';
import { User } from '../../models/User';
import { OrthodonticPlan } from '../../models/OrthodonticPlan';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const body = await readBody(event);

    if (!body.patientId || body.amount === undefined || !body.method || !body.date) {
      throw createError({
        statusCode: 400,
        message: 'Hasta seçimi, ödeme miktarı, ödeme yöntemi ve tarih alanları zorunludur.'
      });
    }

    const patient = await Patient.findById(body.patientId);
    if (!patient) {
      throw createError({
        statusCode: 404,
        message: 'Hasta bulunamadı.'
      });
    }

    const targetDoctorId = body.doctorId || patient.doctorId || currentDoctor._id;
    let doctorRate = 0;
    let doctorEarning = 0;

    if (targetDoctorId) {
      const targetDoctor = await User.findById(targetDoctorId);
      if (targetDoctor) {
        const type = targetDoctor.type || 'percentage';
        if (type === 'percentage') {
          doctorRate = targetDoctor.rate !== undefined ? targetDoctor.rate : 30;
          doctorEarning = Math.round(Number(body.amount) * (doctorRate / 100) * 100) / 100;
        }
      }
    }

    const paymentData: any = {
      patientId: body.patientId,
      amount: Number(body.amount),
      method: body.method,
      date: body.date,
      notes: body.notes ? body.notes.trim() : '',
      doctorId: targetDoctorId,
      doctorRate,
      doctorEarning,
      isOrthodontic: Boolean(body.isOrthodontic),
      orthodonticPlanId: body.orthodonticPlanId || null,
      installmentNo: body.installmentNo ? Number(body.installmentNo) : undefined
    };

    const payment = new Payment(paymentData);
    await payment.save();

    if (body.orthodonticPlanId && body.installmentNo) {
      const plan = await OrthodonticPlan.findById(body.orthodonticPlanId);
      if (plan && plan.installments) {
        const inst = plan.installments.find((i: any) => i.installmentNo === Number(body.installmentNo));
        if (inst) {
          inst.status = 'paid';
          inst.paidAmount = Number(body.amount);
          inst.paymentDate = body.date;
          inst.paymentId = payment._id;
          await plan.save();
        }
      }
    }

    return payment;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Ödeme kaydedilirken hata oluştu.'
    });
  }
});
