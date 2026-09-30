import { OrthodonticPlan } from '../../../models/OrthodonticPlan';
import { Treatment } from '../../../models/Treatment';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const id = event.context.params?.id;
    const body = await readBody(event);

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Plan ID zorunludur.'
      });
    }

    const plan = await OrthodonticPlan.findById(id);
    if (!plan) {
      throw createError({
        statusCode: 404,
        message: 'Ortodonti anlaşması bulunamadı.'
      });
    }

    if (body.bracketType !== undefined) plan.bracketType = body.bracketType;
    if (body.diagnosis !== undefined) plan.diagnosis = body.diagnosis.trim();
    if (body.notes !== undefined) plan.notes = body.notes.trim();
    if (body.doctorId !== undefined) plan.doctorId = body.doctorId;

    if (body.status !== undefined) {
      plan.status = body.status;
      if (body.status === 'cancelled') {
        plan.installments.forEach((ins: any) => {
          if (ins.status !== 'paid') {
            ins.status = 'cancelled';
          }
        });
      } else if (body.status === 'active') {
        plan.installments.forEach((ins: any) => {
          if (ins.status === 'cancelled') {
            ins.status = 'pending';
          }
        });
      }
    }

    if (body.totalAmount !== undefined && Number(body.totalAmount) !== plan.totalAmount) {
      const newTotal = Math.max(0, Number(body.totalAmount));
      plan.totalAmount = newTotal;
      const downPayment = plan.downPayment || 0;
      const paidInstallments = plan.installments.filter((ins: any) => ins.status === 'paid');
      const paidInstallmentsSum = paidInstallments.reduce((sum: number, ins: any) => sum + (ins.paidAmount || ins.amount), 0);
      const totalPaidSoFar = downPayment + paidInstallmentsSum;
      const newRemainingDebt = Math.max(0, newTotal - totalPaidSoFar);

      const unpaidInstallments = plan.installments.filter((ins: any) => ins.status !== 'paid');
      if (unpaidInstallments.length > 0) {
        if (newRemainingDebt === 0) {
          unpaidInstallments.forEach((ins: any) => {
            ins.amount = 0;
            ins.status = 'cancelled';
          });
        } else {
          const count = unpaidInstallments.length;
          const baseAmount = Math.floor((newRemainingDebt / count) * 100) / 100;
          const remainder = Math.round((newRemainingDebt - baseAmount * count) * 100) / 100;
          unpaidInstallments.forEach((ins: any, index: number) => {
            ins.amount = index === 0 ? Math.round((baseAmount + remainder) * 100) / 100 : baseAmount;
            if (ins.status === 'cancelled' && plan.status !== 'cancelled') {
              ins.status = 'pending';
            }
          });
        }
      } else if (newRemainingDebt > 0) {
        const nextNo = plan.installments.length + 1;
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        plan.installments.push({
          installmentNo: nextNo,
          dueDate: `${y}-${m}-${d}`,
          amount: newRemainingDebt,
          status: 'pending',
          paidAmount: 0,
          paymentDate: '',
          paymentId: null,
          notes: 'Fiyat Artışı Ek Taksiti'
        } as any);
      }
    }

    if (body.durationMonths !== undefined && Number(body.durationMonths) > 0) {
      plan.durationMonths = Number(body.durationMonths);
    }

    await plan.save();

    try {
      let treatment = null;
      if (plan.treatmentId) {
        treatment = await Treatment.findById(plan.treatmentId);
      }
      if (!treatment) {
        treatment = await Treatment.findOne({
          patientId: plan.patientId,
          procedure: { $regex: 'Ortodonti Tedavi Anlaşması' }
        });
      }
      if (treatment) {
        treatment.fee = plan.totalAmount;
        treatment.procedure = `Ortodonti Tedavi Anlaşması (${plan.bracketType})`;
        if (body.doctorId) treatment.doctorId = body.doctorId;
        await treatment.save();
      }
    } catch (err) {
      console.warn('Treatment güncellenirken ikincil hata:', err);
    }

    return plan;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Anlaşma güncellenirken hata oluştu.'
    });
  }
});
