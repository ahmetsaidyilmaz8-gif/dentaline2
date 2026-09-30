import { Appointment } from '../../models/Appointment';

// Belirli bir randevuyu siler
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Randevu ID parametresi gereklidir.'
      });
    }

    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
      throw createError({
        statusCode: 404,
        message: 'Randevu bulunamadı.'
      });
    }

    return {
      success: true,
      message: 'Randevu başarıyla silindi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Randevu silinirken hata oluştu.'
    });
  }
});
