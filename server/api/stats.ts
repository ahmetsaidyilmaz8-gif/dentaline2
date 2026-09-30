import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { Treatment } from '../models/Treatment';
import { Payment } from '../models/Payment';

// Dashboard için genel istatistikleri ve finansal durumları hesaplar (Hafıza dostu optimize versiyon)
export default defineEventHandler(async (event) => {
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Tüm istatistikleri paralel ve doğrudan MongoDB üzerinde hesapla (Node.js RAM tüketimi sıfır)
    const [
      totalPatients,
      todayApptsCount,
      pendingApptsCount,
      completedToday,
      newPatientsThisMonth,
      revAgg,
      feeAgg
    ] = await Promise.all([
      Patient.countDocuments(),
      Appointment.countDocuments({ date: today }),
      Appointment.countDocuments({ status: 'pending', date: { $gte: today } }),
      Appointment.countDocuments({ date: today, status: 'completed' }),
      Patient.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Treatment.aggregate([{ $group: { _id: null, total: { $sum: '$fee' } } }])
    ]);

    const totalRevenue = revAgg[0]?.total || 0;
    const totalFees = feeAgg[0]?.total || 0;
    const totalDebt = Math.max(0, totalFees - totalRevenue);

    return {
      totalPatients,
      todayAppts: todayApptsCount,
      pendingAppts: pendingApptsCount,
      totalRevenue,
      totalDebt,
      newThisMonth: newPatientsThisMonth,
      completedToday
    };
  } catch (error: any) {
    console.error('İstatistikler hesaplanırken hata:', error);
    throw createError({
      statusCode: 500,
      message: `İstatistikler hesaplanırken hata oluştu: ${error.message}`
    });
  }
});
