import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { Treatment } from '../models/Treatment';
import { Payment } from '../models/Payment';
import { DentalChart } from '../models/DentalChart';

// Veritabanını test ve demo amaçlı ön tanımlı verilerle doldurur
export default defineEventHandler(async (event) => {
  try {
    const patientCount = await Patient.countDocuments();
    if (patientCount > 0) {
      return {
        success: false,
        message: 'Veritabanında zaten veri bulunuyor, seed işlemi atlandı.'
      };
    }

    // Bugünü alalım (Türkiye saat dilimine göre)
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });

    // 1. Demo Hastaları Ekle
    const p1 = new Patient({
      firstName: 'Ayşe',
      lastName: 'Kaya',
      tcNo: '12345678901',
      birthDate: '1985-03-15',
      gender: 'female',
      phone: '05321234567',
      email: 'ayse.kaya@email.com',
      bloodType: 'A Rh+',
      allergies: 'Penisilin Alerjisi',
      chronicDiseases: 'Diyabet (Tip-2)',
      medications: 'Metformin',
      address: 'Ankara, Çankaya',
      emergencyContact: 'Mehmet Kaya (Eşi)',
      emergencyPhone: '05329876543',
      notes: 'Hasta ilk seansa biraz gergindi, sakin yaklaşıldı.'
    });
    await p1.save();

    const p2 = new Patient({
      firstName: 'Mehmet',
      lastName: 'Demir',
      tcNo: '98765432101',
      birthDate: '1972-07-22',
      gender: 'male',
      phone: '05559876543',
      email: 'mehmet.demir@email.com',
      bloodType: 'B Rh+',
      allergies: '',
      chronicDiseases: 'Hipertansiyon',
      medications: 'Amlodipin',
      address: 'İstanbul, Kadıköy',
      emergencyContact: 'Fatma Demir (Eşi)',
      emergencyPhone: '05551234567',
      notes: 'Tansiyon ilacını sabahları alıyor.'
    });
    await p2.save();

    const p3 = new Patient({
      firstName: 'Zeynep',
      lastName: 'Yıldız',
      tcNo: '11122233344',
      birthDate: '1995-11-30',
      gender: 'female',
      phone: '05441112233',
      email: 'zeynep.yildiz@email.com',
      bloodType: '0 Rh+',
      allergies: 'Lokal Anestezi Alerjisi (Şüpheli)',
      chronicDiseases: '',
      medications: '',
      address: 'İzmir, Konak',
      emergencyContact: 'Ali Yıldız (Babası)',
      emergencyPhone: '05443332211',
      notes: 'Anestezi öncesi test yapılması önerildi.'
    });
    await p3.save();

    // 2. Demo Randevuları Ekle
    await new Appointment({
      patientId: p1._id,
      date: today,
      time: '09:00',
      procedure: 'Diş Temizliği (Tartar)',
      status: 'pending',
      duration: 30,
      notes: 'Genel kontrol ve diş taşı temizliği'
    }).save();

    await new Appointment({
      patientId: p2._id,
      date: today,
      time: '10:30',
      procedure: 'Dolgu',
      status: 'pending',
      duration: 45,
      notes: 'Sol alt arka dişe kompozit dolgu'
    }).save();

    await new Appointment({
      patientId: p3._id,
      date: today,
      time: '14:00',
      procedure: 'Muayene',
      status: 'completed',
      duration: 15,
      notes: 'İlk muayene tamamlandı'
    }).save();

    // 3. Demo Tedavileri Ekle
    await new Treatment({
      patientId: p1._id,
      date: today,
      procedure: 'Diş Temizliği (Tartar)',
      fee: 850,
      notes: 'Diş taşı temizliği ve parlatma yapıldı.'
    }).save();

    await new Treatment({
      patientId: p2._id,
      date: today,
      procedure: 'Dolgu',
      tooth: '36',
      fee: 1200,
      notes: '36 numaralı dişe ışınlı kompozit dolgu uygulandı.'
    }).save();

    await new Treatment({
      patientId: p3._id,
      date: today,
      procedure: 'Muayene',
      fee: 300,
      notes: 'Ağız içi genel muayene ve röntgen analizi.'
    }).save();

    // 4. Demo Ödemeleri Ekle
    await new Payment({
      patientId: p1._id,
      amount: 500,
      method: 'cash',
      date: today,
      notes: 'Elden yapılan nakit ödeme'
    }).save();

    await new Payment({
      patientId: p3._id,
      amount: 300,
      method: 'card',
      date: today,
      notes: 'Kredi kartı tek çekim'
    }).save();

    // 5. Demo Diş Haritası Ekle
    const chartData = new Map();
    chartData.set('36', { status: 'filled', note: 'Işınlı kompozit dolgu yapıldı.' });
    chartData.set('18', { status: 'decay', note: 'Çürük başlangıcı var, izlenmeli.' });

    await new DentalChart({
      patientId: p2._id,
      chartData
    }).save();

    return {
      success: true,
      message: 'Demo / seed verileri başarıyla veritabanına yüklendi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Seed işlemi sırasında hata oluştu: ${error.message}`
    });
  }
});

