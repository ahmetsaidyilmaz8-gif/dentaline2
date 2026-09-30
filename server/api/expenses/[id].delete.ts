import { Expense } from '../../models/Expense';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const id = event.context.params?.id;

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Gider ID zorunludur.'
      });
    }

    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) {
      throw createError({
        statusCode: 404,
        message: 'Silinecek gider bulunamadı.'
      });
    }

    return {
      success: true,
      message: 'Gider kaydı başarıyla silindi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Gider silinirken hata oluştu.'
    });
  }
});
