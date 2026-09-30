import { User } from '../../models/User';
import { Treatment } from '../../models/Treatment';
import { Payment } from '../../models/Payment';
import { DoctorPayout } from '../../models/DoctorPayout';
import { Patient } from '../../models/Patient';
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
    const requestedMonth = query.month ? String(query.month) : '';

    let selectedDoctor: any = null;
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
      const docObjId = mongoose.Types.ObjectId.isValid(doctorId) ? new mongoose.Types.ObjectId(doctorId) : null;
      const orDoc = docObjId ? [{ doctorId: docObjId }, { doctorId: String(doctorId) }] : [{ doctorId: String(doctorId) }];
      treatmentMatch.$or = orDoc;
      paymentMatch.$or = orDoc;
      payoutMatch.$or = orDoc;
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

      const totalTreatmentFee = Math.round((t.totalFee || 0) * 100) / 100;
      // Hak ediş: Tedavi cirosu üzerinden hesaplanan pay veya tahsilat üzerinden hesaplanan pay
      const treatmentEarning = Math.round(totalTreatmentFee * (doctorRate / 100) * 100) / 100;
      const totalPaymentAmount = Math.round((p.totalAmount || 0) * 100) / 100;
      const totalDoctorPaymentEarning = Math.round((p.totalDoctorEarning || (totalPaymentAmount * (doctorRate / 100))) * 100) / 100;
      const totalPayout = Math.round((po.totalAmount || 0) * 100) / 100;
      const netTreatmentBalance = Math.round((treatmentEarning - totalPayout) * 100) / 100;

      return {
        ...meta,
        treatmentCount: t.count,
        totalTreatmentFee,
        totalTreatmentsFee: totalTreatmentFee,
        treatmentEarning,
        totalDoctorEarnings: totalDoctorPaymentEarning,
        totalPaymentAmount,
        totalCollections: totalPaymentAmount,
        totalPaymentEarning: totalDoctorPaymentEarning,
        totalPayout,
        totalPayouts: totalPayout,
        netTreatmentBalance,
        pendingBalance: netTreatmentBalance,
        clinicShare: Math.round((totalPaymentAmount - totalDoctorPaymentEarning) * 100) / 100
      };
    });

    const yearlyTotals = months.reduce((acc, m) => ({
      totalTreatments: acc.totalTreatments + m.treatmentCount,
      treatmentCount: acc.treatmentCount + m.treatmentCount,
      totalFee: Math.round((acc.totalFee + m.totalTreatmentFee) * 100) / 100,
      totalTreatmentsFee: Math.round((acc.totalTreatmentsFee + m.totalTreatmentFee) * 100) / 100,
      totalTreatmentEarning: Math.round((acc.totalTreatmentEarning + m.treatmentEarning) * 100) / 100,
      totalCollections: Math.round((acc.totalCollections + m.totalPaymentAmount) * 100) / 100,
      paymentCount: acc.paymentCount + (paymentsMap.get(m.month)?.count || 0),
      totalPaymentEarning: Math.round((acc.totalPaymentEarning + m.totalPaymentEarning) * 100) / 100,
      totalDoctorEarnings: Math.round((acc.totalDoctorEarnings + m.totalPaymentEarning) * 100) / 100,
      totalPayouts: Math.round((acc.totalPayouts + m.totalPayout) * 100) / 100,
      netTreatmentBalance: Math.round((acc.netTreatmentBalance + m.netTreatmentBalance) * 100) / 100,
      pendingBalance: Math.round((acc.pendingBalance + m.netTreatmentBalance) * 100) / 100
    }), {
      totalTreatments: 0,
      treatmentCount: 0,
      totalFee: 0,
      totalTreatmentsFee: 0,
      totalTreatmentEarning: 0,
      totalCollections: 0,
      paymentCount: 0,
      totalPaymentEarning: 0,
      totalDoctorEarnings: 0,
      totalPayouts: 0,
      netTreatmentBalance: 0,
      pendingBalance: 0
    });

    // Aktif Seçili Ay Tespiti
    const currentMonthNum = String(new Date().getMonth() + 1).padStart(2, '0');
    const defaultCurrentMonthStr = `${year}-${currentMonthNum}`;
    let activeMonthStr = requestedMonth || defaultCurrentMonthStr;
    let activeMeta = months.find((m) => m.month === activeMonthStr);
    if (!activeMeta) {
      activeMeta = months[months.length - 1];
      activeMonthStr = activeMeta.month;
    }

    // Aktif ayın detaylı işlemleri (treatments, payments, payouts)
    const activeStartDate = activeMeta.startDate;
    const activeEndDate = activeMeta.endDate;

    const activeTreatmentFilter: any = {
      date: { $gte: activeStartDate, $lte: activeEndDate }
    };
    const activePaymentFilter: any = {
      date: { $gte: activeStartDate, $lte: activeEndDate }
    };
    const activePayoutFilter: any = {
      date: { $gte: activeStartDate, $lte: activeEndDate }
    };

    if (doctorId && doctorId !== 'all') {
      const docObjId = mongoose.Types.ObjectId.isValid(doctorId) ? new mongoose.Types.ObjectId(doctorId) : null;
      const orDoc = docObjId ? [{ doctorId: docObjId }, { doctorId: String(doctorId) }] : [{ doctorId: String(doctorId) }];
      activeTreatmentFilter.$or = orDoc;
      activePaymentFilter.$or = orDoc;
      activePayoutFilter.$or = orDoc;
    }

    const [rawTreatments, rawPayments, rawPayouts] = await Promise.all([
      Treatment.find(activeTreatmentFilter)
        .populate('patientId', 'firstName lastName fullName phone')
        .populate('doctorId', 'name title')
        .sort({ date: -1, createdAt: -1 })
        .lean(),
      Payment.find(activePaymentFilter)
        .populate('patientId', 'firstName lastName fullName phone')
        .sort({ date: -1, createdAt: -1 })
        .lean(),
      DoctorPayout.find(activePayoutFilter)
        .populate('doctorId', 'name title')
        .sort({ date: -1, createdAt: -1 })
        .lean()
    ]);

    const activeTreatments = rawTreatments.map((t: any) => {
      const p = t.patientId || {};
      const patName = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Hasta';
      const earning = Math.round(Number(t.fee || 0) * (doctorRate / 100) * 100) / 100;
      return {
        _id: t._id,
        date: t.date,
        procedure: t.procedure,
        tooth: t.tooth,
        fee: t.fee,
        doctorRate,
        doctorEarning: earning,
        notes: t.notes || '',
        patient: {
          _id: p._id || '',
          name: patName,
          phone: p.phone || ''
        },
        doctor: {
          name: t.doctorId?.name || selectedDoctor?.name || 'Dt. M. Selman YILMAZ'
        }
      };
    });

    const activePayments = rawPayments.map((p: any) => {
      const pat = p.patientId || {};
      const patName = pat.fullName || `${pat.firstName || ''} ${pat.lastName || ''}`.trim() || 'Hasta';
      const rate = p.doctorRate !== undefined ? p.doctorRate : doctorRate;
      const earning = p.doctorEarning !== undefined ? p.doctorEarning : (Math.round(Number(p.amount || 0) * (rate / 100) * 100) / 100);
      return {
        _id: p._id,
        date: p.date,
        method: p.method || 'cash',
        amount: p.amount,
        doctorRate: rate,
        doctorEarning: earning,
        notes: p.notes || '',
        patient: {
          _id: pat._id || '',
          name: patName,
          phone: pat.phone || ''
        }
      };
    });

    const activePayouts = rawPayouts.map((po: any) => ({
      _id: po._id,
      date: po.date,
      amount: po.amount,
      paymentMethod: po.paymentMethod || 'cash',
      notes: po.notes || '',
      doctorId: po.doctorId
    }));

    const totalCollectedAmount = Math.round(activePayments.reduce((s: number, item: any) => s + (item.amount || 0), 0) * 100) / 100;
    const totalDoctorPaymentEarning = Math.round(activePayments.reduce((s: number, item: any) => s + (item.doctorEarning || 0), 0) * 100) / 100;

    const activeMonthTransactions = {
      month: activeMonthStr,
      monthName: activeMeta.monthName,
      startDate: activeMeta.startDate,
      endDate: activeMeta.endDate,
      treatmentCount: activeTreatments.length,
      totalCollectedAmount,
      totalDoctorPaymentEarning,
      treatments: activeTreatments,
      payments: activePayments,
      payouts: activePayouts
    };

    return {
      year,
      doctorId,
      selectedDoctor,
      doctorRate,
      activeMonth: {
        month: activeMonthStr,
        monthName: activeMeta.monthName,
        startDate: activeMeta.startDate,
        endDate: activeMeta.endDate
      },
      activeMonthTransactions,
      months,
      yearSummary: yearlyTotals,
      totals: yearlyTotals
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Aylık hak ediş raporu alınırken hata oluştu.'
    });
  }
});
