import { OrthodonticPlan } from '../../../models/OrthodonticPlan';
import { Payment } from '../../../models/Payment';
import { Treatment } from '../../../models/Treatment';
import { Patient } from '../../../models/Patient';
import { User } from '../../../models/User';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const body = await readBody(event);

    if (!body.patientId || body.totalAmount === undefined || !body.durationMonths || !body.startDate) {
      throw createError({
        statusCode: 400,
        message: 'Hasta seçimi, toplam tutar, tedavi süresi ve başlangıç tarihi zorunludur.'
      });
    }

    const patient = await Patient.findById(body.patientId);
    if (!patient) {
      throw createError({
        statusCode: 404,
        message: 'Hasta bulunamadı.'
      });
    }

    const totalAmount = Number(body.totalAmount);
    const downPayment = Number(body.downPayment) || 0;
    const durationMonths = Math.max(1, parseInt(String(body.durationMonths), 10) || 1);
    const doctorId = body.doctorId || patient.doctorId || currentDoctor._id;

    const isPerSession = body.planType === 'per_session' || body.hasInstallments === false;
    const planType = isPerSession ? 'per_session' : 'installments';
    const hasInstallments = !isPerSession;

    const remainingForInstallments = Math.max(0, totalAmount - downPayment);
    const baseInstallmentAmount = Math.floor((remainingForInstallments / durationMonths) * 100) / 100;
    const remainder = Math.round((remainingForInstallments - baseInstallmentAmount * durationMonths) * 100) / 100;

    const installments = [];
    if (!isPerSession) {
      const [startYear, startMonth, startDay] = body.startDate.split('-').map(Number);
      for (let i = 1; i <= durationMonths; i++) {
        const dueDateObj = new Date(startYear, startMonth - 1 + i, startDay);
        const y = dueDateObj.getFullYear();
        const m = String(dueDateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dueDateObj.getDate()).padStart(2, '0');
        const dueDateStr = `${y}-${m}-${d}`;
        const amount = i === 1 ? baseInstallmentAmount + remainder : baseInstallmentAmount;

        installments.push({
          installmentNo: i,
          dueDate: dueDateStr,
          amount: Math.round(amount * 100) / 100,
          status: 'pending',
          paidAmount: 0,
          paymentDate: '',
          paymentId: null,
          notes: `${i}. Ay Taksiti`
        });
      }
    }

    const plan = new OrthodonticPlan({
      patientId: body.patientId,
      doctorId,
      planType,
      hasInstallments,
      totalAmount,
      downPayment,
      durationMonths,
      startDate: body.startDate,
      bracketType: body.bracketType || 'Metal Braket',
      diagnosis: body.diagnosis ? body.diagnosis.trim() : '',
      notes: body.notes ? body.notes.trim() : '',
      status: 'active',
      installments
    });

    await plan.save();

    const treatmentNotes = isPerSession
      ? `Ortodonti Tedavi Anlaşması (Taksitsiz - Seans Başı Tahsilat). Tahmini Süre: ${durationMonths} Ay. Toplam Tutar: ${totalAmount} TL.`
      : `Ortodonti Tedavi Anlaşması (Aylık Taksitli). Süre: ${durationMonths} Ay. Toplam Tutar: ${totalAmount} TL.`;

    const treatment = new Treatment({
      patientId: body.patientId,
      date: body.startDate,
      procedure: `Ortodonti Tedavi Anlaşması (${plan.bracketType})`,
      fee: totalAmount,
      notes: treatmentNotes,
      doctorId
    });
    await treatment.save();

    plan.treatmentId = treatment._id;
    await plan.save();

    if (downPayment > 0) {
      const doctorUser = await User.findById(doctorId);
      let doctorRate = 0;
      let doctorEarning = 0;
      if (doctorUser && (doctorUser.type || 'percentage') === 'percentage') {
        doctorRate = doctorUser.rate !== undefined ? doctorUser.rate : 30;
        doctorEarning = Math.round(downPayment * (doctorRate / 100) * 100) / 100;
      }

      const downPaymentRecord = new Payment({
        patientId: body.patientId,
        amount: downPayment,
        method: body.downPaymentMethod || 'cash',
        date: body.startDate,
        notes: 'Ortodonti Tedavi Anlaşması Peşinatı',
        doctorId,
        doctorRate,
        doctorEarning,
        isOrthodontic: true,
        orthodonticPlanId: plan._id
      });
      await downPaymentRecord.save();
    }

    return plan;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Ortodonti anlaşması kaydedilirken hata oluştu.'
    });
  }
});
