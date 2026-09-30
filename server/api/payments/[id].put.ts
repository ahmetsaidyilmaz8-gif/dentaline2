import { Payment } from '../../models/Payment';
import { User } from '../../models/User';

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
    if (body.doctorId === '' || body.doctorId === undefined) {
      delete body.doctorId;
    }

    if (body.doctorId || body.amount !== undefined) {
      const existingPayment = await Payment.findById(id);
      if (existingPayment) {
        const targetDoctorId = body.doctorId || existingPayment.doctorId;
        if (targetDoctorId) {
          const targetDoctor = await User.findById(targetDoctorId);
          if (targetDoctor) {
            const type = targetDoctor.type || 'percentage';
            if (type === 'percentage') {
              const doctorRate = targetDoctor.rate !== undefined ? targetDoctor.rate : 30;
              const amt = body.amount !== undefined ? Number(body.amount) : existingPayment.amount;
              body.doctorRate = doctorRate;
              body.doctorEarning = Math.round(amt * (doctorRate / 100) * 100) / 100;
            }
          }
        }
      }
    }

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
