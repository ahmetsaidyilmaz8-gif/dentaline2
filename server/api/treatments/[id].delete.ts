import { Treatment } from '../../models/Treatment';

// Belirli bir tedavi kaydını siler
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Tedavi ID parametresi gereklidir.'
      });
    }

    const treatment = await Treatment.findByIdAndDelete(id);
    if (!treatment) {
      throw createError({
        statusCode: 404,
        message: 'Tedavi bulunamadı.'
      });
    }

    return {
      success: true,
      message: 'Tedavi kaydı başarıyla silindi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Tedavi silinirken hata oluştu.'
    });
  }
});
