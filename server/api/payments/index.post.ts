import { Payment } from '../../models/Payment';

// Yeni bir ödeme kaydı oluşturur
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.patientId || body.amount === undefined || !body.method || !body.date) {
      throw createError({
        statusCode: 400,
        message: 'Hasta seçimi, ödeme miktarı, ödeme yöntemi ve tarih alanları zorunludur.'
      });
    }

    const payment = new Payment(body);
    await payment.save();

    return payment;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Ödeme kaydedilirken hata oluştu.'
    });
  }
});

