import { OrthodonticPlan } from '../../../models/OrthodonticPlan';
import { Payment } from '../../../models/Payment';
import '../../../models/Patient';
import '../../../models/User';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const query = getQuery(event);
    const patientId = query.patientId ? String(query.patientId) : '';
    const doctorId = query.doctorId ? String(query.doctorId) : '';
    const status = query.status ? String(query.status) : '';

    const filter: any = {};
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;
    if (status) filter.status = status;

    const [plans, paymentsAgg] = await Promise.all([
      OrthodonticPlan.find(filter)
        .populate('patientId', 'firstName lastName phone tcNo bloodType birthDate')
        .populate('doctorId', 'name title rate type')
        .sort({ createdAt: -1 })
        .lean(),
      Payment.aggregate([
        { $match: { isOrthodontic: true } },
        { $group: { _id: '$orthodonticPlanId', totalPaid: { $sum: '$amount' } } }
      ])
    ]);

    const paymentsMap = new Map();
    (paymentsAgg || []).forEach((p: any) => {
      if (p._id) paymentsMap.set(String(p._id), p.totalPaid);
    });

    const plansWithSummary = plans.map((plan: any) => {
      const installments = plan.installments || [];
      const totalInstallmentsCount = installments.length;
      const paidInstallmentsCount = installments.filter((i: any) => i.status === 'paid').length;
      const totalPaidFromInstallments = installments
        .filter((i: any) => i.status === 'paid')
        .reduce((sum: number, i: any) => sum + (i.paidAmount || i.amount || 0), 0);

      const planPaymentsTotal = paymentsMap.get(String(plan._id)) || 0;
      const totalPaidOverall = Math.max((plan.downPayment || 0) + totalPaidFromInstallments, planPaymentsTotal);
      const remainingBalance = Math.max(0, (plan.totalAmount || 0) - totalPaidOverall);
      const isPerSession = plan.planType === 'per_session' || totalInstallmentsCount === 0;

      return {
        ...plan,
        planType: isPerSession ? 'per_session' : 'installments',
        summary: {
          totalInstallmentsCount,
          paidInstallmentsCount,
          totalPaidOverall,
          remainingBalance,
          isPerSession,
          isCompleted: remainingBalance <= 0
        }
      };
    });

    return plansWithSummary;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Ortodonti anlaşmaları listelenirken hata oluştu.'
    });
  }
});
