import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { Treatment } from '../models/Treatment';
import { Payment } from '../models/Payment';
import { requireDoctor } from '../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [totalPatients, todayApptsCount, pendingApptsCount, completedToday, newPatientsThisMonth] = await Promise.all([
      Patient.countDocuments({}),
      Appointment.countDocuments({ date: today, isDeleted: { $ne: true } }),
      Appointment.countDocuments({ status: 'pending', date: { $gte: today }, isDeleted: { $ne: true } }),
      Appointment.countDocuments({ date: today, status: 'completed', isDeleted: { $ne: true } }),
      Patient.countDocuments({ createdAt: { $gte: startOfMonth } })
    ]);

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

    const paymentMap = new Map();
    let totalRevenue = 0;
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

    return {
      totalPatients,
      todayAppts: todayApptsCount,
      pendingAppts: pendingApptsCount,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalFees: Math.round(totalFees * 100) / 100,
      totalDebt: Math.round(totalDebt * 100) / 100,
      debtorsCount,
      newThisMonth: newPatientsThisMonth,
      completedToday
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `İstatistikler hesaplanırken hata oluştu: ${error.message}`
    });
  }
});
