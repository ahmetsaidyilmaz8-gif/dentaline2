import { Treatment } from '../../models/Treatment';

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

