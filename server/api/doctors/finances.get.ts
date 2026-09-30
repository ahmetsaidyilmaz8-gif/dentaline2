import { User } from '../../models/User';
import { Payment } from '../../models/Payment';
import { DoctorPayout } from '../../models/DoctorPayout';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);

    const [totalCollectionsAgg, totalEarningsAgg, totalPayoutsAgg, doctors] = await Promise.all([
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: '$doctorEarning' } } }
      ]),
      DoctorPayout.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      User.find({
        username: { $nin: ['klinik', 'poliklinik', 'admin_clinic'] },
        name: { $not: /klinik|poliklinik/i }
      }).select('_id name title role phone type rate').sort({ name: 1 }).lean()
    ]);

    const totalCollections = Math.round((totalCollectionsAgg[0]?.total || 0) * 100) / 100;
    const totalDoctorEarnings = Math.round((totalEarningsAgg[0]?.total || 0) * 100) / 100;
    const totalDoctorPaid = Math.round((totalPayoutsAgg[0]?.total || 0) * 100) / 100;
    const totalPendingDoctorEarnings = Math.round((totalDoctorEarnings - totalDoctorPaid) * 100) / 100;
    const clinicNetCash = Math.round((totalCollections - totalDoctorPaid) * 100) / 100;
    const clinicPoolShare = Math.round((totalCollections - totalDoctorEarnings) * 100) / 100;

    const [doctorEarningsAgg, doctorPayoutsAgg] = await Promise.all([
      Payment.aggregate([
        { $match: { doctorId: { $ne: null } } },
        {
          $group: {
            _id: '$doctorId',
            totalEarned: { $sum: '$doctorEarning' },
            totalCollections: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      DoctorPayout.aggregate([
        {
          $group: {
            _id: '$doctorId',
            totalPaid: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const earnMap = new Map();
    doctorEarningsAgg.forEach((e) => earnMap.set(String(e._id), e));

    const payoutMap = new Map();
    doctorPayoutsAgg.forEach((p) => payoutMap.set(String(p._id), p));

    const doctorDetails = doctors.map((doc: any) => {
      const e = earnMap.get(String(doc._id)) || { totalEarned: 0, totalCollections: 0, count: 0 };
      const p = payoutMap.get(String(doc._id)) || { totalPaid: 0, count: 0 };

      const earned = Math.round((e.totalEarned || 0) * 100) / 100;
      const paid = Math.round((p.totalPaid || 0) * 100) / 100;
      const pending = Math.round((earned - paid) * 100) / 100;

      return {
        _id: doc._id,
        name: doc.name,
        title: doc.title,
        phone: doc.phone,
        type: doc.type || 'percentage',
        rate: doc.rate !== undefined ? doc.rate : 30,
        totalCollections: Math.round((e.totalCollections || 0) * 100) / 100,
        totalEarned: earned,
        totalPaid: paid,
        pendingBalance: pending,
        paymentCount: e.count,
        payoutCount: p.count
      };
    });

    const recentPayouts = await DoctorPayout.find()
      .populate('doctorId', 'name title')
      .sort({ date: -1, createdAt: -1 })
      .limit(50)
      .lean();

    return {
      totalClinicCollections: totalCollections,
      totalDoctorEarnings,
      totalDoctorPayouts: totalDoctorPaid,
      totalPendingDoctorEarnings,
      totalClinicCash: clinicNetCash,
      doctorBalances: doctorDetails,
      recentPayouts,
      summary: {
        totalCollections,
        totalDoctorEarnings,
        totalDoctorPaid,
        totalPendingDoctorEarnings,
        clinicNetCash,
        clinicPoolShare
      },
      doctors: doctorDetails
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Finansal veriler hesaplanırken hata oluştu.'
    });
  }
});
