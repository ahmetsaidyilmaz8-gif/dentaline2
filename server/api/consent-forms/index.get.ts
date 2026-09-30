import { ConsentForm } from '../../models/ConsentForm';

// İmzalı dijital onam formlarını listeler (opsiyonel patientId filtresi ile)
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const filter: Record<string, any> = {};

    if (query.patientId) {
      filter.patientId = query.patientId;
    }

    const forms = await ConsentForm.find(filter).sort({ signedAt: -1, createdAt: -1 });
    return forms;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Onam formları yüklenirken hata oluştu.'
    });
  }
});
