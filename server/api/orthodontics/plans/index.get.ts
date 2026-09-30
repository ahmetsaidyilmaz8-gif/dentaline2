import { OrthodonticPlan } from '../../../models/OrthodonticPlan';
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

    const plans = await OrthodonticPlan.find(filter)
      .populate('patientId', 'firstName lastName phone tcNo bloodType birthDate')
      .populate('doctorId', 'name title rate type')
      .sort({ createdAt: -1 })
      .lean();

    const plansWithSummary = plans.map((plan: any) => {
      const installments = plan.installments || [];
      const totalInstallmentsCount = installments.length;
      const paidInstallmentsCount = installments.filter((i: any) => i.status === 'paid').length;
      const totalPaidFromInstallments = installments
        .filter((i: any) => i.status === 'paid')
        .reduce((sum: number, i: any) => sum + (i.paidAmount || i.amount || 0), 0);
      const totalPaidOverall = (plan.downPayment || 0) + totalPaidFromInstallments;
      const remainingBalance = Math.max(0, (plan.totalAmount || 0) - totalPaidOverall);

      return {
        ...plan,
        summary: {
          totalInstallmentsCount,
          paidInstallmentsCount,
          totalPaidOverall,
          remainingBalance,
          isCompleted: remainingBalance <= 0 && totalInstallmentsCount > 0
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
