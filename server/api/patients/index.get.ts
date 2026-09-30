import { Patient } from '../../models/Patient';
import { Treatment } from '../../models/Treatment';
import { Payment } from '../../models/Payment';

// Tüm hastaları listeler, arama parametresi (q) destekler ve bakiye durumlarını hesaplar
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const q = query.q ? String(query.q).trim() : '';

    let filter = {};
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

    // Hastaları en yeni kayıt olandan başlayarak getir
    const patients = await Patient.find(filter).sort({ createdAt: -1 });

    // Her hasta için toplam borç (tedaviler) ve toplam ödemeleri hesapla
    const patientsWithBalances = await Promise.all(patients.map(async (p) => {
      const treatments = await Treatment.find({ patientId: p._id });
      const payments = await Payment.find({ patientId: p._id });

      const totalFee = treatments.reduce((sum, t) => sum + (t.fee || 0), 0);
      const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
      const balance = totalFee - totalPaid; // pozitif = borçlu

      return {
        ...p.toObject(),
        totalFee,
        totalPaid,
        balance
      };
    }));

    return patientsWithBalances;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Hastalar getirilirken hata oluştu: ${error.message}`
    });
  }
});

