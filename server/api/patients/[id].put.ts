import { Patient } from '../../models/Patient';

// Belirli bir hasta profilini günceller
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Hasta ID parametresi gereklidir.'
      });
    }

    const body = await readBody(event);
    if (body.firstName !== undefined || body.lastName !== undefined) {
      const existing = await Patient.findById(id).select('firstName lastName');
      if (existing) {
        const fn = body.firstName !== undefined ? body.firstName : existing.firstName;
        const ln = body.lastName !== undefined ? body.lastName : existing.lastName;
        body.fullName = `${fn || ''} ${ln || ''}`.trim();
      }
    }
    const patient = await Patient.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!patient) {
      throw createError({
        statusCode: 404,
        message: 'Hasta bulunamadı.'
      });
    }

    return patient;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Hasta güncellenirken hata oluştu.'
    });
  }
});
