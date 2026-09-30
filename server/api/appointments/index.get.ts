import { Appointment } from '../../models/Appointment';
import '../../models/Patient'; // Mongoose populate çalışması için şemayı yükler

// Randevuları çeker, isteğe bağlı olarak tarih (date) veya hasta (patientId) bazlı filtreler
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const date = query.date ? String(query.date) : '';
    const startDate = query.startDate ? String(query.startDate) : '';
    const endDate = query.endDate ? String(query.endDate) : '';
    const patientId = query.patientId ? String(query.patientId) : '';

    const filter: any = {};
    if (date) {
      filter.date = date;
    } else if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      filter.date = { $lte: endDate };
    }

    if (patientId) {
      filter.patientId = patientId;
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'firstName lastName phone bloodType allergies')
      .sort({ date: 1, time: 1 })
      .lean();

    return appointments;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Randevular listelenirken hata oluştu: ${error.message}`
    });
  }
});

