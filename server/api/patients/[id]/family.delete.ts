import { Patient } from '../../../models/Patient';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const patientId = event.context.params?.id;
    const body = await readBody(event);
    const { targetPatientId } = body || {};

    if (!patientId || !targetPatientId) {
      throw createError({ statusCode: 400, message: 'Hasta ID ve kaldırılacak birey ID gereklidir.' });
    }

    await Promise.all([
      Patient.findByIdAndUpdate(patientId, {
        $pull: { familyMembers: { patientId: targetPatientId } }
      }),
      Patient.findByIdAndUpdate(targetPatientId, {
        $pull: { familyMembers: { patientId } }
      })
    ]);

    return {
      success: true,
      message: 'Aile bağı başarıyla kaldırıldı.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Aile bağı kaldırılırken hata oluştu.'
    });
  }
});
