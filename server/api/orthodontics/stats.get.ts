import { OrthodonticPlan } from '../../models/OrthodonticPlan';
import { OrthodonticSession } from '../../models/OrthodonticSession';
import { Payment } from '../../models/Payment';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);

    const [
      activePlansCount,
      totalPlansCount,
      plansAgg,
      paymentsAgg,
      totalSessionsCount
    ] = await Promise.all([
      OrthodonticPlan.countDocuments({ status: 'active' }),
      OrthodonticPlan.countDocuments(),
      OrthodonticPlan.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' }, downPayment: { $sum: '$downPayment' } } }
      ]),
      Payment.aggregate([
        { $match: { isOrthodontic: true } },
        { $group: { _id: null, totalCollected: { $sum: '$amount' }, totalDoctorCommission: { $sum: '$doctorEarning' } } }
      ]),
      OrthodonticSession.countDocuments()
    ]);

    const totalAgreed = Math.round((plansAgg[0]?.totalAmount || 0) * 100) / 100;
    const totalCollected = Math.round((paymentsAgg[0]?.totalCollected || 0) * 100) / 100;
    const totalDoctorCommission = Math.round((paymentsAgg[0]?.totalDoctorCommission || 0) * 100) / 100;
    const totalRemaining = Math.max(0, Math.round((totalAgreed - totalCollected) * 100) / 100);

    return {
      activePatientsCount: activePlansCount,
      totalPlansCount,
      totalAgreed,
      totalCollected,
      totalDoctorCommission,
      totalRemaining,
      totalSessionsCount
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Ortodonti istatistikleri alınırken hata oluştu.'
    });
  }
});
