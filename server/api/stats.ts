import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { Treatment } from '../models/Treatment';
import { Payment } from '../models/Payment';

// Dashboard için genel istatistikleri ve finansal durumları hesaplar
export default defineEventHandler(async (event) => {
  try {
    // Türkiye saat dilimine uygun bugünün tarih dizesini (YYYY-MM-DD) alalım
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
    const thisMonth = today.substring(0, 7); // YYYY-MM formatı

    // Veritabanı sorguları
    const totalPatients = await Patient.countDocuments();
    const todayApptsCount = await Appointment.countDocuments({ date: today });
    const pendingApptsCount = await Appointment.countDocuments({ status: 'pending', date: { $gte: today } });

    // Finansal veriler
    const payments = await Payment.find();
    const treatments = await Treatment.find();

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalFees = treatments.reduce((sum, t) => sum + (t.fee || 0), 0);
    const totalDebt = Math.max(0, totalFees - totalRevenue);

    // Bu ay kayıt olan hastalar
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newPatientsThisMonth = await Patient.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Bugün tamamlanan randevu sayısı
    const completedToday = await Appointment.countDocuments({
      date: today,
      status: 'completed'
    });

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
    throw createError({
      statusCode: 500,
      message: `İstatistikler hesaplanırken hata oluştu: ${error.message}`
    });
  }
});

