import { User } from '../../models/User';
import { Treatment } from '../../models/Treatment';
import { Payment } from '../../models/Payment';
import { DoctorPayout } from '../../models/DoctorPayout';
import { requireDoctor } from '../../utils/auth';
import mongoose from 'mongoose';

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const query = getQuery(event);
    const doctorId = query.doctorId ? String(query.doctorId) : 'all';
    const year = parseInt(String(query.year || new Date().getFullYear()), 10);
    const selectedMonth = query.month ? String(query.month) : '';

    let selectedDoctor = null;
    let doctorRate = 30;

    if (doctorId && doctorId !== 'all') {
      selectedDoctor = await User.findById(doctorId).select('_id name title username rate type phone').lean();
      if (selectedDoctor && selectedDoctor.rate !== undefined) {
        doctorRate = selectedDoctor.rate;
      }
    }

    const monthsMeta = [];
    for (let m = 0; m < 12; m++) {
      const monthNum = String(m + 1).padStart(2, '0');
      const ym = `${year}-${monthNum}`;
      const lastDay = new Date(year, m + 1, 0).getDate();
      const startDate = `${ym}-01`;
      const endDate = `${ym}-${String(lastDay).padStart(2, '0')}`;

      monthsMeta.push({
        month: ym,
        monthNumber: m + 1,
        monthName: `${MONTH_NAMES[m]} ${year}`,
        shortName: MONTH_NAMES[m],
        startDate,
        endDate,
        daysInMonth: lastDay
      });
    }

    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;

    const treatmentMatch: any = {
      date: { $gte: yearStart, $lte: yearEnd }
    };
    const paymentMatch: any = {
      date: { $gte: yearStart, $lte: yearEnd }
    };
    const payoutMatch: any = {
      date: { $gte: yearStart, $lte: yearEnd }
    };

    if (doctorId && doctorId !== 'all') {
      const docObjId = new mongoose.Types.ObjectId(doctorId);
      treatmentMatch.doctorId = docObjId;
      paymentMatch.doctorId = docObjId;
      payoutMatch.doctorId = docObjId;
    }

    const [treatmentsMonthlyAgg, paymentsMonthlyAgg, payoutsMonthlyAgg] = await Promise.all([
      Treatment.aggregate([
        { $match: treatmentMatch },
        {
          $group: {
            _id: { $substr: ['$date', 0, 7] }, // 'YYYY-MM'
            count: { $sum: 1 },
            totalFee: { $sum: '$fee' }
          }
        }
      ]),
      Payment.aggregate([
        { $match: paymentMatch },
        {
          $group: {
            _id: { $substr: ['$date', 0, 7] },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalDoctorEarning: { $sum: '$doctorEarning' }
          }
        }
      ]),
      DoctorPayout.aggregate([
        { $match: payoutMatch },
        {
          $group: {
            _id: { $substr: ['$date', 0, 7] },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ])
    ]);

    const treatmentsMap = new Map();
    treatmentsMonthlyAgg.forEach((t) => treatmentsMap.set(t._id, t));

    const paymentsMap = new Map();
    paymentsMonthlyAgg.forEach((p) => paymentsMap.set(p._id, p));

    const payoutsMap = new Map();
    payoutsMonthlyAgg.forEach((po) => payoutsMap.set(po._id, po));

    const months = monthsMeta.map((meta) => {
      const t = treatmentsMap.get(meta.month) || { count: 0, totalFee: 0 };
      const p = paymentsMap.get(meta.month) || { count: 0, totalAmount: 0, totalDoctorEarning: 0 };
      const po = payoutsMap.get(meta.month) || { count: 0, totalAmount: 0 };

      const totalTreatmentsFee = Math.round((t.totalFee || 0) * 100) / 100;
      const totalCollections = Math.round((p.totalAmount || 0) * 100) / 100;
      const totalDoctorEarnings = Math.round((p.totalDoctorEarning || 0) * 100) / 100;
      const totalPayouts = Math.round((po.totalAmount || 0) * 100) / 100;
      const pendingBalance = Math.round((totalDoctorEarnings - totalPayouts) * 100) / 100;
      const clinicShare = Math.round((totalCollections - totalDoctorEarnings) * 100) / 100;

      return {
        ...meta,
        treatmentCount: t.count,
        totalTreatmentsFee,
        paymentCount: p.count,
        totalCollections,
        totalDoctorEarnings,
        payoutCount: po.count,
        totalPayouts,
        pendingBalance,
        clinicShare
      };
    });

    const yearlyTotals = months.reduce((acc, m) => ({
      treatmentCount: acc.treatmentCount + m.treatmentCount,
      totalTreatmentsFee: Math.round((acc.totalTreatmentsFee + m.totalTreatmentsFee) * 100) / 100,
      paymentCount: acc.paymentCount + m.paymentCount,
      totalCollections: Math.round((acc.totalCollections + m.totalCollections) * 100) / 100,
      totalDoctorEarnings: Math.round((acc.totalDoctorEarnings + m.totalDoctorEarnings) * 100) / 100,
      payoutCount: acc.payoutCount + m.payoutCount,
      totalPayouts: Math.round((acc.totalPayouts + m.totalPayouts) * 100) / 100,
      pendingBalance: Math.round((acc.pendingBalance + m.pendingBalance) * 100) / 100,
      clinicShare: Math.round((acc.clinicShare + m.clinicShare) * 100) / 100
    }), {
      treatmentCount: 0,
      totalTreatmentsFee: 0,
      paymentCount: 0,
      totalCollections: 0,
      totalDoctorEarnings: 0,
      payoutCount: 0,
      totalPayouts: 0,
      pendingBalance: 0,
      clinicShare: 0
    });

    return {
      year,
      doctorId,
      selectedDoctor,
      doctorRate,
      months,
      totals: yearlyTotals
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Aylık hak ediş raporu alınırken hata oluştu.'
    });
  }
});
