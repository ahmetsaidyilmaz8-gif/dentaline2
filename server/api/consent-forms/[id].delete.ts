import { ConsentForm } from '../../models/ConsentForm';

// İmzalı onam formunu siler
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Silinecek onam formu ID parametresi gereklidir.'
      });
    }

    const deleted = await ConsentForm.findByIdAndDelete(id);
    if (!deleted) {
      throw createError({
        statusCode: 404,
        message: 'Silinecek onam formu bulunamadı.'
      });
    }

    return { success: true, message: 'Onam formu başarıyla silindi.' };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Onam formu silinirken hata oluştu.'
    });
  }
});
