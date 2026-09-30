import { Treatment } from '../../models/Treatment';
import '../../models/Patient'; // Mongoose populate için

// Tedavileri çeker, isteğe bağlı olarak hasta (patientId) bazlı filtreler
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const patientId = query.patientId ? String(query.patientId) : '';

    const filter: any = {};
    if (patientId) {
      filter.patientId = patientId;
    }

    const treatments = await Treatment.find(filter)
      .populate('patientId', 'firstName lastName')
      .sort({ date: -1, createdAt: -1 });

    return treatments;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Tedaviler listelenirken hata oluştu: ${error.message}`
    });
  }
});

