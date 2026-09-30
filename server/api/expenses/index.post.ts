import { Expense } from '../../models/Expense';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const body = await readBody(event);

    if (!body.category || body.amount === undefined || !body.description || !body.date) {
      throw createError({
        statusCode: 400,
        message: 'Kategori, tutar, tarih ve açıklama alanları zorunludur.'
      });
    }

    const expense = new Expense({
      category: body.category,
      amount: Number(body.amount),
      paymentMethod: body.paymentMethod || 'cash',
      date: body.date,
      description: body.description.trim(),
      isRecurring: Boolean(body.isRecurring),
      recurringDay: body.isRecurring ? (parseInt(body.recurringDay, 10) || 1) : 1,
      doctorId: currentDoctor._id
    });

    await expense.save();
    return expense;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Gider kaydedilirken hata oluştu.'
    });
  }
});
