import { DoctorPayout } from '../../../models/DoctorPayout';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const id = event.context.params?.id;

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Ödeme ID parametresi zorunludur.'
      });
    }

    const body = await readBody(event);
    if (!body.amount || Number(body.amount) <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Geçerli bir ödeme tutarı girilmelidir.'
      });
    }

    const updateData: any = {
      amount: Number(body.amount),
      date: body.date || new Date().toISOString().split('T')[0],
      paymentMethod: body.paymentMethod || 'cash',
      notes: body.notes !== undefined ? String(body.notes).trim() : ''
    };

    if (body.doctorId) {
      updateData.doctorId = body.doctorId;
    }

    const updatedPayout = await DoctorPayout.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedPayout) {
      throw createError({
        statusCode: 404,
        message: 'Güncellenecek ödeme kaydı bulunamadı.'
      });
    }

    return updatedPayout;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Ödeme kaydı güncellenirken hata oluştu.'
    });
  }
});
