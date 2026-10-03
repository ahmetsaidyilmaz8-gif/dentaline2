import { Patient } from '../../models/Patient';
import { Treatment } from '../../models/Treatment';
import { Payment } from '../../models/Payment';
import { Appointment } from '../../models/Appointment';
import { LabWork } from '../../models/LabWork';
import { ConsentForm } from '../../models/ConsentForm';
import { OrthodonticPlan } from '../../models/OrthodonticPlan';
import { OrthodonticSession } from '../../models/OrthodonticSession';

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

    // Hastayla ilişkili diğer verileri paralel sorgula
    const [
      treatments,
      payments,
      appointments,
      labWorks,
      consentForms,
      orthodonticPlan,
      orthodonticSessions
    ] = await Promise.all([
      Treatment.find({ patientId: id }).populate('doctorId', 'name username title rate').sort({ date: -1, createdAt: -1 }),
      Payment.find({ patientId: id }).populate('doctorId', 'name username title rate').sort({ date: -1, createdAt: -1 }),
      Appointment.find({ patientId: id }).populate('doctorId', 'name username title').sort({ date: -1, time: -1 }),
      LabWork.find({ patientId: id }).sort({ expectedDate: 1, createdAt: -1 }),
      ConsentForm.find({ patientId: id }).sort({ signedAt: -1, createdAt: -1 }),
      OrthodonticPlan.findOne({ patientId: id, status: { $ne: 'cancelled' } }).populate('doctorId', 'name username title rate').sort({ createdAt: -1 }),
      OrthodonticSession.find({ patientId: id }).populate('doctorId', 'name username title rate').sort({ sessionNumber: -1, date: -1 })
    ]);

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
      orthodonticPlan,
      orthodonticSessions,
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
