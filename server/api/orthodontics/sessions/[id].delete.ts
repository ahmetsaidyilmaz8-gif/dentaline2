import { OrthodonticSession } from '../../../models/OrthodonticSession';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const id = event.context.params?.id;

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Seans ID zorunludur.'
      });
    }

    const deleted = await OrthodonticSession.findByIdAndDelete(id);
    if (!deleted) {
      throw createError({
        statusCode: 404,
        message: 'Silinecek seans kaydı bulunamadı.'
      });
    }

    return {
      success: true,
      message: 'Seans kaydı silindi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Seans silinirken hata oluştu.'
    });
  }
});
