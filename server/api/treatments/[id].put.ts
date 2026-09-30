import { Treatment } from '../../models/Treatment';

// Belirli bir tedavi kaydını günceller
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Tedavi ID parametresi gereklidir.'
      });
    }

    const body = await readBody(event);
    const treatment = await Treatment.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!treatment) {
      throw createError({
        statusCode: 404,
        message: 'Tedavi kaydı bulunamadı.'
      });
    }

    return treatment;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Tedavi kaydı güncellenirken hata oluştu.'
    });
  }
});
