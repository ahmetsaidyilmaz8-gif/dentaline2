import { Patient } from '../../models/Patient';
import { Treatment } from '../../models/Treatment';
import { Payment } from '../../models/Payment';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);

    const [treatmentAgg, paymentAgg] = await Promise.all([
      Treatment.aggregate([
        { $match: { patientId: { $ne: null } } },
        {
          $group: {
            _id: '$patientId',
            totalFee: { $sum: '$fee' },
            lastDate: { $max: '$date' }
          }
        }
      ]),
      Payment.aggregate([
        { $match: { patientId: { $ne: null } } },
        {
          $group: {
            _id: '$patientId',
            totalPaid: { $sum: '$amount' },
            lastDate: { $max: '$date' }
          }
        }
      ])
    ]);

    const paymentMap = new Map();
    for (const p of paymentAgg) {
      if (p._id) {
        paymentMap.set(String(p._id), {
          totalPaid: Number(p.totalPaid) || 0,
          lastDate: p.lastDate || null
        });
      }
    }

    const debtorList = [];
    let totalOutstandingDebt = 0;

    for (const t of treatmentAgg) {
      if (!t._id) continue;
      const pId = String(t._id);
      const pData = paymentMap.get(pId) || { totalPaid: 0, lastDate: null };
      const totalFee = Number(t.totalFee) || 0;
      const debt = Math.round((totalFee - pData.totalPaid) * 100) / 100;

      if (debt > 0) {
        totalOutstandingDebt += debt;
        const lastDate = (t.lastDate && pData.lastDate)
          ? (t.lastDate > pData.lastDate ? t.lastDate : pData.lastDate)
          : (t.lastDate || pData.lastDate || '');

        debtorList.push({
          patientId: t._id,
          totalFee,
          totalPaid: pData.totalPaid,
          debt,
          lastDate
        });
      }
    }

    const patientIds = debtorList.map((d) => d.patientId);
    const patients = await Patient.find(
      { _id: { $in: patientIds } },
      'firstName lastName phone tcNo createdAt'
    ).lean();

    const patientMap = new Map();
    for (const p of patients) {
      patientMap.set(String(p._id), p);
    }

    const enrichedDebtors = debtorList.map((d) => {
      const p: any = patientMap.get(String(d.patientId));
      return {
        _id: String(d.patientId),
        firstName: p?.firstName || '',
        lastName: p?.lastName || '',
        phone: p?.phone || '',
        tcNo: p?.tcNo || '',
        createdAt: p?.createdAt || null,
        totalFee: d.totalFee,
        totalPaid: d.totalPaid,
        debt: d.debt,
        lastDate: d.lastDate
      };
    });

    const query = getQuery(event);
    const sortBy = String(query.sortBy || 'newest');

    if (sortBy === 'oldest') {
      enrichedDebtors.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sortBy === 'debt_desc') {
      enrichedDebtors.sort((a, b) => b.debt - a.debt);
    } else if (sortBy === 'debt_asc') {
      enrichedDebtors.sort((a, b) => a.debt - b.debt);
    } else if (sortBy === 'name_asc') {
      enrichedDebtors.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'tr'));
    } else if (sortBy === 'name_desc') {
      enrichedDebtors.sort((a, b) => `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`, 'tr'));
    } else {
      enrichedDebtors.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return {
      debtors: enrichedDebtors,
      totalDebt: Math.round(totalOutstandingDebt * 100) / 100,
      totalCount: enrichedDebtors.length
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Borçlu hastalar listelenirken hata oluştu: ${error.message}`
    });
  }
});
