import { Appointment } from '../../models/Appointment';

// Belirli bir randevuyu günceller (örn: durumunu completed veya cancelled yapar)
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Randevu ID parametresi gereklidir.'
      });
    }

    const body = await readBody(event);
    if ('patientId' in body && (!body.patientId || String(body.patientId).trim() === '')) {
      body.patientId = null;
    }
    const appointment = await Appointment.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!appointment) {
      throw createError({
        statusCode: 404,
        message: 'Randevu bulunamadı.'
      });
    }

    return appointment;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Randevu güncellenirken hata oluştu.'
    });
  }
});
