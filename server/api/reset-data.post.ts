import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { Treatment } from '../models/Treatment';
import { Payment } from '../models/Payment';
import { DentalChart } from '../models/DentalChart';

export default defineEventHandler(async (event) => {
  try {
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Treatment.deleteMany({});
    await Payment.deleteMany({});
    await DentalChart.deleteMany({});

    return {
      success: true,
      message: 'Tüm demo ve veritabanı kayıtları başarıyla sıfırlandı.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Veri sıfırlama hatası: ${error.message}`
    });
  }
});
