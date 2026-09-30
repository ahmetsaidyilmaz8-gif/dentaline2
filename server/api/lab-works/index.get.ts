import { LabWork } from '../../models/LabWork';

// Laboratuvar işlerini listeler (opsiyonel patientId ve status filtresi ile)
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const filter: Record<string, any> = {};

    if (query.patientId) {
      filter.patientId = query.patientId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const labWorks = await LabWork.find(filter).sort({ expectedDate: 1, createdAt: -1 });
    return labWorks;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Laboratuvar işleri yüklenirken hata oluştu.'
    });
  }
});
