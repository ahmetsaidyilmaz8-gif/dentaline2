import { DoctorPayout } from '../../../models/DoctorPayout';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const id = event.context.params?.id;

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Ödeme ID zorunludur.'
      });
    }

    const deleted = await DoctorPayout.findByIdAndDelete(id);
    if (!deleted) {
      throw createError({
        statusCode: 404,
        message: 'Silinecek ödeme kaydı bulunamadı.'
      });
    }

    return {
      success: true,
      message: 'Hekim ödeme kaydı başarıyla silindi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Ödeme kaydı silinirken hata oluştu.'
    });
  }
});
