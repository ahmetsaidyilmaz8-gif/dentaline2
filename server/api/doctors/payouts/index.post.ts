import { DoctorPayout } from '../../../models/DoctorPayout';
import { User } from '../../../models/User';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const body = await readBody(event);

    if (!body.doctorId || !body.amount || !body.date) {
      throw createError({
        statusCode: 400,
        message: 'Hekim seçimi, ödeme tutarı ve ödeme tarihi zorunludur.'
      });
    }

    const doctorExists = await User.findById(body.doctorId);
    if (!doctorExists) {
      throw createError({
        statusCode: 404,
        message: 'Seçilen hekim bulunamadı.'
      });
    }

    const payout = new DoctorPayout({
      doctorId: body.doctorId,
      amount: Number(body.amount),
      date: body.date,
      paymentMethod: body.paymentMethod || 'cash',
      notes: body.notes ? body.notes.trim() : '',
      createdBy: currentDoctor._id
    });

    await payout.save();
    return payout;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Hekime ödeme kaydedilirken hata oluştu.'
    });
  }
});
