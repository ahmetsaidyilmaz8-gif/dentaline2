import { Treatment } from '../../models/Treatment';
import { User } from '../../models/User';

// Yeni bir tedavi kaydı oluşturur
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.patientId || !body.procedure || body.fee === undefined) {
      throw createError({
        statusCode: 400,
        message: 'Hasta seçimi, yapılacak işlem ve ücret alanları zorunludur.'
      });
    }

    if (!body.doctorId || String(body.doctorId) === '6aa1cd9f6be357016bee9c25') {
      const defaultDoc = await User.findOne({ username: 'dtselo' }) || await User.findOne({ name: /Selman/i });
      if (defaultDoc) {
        body.doctorId = defaultDoc._id;
      }
    }

    const treatment = new Treatment(body);
    await treatment.save();

    return treatment;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Tedavi kaydedilirken hata oluştu.'
    });
  }
});

