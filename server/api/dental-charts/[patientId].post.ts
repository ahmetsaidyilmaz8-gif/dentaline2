import { DentalChart } from '../../models/DentalChart';

// Belirli bir hastaya ait diş haritasını kaydeder veya günceller
export default defineEventHandler(async (event) => {
  try {
    const patientId = event.context.params?.patientId;
    if (!patientId) {
      throw createError({
        statusCode: 400,
        message: 'Hasta ID parametresi gereklidir.'
      });
    }

    const body = await readBody(event);
    const chartData = body.chartData || {};

    // Yoksa oluştur, varsa güncelle
    const chart = await DentalChart.findOneAndUpdate(
      { patientId },
      { patientId, chartData },
      { new: true, upsert: true, runValidators: true }
    );

    return chart;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Diş haritası kaydedilirken hata oluştu.'
    });
  }
});
