import { Payment } from '../../models/Payment';
import '../../models/Patient'; // Mongoose populate için

// Ödemeleri çeker, isteğe bağlı olarak hasta (patientId) bazlı filtreler
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const patientId = query.patientId ? String(query.patientId) : '';

    const filter: any = {};
    if (patientId) {
      filter.patientId = patientId;
    }

    const payments = await Payment.find(filter)
      .populate('patientId', 'firstName lastName')
      .sort({ date: -1, createdAt: -1 });

    return payments;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Ödemeler listelenirken hata oluştu: ${error.message}`
    });
  }
});

