import { Expense } from '../../models/Expense';
import { Payment } from '../../models/Payment';
import { requireDoctor, makeTurkishRegex } from '../../utils/auth';

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const query = getQuery(event);
    const month = String(query.month || '').trim();
    const year = parseInt(String(query.year || new Date().getFullYear()), 10);
    const category = String(query.category || 'all').trim();
    const search = String(query.search || '').trim();

    // 1. Gider sorgu filtresi
    const expenseFilter: any = {};
    if (month && month !== 'all') {
      expenseFilter.date = { $regex: `^${month}` };
    }
    if (category && category !== 'all') {
      expenseFilter.category = category;
    }
    if (search) {
      const sRegex = makeTurkishRegex(search);
      expenseFilter.$or = [
        { description: sRegex },
        { category: sRegex }
      ];
    }

    const expenses = await Expense.find(expenseFilter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // 2. Dönemlik Giderler ve Kategori Dağılımı
    const periodExpenseMatch: any = {};
    if (month && month !== 'all') {
      periodExpenseMatch.date = { $regex: `^${month}` };
    }

    const [periodExpenseAgg, periodPaymentAgg, allTimeExpenseAgg, allTimePaymentAgg] = await Promise.all([
      Expense.aggregate([
        { $match: periodExpenseMatch },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' }
          }
        }
      ]),
      Payment.aggregate([
        { $match: month && month !== 'all' ? { date: { $regex: `^${month}` } } : {} },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalDoctorEarning: { $sum: '$doctorEarning' }
          }
        }
      ]),
      Expense.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      Payment.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalDoctorEarning: { $sum: '$doctorEarning' }
          }
        }
      ])
    ]);

    const categoryBreakdown: Record<string, number> = {};
    let totalExpenses = 0;
    periodExpenseAgg.forEach((item) => {
      categoryBreakdown[item._id] = Math.round((item.total || 0) * 100) / 100;
      totalExpenses += item.total || 0;
    });
    totalExpenses = Math.round(totalExpenses * 100) / 100;

    const totalCollections = Math.round((periodPaymentAgg[0]?.totalAmount || 0) * 100) / 100;
    const totalDoctorEarnings = Math.round((periodPaymentAgg[0]?.totalDoctorEarning || 0) * 100) / 100;
    const netClinicProfit = Math.round((totalCollections - totalDoctorEarnings - totalExpenses) * 100) / 100;

    const allTimeTotalCollections = Math.round((allTimePaymentAgg[0]?.totalAmount || 0) * 100) / 100;
    const allTimeTotalDoctorEarnings = Math.round((allTimePaymentAgg[0]?.totalDoctorEarning || 0) * 100) / 100;
    const allTimeTotalExpenses = Math.round((allTimeExpenseAgg[0]?.total || 0) * 100) / 100;
    const allTimeNetClinicProfit = Math.round((allTimeTotalCollections - allTimeTotalDoctorEarnings - allTimeTotalExpenses) * 100) / 100;

    // 3. Mevcut Aylar Listesi (distinct months)
    const [expenseMonths, paymentMonths] = await Promise.all([
      Expense.distinct('date'),
      Payment.distinct('date')
    ]);

    const monthSet = new Set<string>();
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(currentMonthStr);

    expenseMonths.forEach((d: string) => {
      if (d && d.length >= 7) monthSet.add(d.substring(0, 7));
    });
    paymentMonths.forEach((d: string) => {
      if (d && d.length >= 7) monthSet.add(d.substring(0, 7));
    });

    const availableMonths = Array.from(monthSet).sort().reverse();

    // 4. Yıllık Rapor (Yearly Report)
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;

    const [yearExpensesAgg, yearPaymentsAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { date: { $gte: yearStart, $lte: yearEnd } } },
        {
          $group: {
            _id: { $substr: ['$date', 0, 7] },
            total: { $sum: '$amount' }
          }
        }
      ]),
      Payment.aggregate([
        { $match: { date: { $gte: yearStart, $lte: yearEnd } } },
        {
          $group: {
            _id: { $substr: ['$date', 0, 7] },
            totalAmount: { $sum: '$amount' },
            totalDoctorEarning: { $sum: '$doctorEarning' }
          }
        }
      ])
    ]);

    const expMap = new Map();
    yearExpensesAgg.forEach((e) => expMap.set(e._id, e.total || 0));

    const payMap = new Map();
    yearPaymentsAgg.forEach((p) => payMap.set(p._id, p));

    const yearlyMonths = [];
    let sumYearCollections = 0;
    let sumYearDoctorEarnings = 0;
    let sumYearExpenses = 0;

    for (let m = 0; m < 12; m++) {
      const monthNum = String(m + 1).padStart(2, '0');
      const ym = `${year}-${monthNum}`;
      const exp = Math.round((expMap.get(ym) || 0) * 100) / 100;
      const pData = payMap.get(ym) || { totalAmount: 0, totalDoctorEarning: 0 };
      const col = Math.round((pData.totalAmount || 0) * 100) / 100;
      const docEarn = Math.round((pData.totalDoctorEarning || 0) * 100) / 100;
      const net = Math.round((col - docEarn - exp) * 100) / 100;

      sumYearCollections += col;
      sumYearDoctorEarnings += docEarn;
      sumYearExpenses += exp;

      yearlyMonths.push({
        month: ym,
        monthName: `${MONTH_NAMES[m]} ${year}`,
        shortName: MONTH_NAMES[m],
        totalCollections: col,
        totalDoctorEarnings: docEarn,
        totalExpenses: exp,
        netClinicProfit: net
      });
    }

    sumYearCollections = Math.round(sumYearCollections * 100) / 100;
    sumYearDoctorEarnings = Math.round(sumYearDoctorEarnings * 100) / 100;
    sumYearExpenses = Math.round(sumYearExpenses * 100) / 100;
    const sumYearNetProfit = Math.round((sumYearCollections - sumYearDoctorEarnings - sumYearExpenses) * 100) / 100;

    return {
      expenses,
      summary: {
        totalCollections,
        totalDoctorEarnings,
        totalExpenses,
        netClinicProfit,
        selectedMonth: month || currentMonthStr,
        categoryBreakdown,
        availableMonths,
        allTime: {
          totalCollections: allTimeTotalCollections,
          totalDoctorEarnings: allTimeTotalDoctorEarnings,
          totalExpenses: allTimeTotalExpenses,
          netClinicProfit: allTimeNetClinicProfit
        }
      },
      yearlyReport: {
        year,
        months: yearlyMonths,
        totals: {
          totalCollections: sumYearCollections,
          totalDoctorEarnings: sumYearDoctorEarnings,
          totalExpenses: sumYearExpenses,
          netClinicProfit: sumYearNetProfit
        }
      }
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Giderler listelenirken hata oluştu.'
    });
  }
});
