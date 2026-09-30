import { User } from '../../models/User';
import { Payment } from '../../models/Payment';
import { DoctorPayout } from '../../models/DoctorPayout';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);

    const doctors = await User.find({
      username: { $nin: ['klinik', 'poliklinik', 'admin_clinic'] },
      name: { $not: /klinik|poliklinik/i }
    }).select('_id name username title role phone email type rate startDate endDate isActive notes createdAt')
      .sort({ isActive: -1, name: 1 })
      .lean();

    const earningsAgg = await Payment.aggregate([
      { $match: { doctorId: { $ne: null } } },
      {
        $group: {
          _id: '$doctorId',
          totalEarned: { $sum: '$doctorEarning' },
          totalCollections: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      }
    ]);

    const payoutsAgg = await DoctorPayout.aggregate([
      {
        $group: {
          _id: '$doctorId',
          totalPaid: { $sum: '$amount' },
          payoutCount: { $sum: 1 }
        }
      }
    ]);

    const earningsMap = new Map();
    earningsAgg.forEach((item) => {
      earningsMap.set(String(item._id), item);
    });

    const payoutsMap = new Map();
    payoutsAgg.forEach((item) => {
      payoutsMap.set(String(item._id), item);
    });

    const doctorsWithFinances = doctors.map((doc: any) => {
      const earn = earningsMap.get(String(doc._id)) || { totalEarned: 0, totalCollections: 0, paymentCount: 0 };
      const payout = payoutsMap.get(String(doc._id)) || { totalPaid: 0, payoutCount: 0 };

      const totalEarned = Math.round((earn.totalEarned || 0) * 100) / 100;
      const totalPaid = Math.round((payout.totalPaid || 0) * 100) / 100;
      const pendingBalance = Math.round((totalEarned - totalPaid) * 100) / 100;
      const totalCollections = Math.round((earn.totalCollections || 0) * 100) / 100;

      return {
        ...doc,
        type: doc.type || 'percentage',
        rate: doc.rate !== undefined ? doc.rate : 30,
        finances: {
          totalCollections,
          totalEarned,
          totalPaid,
          pendingBalance,
          paymentCount: earn.paymentCount,
          payoutCount: payout.payoutCount
        }
      };
    });

    doctorsWithFinances.sort((a: any, b: any) => {
      const aIsSelman = a.name?.toLowerCase().includes('selman') || a.username === 'dtselo' || a.name?.toLowerCase().includes('muhammed');
      const bIsSelman = b.name?.toLowerCase().includes('selman') || b.username === 'dtselo' || b.name?.toLowerCase().includes('muhammed');
      if (aIsSelman && !bIsSelman) return -1;
      if (!aIsSelman && bIsSelman) return 1;
      return 0;
    });

    return doctorsWithFinances;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Hekimler listelenirken hata oluştu.'
    });
  }
});
