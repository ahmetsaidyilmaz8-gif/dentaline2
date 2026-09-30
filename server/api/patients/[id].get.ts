import { Patient } from '../../models/Patient';
import { Treatment } from '../../models/Treatment';
import { Payment } from '../../models/Payment';
import { Appointment } from '../../models/Appointment';
import { LabWork } from '../../models/LabWork';
import { ConsentForm } from '../../models/ConsentForm';

// Belirli bir hastanın tüm detaylarını, randevularını, tedavilerini, ödemelerini, laboratuvar ve onam kayıtlarını getirir
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Hasta ID parametresi gereklidir.'
      });
    }

    const patient = await Patient.findById(id);
    if (!patient) {
      throw createError({
        statusCode: 404,
        message: 'Hasta bulunamadı.'
      });
    }

    // Hastayla ilişkili diğer verileri sorgula
    const treatments = await Treatment.find({ patientId: id }).sort({ date: -1, createdAt: -1 });
    const payments = await Payment.find({ patientId: id }).sort({ date: -1, createdAt: -1 });
    const appointments = await Appointment.find({ patientId: id }).sort({ date: -1, time: -1 });
    const labWorks = await LabWork.find({ patientId: id }).sort({ expectedDate: 1, createdAt: -1 });
    const consentForms = await ConsentForm.find({ patientId: id }).sort({ signedAt: -1, createdAt: -1 });

    // Finansal toplamları hesapla
    const totalFee = treatments.reduce((sum, t) => sum + (t.fee || 0), 0);
    const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const balance = totalFee - totalPaid; // Pozitif: borçlu, Negatif: alacaklı

    return {
      patient,
      treatments,
      payments,
      appointments,
      labWorks,
      consentForms,
      financials: {
        totalFee,
        totalPaid,
        balance
      }
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Hasta detayları yüklenirken bir hata oluştu.'
    });
  }
});
