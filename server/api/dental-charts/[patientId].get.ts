import { DentalChart } from '../../models/DentalChart';

// Belirli bir hastaya ait diş haritasını getirir
export default defineEventHandler(async (event) => {
  try {
    const patientId = event.context.params?.patientId;
    if (!patientId) {
      throw createError({
        statusCode: 400,
        message: 'Hasta ID parametresi gereklidir.'
      });
    }

    const chart = await DentalChart.findOne({ patientId });
    if (!chart) {
      // Henüz kaydedilmiş diş haritası yoksa boş yapıda döner
      return {
        patientId,
        chartData: {}
      };
    }

    return chart;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Diş haritası yüklenirken hata oluştu: ${error.message}`
    });
  }
});
