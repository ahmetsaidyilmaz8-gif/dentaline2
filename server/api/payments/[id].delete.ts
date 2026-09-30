import { Payment } from '../../models/Payment';

// Belirli bir ödeme kaydını siler
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Ödeme ID parametresi gereklidir.'
      });
    }

    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      throw createError({
        statusCode: 404,
        message: 'Ödeme bulunamadı.'
      });
    }

    return {
      success: true,
      message: 'Ödeme kaydı başarıyla silindi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Ödeme silinirken hata oluştu.'
    });
  }
});
