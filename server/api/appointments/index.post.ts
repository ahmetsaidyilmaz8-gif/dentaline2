import { Appointment } from '../../models/Appointment';

// Yeni randevu kaydı oluşturur
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.date || !body.time || !body.procedure) {
      throw createError({
        statusCode: 400,
        message: 'Tarih, saat ve yapılacak işlem alanları zorunludur.'
      });
    }

    // Hasta seçimi veya serbest hasta adı kontrolü
    const hasPatientId = body.patientId && typeof body.patientId === 'string' && body.patientId.trim() !== '';
    const hasPatientName = body.patientName && typeof body.patientName === 'string' && body.patientName.trim() !== '';

    if (!hasPatientId && !hasPatientName) {
      throw createError({
        statusCode: 400,
        message: 'Lütfen bir hasta seçin veya hasta adı yazın.'
      });
    }

    // patientId boş string ise ObjectId cast hatası vermemesi için null yapıyoruz
    if (!hasPatientId) {
      body.patientId = null;
    }

    const appointment = new Appointment(body);
    await appointment.save();

    return appointment;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Randevu kaydedilirken hata oluştu.'
    });
  }
});

