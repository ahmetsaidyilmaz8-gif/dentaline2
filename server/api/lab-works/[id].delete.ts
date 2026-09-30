import { LabWork } from '../../models/LabWork';

// Laboratuvar işi kaydını siler
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Silinecek laboratuvar işi ID parametresi gereklidir.'
      });
    }

    const deleted = await LabWork.findByIdAndDelete(id);
    if (!deleted) {
      throw createError({
        statusCode: 404,
        message: 'Silinecek laboratuvar işi bulunamadı.'
      });
    }

    return { success: true, message: 'Laboratuvar işi başarıyla silindi.' };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Laboratuvar işi silinirken hata oluştu.'
    });
  }
});
