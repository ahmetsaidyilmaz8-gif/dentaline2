import { Payment } from '../../models/Payment';
import { Treatment } from '../../models/Treatment';
import { Patient } from '../../models/Patient';
import '../../models/User';
import { requireDoctor, makeTurkishRegex } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const query = getQuery(event);
    const patientId = query.patientId ? String(query.patientId) : '';
    const doctorId = query.doctorId ? String(query.doctorId) : '';
    const isOrthodontic = query.isOrthodontic !== undefined ? query.isOrthodontic === 'true' : null;
    const type = String(query.type || 'all');
    const q = query.q ? String(query.q).trim() : '';
    const month = query.month ? String(query.month).trim() : '';
    const sortBy = String(query.sortBy || 'newest');
    const page = Math.max(1, parseInt(String(query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit), 10) || 30));
    const skip = (page - 1) * limit;

    let pSort: any = { date: -1, _id: -1 };
    let tSort: any = { date: -1, _id: -1 };

    if (sortBy === 'oldest') {
      pSort = { date: 1, _id: 1 };
      tSort = { date: 1, _id: 1 };
    } else if (sortBy === 'amount_desc') {
      pSort = { amount: -1, date: -1, _id: -1 };
      tSort = { fee: -1, date: -1, _id: -1 };
    } else if (sortBy === 'amount_asc') {
      pSort = { amount: 1, date: -1, _id: -1 };
      tSort = { fee: 1, date: -1, _id: -1 };
    }

    if (query.all === 'true') {
      const allPayments = await Payment.find({})
        .populate('doctorId', 'name title rate type')
        .sort(pSort)
        .limit(1000)
        .lean();
      return allPayments;
    }

    if (patientId && !query.page && !query.type) {
      const payments = await Payment.find({ patientId })
        .populate('doctorId', 'name title rate type')
        .sort(pSort)
        .lean();
      return payments;
    }

    // İstatistik hesaplama (sadece stats='true' veya 1. sayfada istenirse)
    const shouldCalculateStats = query.stats === 'true' || page === 1;
    let stats: any = null;
    if (shouldCalculateStats) {
      const [treatmentAgg, paymentAgg] = await Promise.all([
        Treatment.aggregate([
          { $match: { patientId: { $ne: null } } },
          { $group: { _id: '$patientId', totalFee: { $sum: '$fee' } } }
        ]),
        Payment.aggregate([
          { $match: { patientId: { $ne: null } } },
          { $group: { _id: '$patientId', totalPaid: { $sum: '$amount' } } }
        ])
      ]);

      let totalRevenue = 0;
      const paymentMap = new Map();
      for (const p of paymentAgg) {
        const paid = Number(p.totalPaid) || 0;
        totalRevenue += paid;
        if (p._id) paymentMap.set(String(p._id), paid);
      }

      let totalFees = 0;
      let totalDebt = 0;
      let debtorsCount = 0;
      for (const t of treatmentAgg) {
        const fee = Number(t.totalFee) || 0;
        totalFees += fee;
        if (t._id) {
          const paid = paymentMap.get(String(t._id)) || 0;
          const debt = fee - paid;
          if (debt > 0) {
            totalDebt += debt;
            debtorsCount++;
          }
        }
      }

      stats = {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalFees: Math.round(totalFees * 100) / 100,
        totalDebt: Math.round(totalDebt * 100) / 100,
        debtorsCount
      };
    }

    let matchingPatientIds: any[] | null = null;
    if (q) {
      const regex = makeTurkishRegex(q);
      const patients = await Patient.find({
        $or: [
          { fullName: regex },
          { firstName: regex },
          { lastName: regex },
          { phone: regex },
          { tcNo: regex }
        ]
      }, '_id').limit(200).lean();
      matchingPatientIds = patients.map((p) => p._id);
    }

    let items: any[] = [];
    let total = 0;

    const dateFilter: any = {};
    if (month && month !== 'all') {
      dateFilter.date = { $regex: `^${month}` };
    }

    if (type === 'payment') {
      const pFilter: any = { ...dateFilter };
      if (patientId) pFilter.patientId = patientId;
      if (doctorId) pFilter.doctorId = doctorId;
      if (isOrthodontic !== null) pFilter.isOrthodontic = isOrthodontic;
      if (matchingPatientIds !== null) {
        pFilter.$or = [
          { patientId: { $in: matchingPatientIds } },
          { notes: makeTurkishRegex(q) }
        ];
      }

      const [payments, count] = await Promise.all([
        Payment.find(pFilter)
          .select('_id patientId doctorId amount method date notes createdAt doctorRate doctorEarning')
          .populate('patientId', 'firstName lastName phone')
          .populate('doctorId', 'name title')
          .sort(pSort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Payment.countDocuments(pFilter)
      ]);

      total = count;
      items = payments.map((p: any) => ({
        key: `p-${p._id}`,
        id: p._id,
        type: 'payment',
        patientId: p.patientId,
        doctorId: p.doctorId?._id ? String(p.doctorId._id) : (p.doctorId ? String(p.doctorId) : ''),
        doctorName: p.doctorId?.name || '',
        doctorRate: p.doctorRate,
        doctorEarning: p.doctorEarning,
        date: p.date,
        description: `Ödeme Tahsilatı (${p.method || 'Nakit'})`,
        method: p.method,
        notes: p.notes,
        amount: p.amount,
        rawCreatedAt: p.createdAt
      }));
    } else if (type === 'treatment') {
      const tFilter: any = { ...dateFilter };
      if (patientId) tFilter.patientId = patientId;
      if (doctorId) tFilter.doctorId = doctorId;
      if (matchingPatientIds !== null) {
        tFilter.$or = [
          { patientId: { $in: matchingPatientIds } },
          { procedure: makeTurkishRegex(q) },
          { notes: makeTurkishRegex(q) }
        ];
      }

      const [treatments, count] = await Promise.all([
        Treatment.find(tFilter)
          .select('_id patientId doctorId fee procedure tooth date notes createdAt')
          .populate('patientId', 'firstName lastName phone')
          .populate('doctorId', 'name title')
          .sort(tSort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Treatment.countDocuments(tFilter)
      ]);

      total = count;
      items = treatments.map((t: any) => ({
        key: `t-${t._id}`,
        id: t._id,
        type: 'treatment',
        patientId: t.patientId,
        doctorId: t.doctorId?._id ? String(t.doctorId._id) : (t.doctorId ? String(t.doctorId) : ''),
        doctorName: t.doctorId?.name || '',
        date: t.date,
        description: t.procedure,
        tooth: t.tooth,
        notes: t.notes,
        amount: t.fee,
        rawCreatedAt: t.createdAt
      }));
    } else {
      // type === 'all'
      const pFilter: any = { ...dateFilter };
      const tFilter: any = { ...dateFilter };

      if (patientId) {
        pFilter.patientId = patientId;
        tFilter.patientId = patientId;
      }
      if (doctorId) {
        pFilter.doctorId = doctorId;
        tFilter.doctorId = doctorId;
      }
      if (matchingPatientIds !== null) {
        pFilter.$or = [{ patientId: { $in: matchingPatientIds } }, { notes: makeTurkishRegex(q) }];
        tFilter.$or = [{ patientId: { $in: matchingPatientIds } }, { procedure: makeTurkishRegex(q) }, { notes: makeTurkishRegex(q) }];
      }

      const fetchLimit = skip + limit;
      const [pSlice, tSlice, pCount, tCount] = await Promise.all([
        Payment.find(pFilter)
          .select('_id patientId doctorId amount method date notes createdAt doctorRate doctorEarning')
          .populate('patientId', 'firstName lastName phone')
          .populate('doctorId', 'name title')
          .sort(pSort)
          .limit(fetchLimit)
          .lean(),
        Treatment.find(tFilter)
          .select('_id patientId doctorId fee procedure tooth date notes createdAt')
          .populate('patientId', 'firstName lastName phone')
          .populate('doctorId', 'name title')
          .sort(tSort)
          .limit(fetchLimit)
          .lean(),
        Payment.countDocuments(pFilter),
        Treatment.countDocuments(tFilter)
      ]);

      total = pCount + tCount;

      const merged = [
        ...pSlice.map((p: any) => ({
          key: `p-${p._id}`,
          id: p._id,
          type: 'payment',
          patientId: p.patientId,
          doctorId: p.doctorId?._id ? String(p.doctorId._id) : (p.doctorId ? String(p.doctorId) : ''),
          doctorName: p.doctorId?.name || '',
          doctorRate: p.doctorRate,
          doctorEarning: p.doctorEarning,
          date: p.date,
          description: `Ödeme Tahsilatı (${p.method || 'Nakit'})`,
          method: p.method,
          notes: p.notes,
          amount: p.amount,
          rawCreatedAt: p.createdAt
        })),
        ...tSlice.map((t: any) => ({
          key: `t-${t._id}`,
          id: t._id,
          type: 'treatment',
          patientId: t.patientId,
          doctorId: t.doctorId?._id ? String(t.doctorId._id) : (t.doctorId ? String(t.doctorId) : ''),
          doctorName: t.doctorId?.name || '',
          date: t.date,
          description: t.procedure,
          tooth: t.tooth,
          notes: t.notes,
          amount: t.fee,
          rawCreatedAt: t.createdAt
        }))
      ];

      merged.sort((a, b) => {
        if (sortBy === 'oldest') {
          const d2 = (a.date || '').localeCompare(b.date || '');
          if (d2 !== 0) return d2;
          return String(a.id).localeCompare(String(b.id));
        }
        if (sortBy === 'amount_desc') {
          const diff = (b.amount || 0) - (a.amount || 0);
          if (diff !== 0) return diff;
          return (b.date || '').localeCompare(a.date || '');
        }
        if (sortBy === 'amount_asc') {
          const diff = (a.amount || 0) - (b.amount || 0);
          if (diff !== 0) return diff;
          return (b.date || '').localeCompare(a.date || '');
        }
        const d = (b.date || '').localeCompare(a.date || '');
        if (d !== 0) return d;
        return String(b.id).localeCompare(String(a.id));
      });

      items = merged.slice(skip, skip + limit);
    }

    return {
      items,
      payments: items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Ödemeler ve cari işlemler listelenirken hata oluştu: ${error.message}`
    });
  }
});
