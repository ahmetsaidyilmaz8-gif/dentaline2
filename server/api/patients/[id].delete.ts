import { Patient } from '../../models/Patient';
import { Appointment } from '../../models/Appointment';
import { Treatment } from '../../models/Treatment';
import { Payment } from '../../models/Payment';
import { DentalChart } from '../../models/DentalChart';

// Belirli bir hastayı ve ilişkili tüm alt verileri (Randevu, Tedavi, Ödeme, Diş Haritası) siler
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Hasta ID parametresi gereklidir.'
      });
    }

    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      throw createError({
        statusCode: 404,
        message: 'Hasta bulunamadı.'
      });
    }

    // İlişkili tüm verileri temizle (Cascade silme)
    await Appointment.deleteMany({ patientId: id });
    await Treatment.deleteMany({ patientId: id });
    await Payment.deleteMany({ patientId: id });
    await DentalChart.deleteOne({ patientId: id });

    return {
      success: true,
      message: 'Hasta ve ilişkili tüm veriler başarıyla silindi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Hasta silinirken hata oluştu.'
    });
  }
});
