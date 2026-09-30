import { OrthodonticPlan } from '../../../../models/OrthodonticPlan';
import { Payment } from '../../../../models/Payment';
import { User } from '../../../../models/User';
import { requireDoctor } from '../../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const planId = event.context.params?.id;
    const body = await readBody(event);

    if (!planId) {
      throw createError({
        statusCode: 400,
        message: 'Plan ID zorunludur.'
      });
    }

    const installmentNo = Number(body.installmentNo);
    if (!installmentNo) {
      throw createError({
        statusCode: 400,
        message: 'Taksit numarası belirtilmelidir.'
      });
    }

    const plan = await OrthodonticPlan.findById(planId);
    if (!plan) {
      throw createError({
        statusCode: 404,
        message: 'Ortodonti anlaşması bulunamadı.'
      });
    }

    const installment = plan.installments.find((i: any) => i.installmentNo === installmentNo);
    if (!installment) {
      throw createError({
        statusCode: 404,
        message: 'Belirtilen taksit bulunamadı.'
      });
    }

    const paymentAmount = Number(body.amount) || installment.amount;
    const paymentMethod = body.method || 'cash';
    const paymentDate = body.date || new Date().toISOString().split('T')[0];
    const notes = body.notes || `Ortodonti ${installmentNo}. Taksit Tahsilatı`;

    const targetDoctorId = body.doctorId || plan.doctorId || currentDoctor._id;
    const doctorUser = await User.findById(targetDoctorId);
    let doctorRate = 0;
    let doctorEarning = 0;

    if (doctorUser && (doctorUser.type || 'percentage') === 'percentage') {
      doctorRate = doctorUser.rate !== undefined ? doctorUser.rate : 30;
      doctorEarning = Math.round(paymentAmount * (doctorRate / 100) * 100) / 100;
    }

    const payment = new Payment({
      patientId: plan.patientId,
      amount: paymentAmount,
      method: paymentMethod,
      date: paymentDate,
      notes,
      doctorId: targetDoctorId,
      doctorRate,
      doctorEarning,
      isOrthodontic: true,
      orthodonticPlanId: plan._id,
      installmentNo
    });
    await payment.save();

    installment.status = 'paid';
    installment.paidAmount = paymentAmount;
    installment.paymentDate = paymentDate;
    installment.paymentId = payment._id;

    const allPaid = plan.installments.every((i: any) => i.status === 'paid');
    if (allPaid && plan.status === 'active') {
      plan.status = 'completed';
    }

    await plan.save();

    return {
      success: true,
      plan,
      payment
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Taksit tahsilatı kaydedilirken hata oluştu.'
    });
  }
});
