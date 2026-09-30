import { Expense } from '../../models/Expense';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const id = event.context.params?.id;
    const body = await readBody(event);

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Gider ID zorunludur.'
      });
    }

    const updateData: any = {};
    if (body.category !== undefined) updateData.category = body.category;
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.isRecurring !== undefined) updateData.isRecurring = Boolean(body.isRecurring);
    if (body.recurringDay !== undefined) updateData.recurringDay = parseInt(body.recurringDay, 10) || 1;

    const updated = await Expense.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw createError({
        statusCode: 404,
        message: 'Gider kaydı bulunamadı.'
      });
    }

    return updated;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Gider güncellenirken hata oluştu.'
    });
  }
});
