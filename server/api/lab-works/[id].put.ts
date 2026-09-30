import { LabWork } from '../../models/LabWork';

// Laboratuvar işini günceller (durum veya detaylar)
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'İşlem yapılacak laboratuvar işi ID parametresi gereklidir.'
      });
    }

    const body = await readBody(event);
    const updatedLabWork = await LabWork.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedLabWork) {
      throw createError({
        statusCode: 404,
        message: 'Güncellenecek laboratuvar işi bulunamadı.'
      });
    }

    return updatedLabWork;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Laboratuvar işi güncellenirken hata oluştu.'
    });
  }
});
