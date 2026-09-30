import { Patient } from '../../models/Patient';
import { Treatment } from '../../models/Treatment';
import { Payment } from '../../models/Payment';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const q = query.q ? String(query.q).trim() : '';
    const isAll = query.all === 'true' || query.all === true;

    let filter: any = {};
    if (q) {
      const searchRegex = new RegExp(q, 'i');
      filter = {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { phone: searchRegex },
          { tcNo: searchRegex }
        ]
      };
    }

    // Dropdown / Seçim listeleri için hızlı mod (bakiye hesaplamadan sadece gerekli alanları döner)
    if (isAll) {
      const limit = Math.min(2000, Number(query.limit) || 1000);
      const list = await Patient.find(filter, '_id firstName lastName phone tcNo')
        .sort({ firstName: 1, lastName: 1 })
        .limit(limit)
        .lean();
      return list;
    }

    // Sayfalama (Pagination)
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    // Sıralama
    const sortBy = String(query.sortBy || 'newest');
    let sortOption: any = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sortBy === 'name_asc') {
      sortOption = { firstName: 1, lastName: 1 };
    } else if (sortBy === 'name_desc') {
      sortOption = { firstName: -1, lastName: -1 };
    }

    const [total, patients] = await Promise.all([
      Patient.countDocuments(filter),
      Patient.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    // Sadece çekilen sayfadaki (maks 25-50) hastaların bakiyelerini toplu 2 sorguyla hesapla (Bellek tasarrufu)
    if (patients.length > 0) {
      const patientIds = patients.map((p: any) => p._id);

      const [treatments, payments] = await Promise.all([
        Treatment.find({ patientId: { $in: patientIds } } as any, 'patientId fee').lean(),
        Payment.find({ patientId: { $in: patientIds } } as any, 'patientId amount').lean()
      ]);

      const feeMap = new Map<string, number>();
      for (const t of treatments as any[]) {
        const pid = String(t.patientId);
        feeMap.set(pid, (feeMap.get(pid) || 0) + (t.fee || 0));
      }

      const paidMap = new Map<string, number>();
      for (const p of payments as any[]) {
        const pid = String(p.patientId);
        paidMap.set(pid, (paidMap.get(pid) || 0) + (p.amount || 0));
      }

      const patientsWithBalances = patients.map((p: any) => {
        const pid = String(p._id);
        const totalFee = feeMap.get(pid) || 0;
        const totalPaid = paidMap.get(pid) || 0;
        const balance = totalFee - totalPaid;
        return {
          ...p,
          totalFee,
          totalPaid,
          balance
        };
      });

      return {
        patients: patientsWithBalances,
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit))
      };
    }

    return {
      patients: [],
      total,
      page,
      totalPages: 1
    };
  } catch (error: any) {
    console.error('Hastalar API Hatası:', error);
    throw createError({
      statusCode: 500,
      message: `Hastalar getirilirken hata oluştu: ${error.message}`
    });
  }
});
