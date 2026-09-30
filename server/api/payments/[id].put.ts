import { Payment } from '../../models/Payment';

// Belirli bir ödeme kaydını günceller
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Ödeme ID parametresi gereklidir.'
      });
    }

    const body = await readBody(event);
    const payment = await Payment.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!payment) {
      throw createError({
        statusCode: 404,
        message: 'Ödeme kaydı bulunamadı.'
      });
    }

    return payment;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Ödeme kaydı güncellenirken hata oluştu.'
    });
  }
});
