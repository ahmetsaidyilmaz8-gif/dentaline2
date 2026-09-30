import { Patient } from '../../models/Patient';
import { Treatment } from '../../models/Treatment';
import { Payment } from '../../models/Payment';
import { Appointment } from '../../models/Appointment';
import { DentalChart } from '../../models/DentalChart';
import { OrthodonticPlan } from '../../models/OrthodonticPlan';
import { OrthodonticSession } from '../../models/OrthodonticSession';
import { DoctorPayout } from '../../models/DoctorPayout';
import { LabWork } from '../../models/LabWork';
import { ConsentForm } from '../../models/ConsentForm';
import { ClinicSetting } from '../../models/ClinicSetting';
import { User } from '../../models/User';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);

    const lastBackupSetting = await ClinicSetting.findOne({ key: 'last_backup_info' }).lean();
    const lastBackup = (lastBackupSetting as any)?.value || null;

    const [
      patientsCount,
      treatmentsCount,
      paymentsCount,
      appointmentsCount,
      dentalChartsCount,
      orthodonticPlansCount,
      orthodonticSessionsCount,
      doctorPayoutsCount,
      labWorksCount,
      consentFormsCount,
      doctorsCount
    ] = await Promise.all([
      Patient.countDocuments(),
      Treatment.countDocuments(),
      Payment.countDocuments(),
      Appointment.countDocuments(),
      DentalChart.countDocuments(),
      OrthodonticPlan.countDocuments(),
      OrthodonticSession.countDocuments(),
      DoctorPayout.countDocuments(),
      LabWork.countDocuments(),
      ConsentForm.countDocuments(),
      User.countDocuments()
    ]);

    const totalRecords = patientsCount + treatmentsCount + paymentsCount + appointmentsCount + dentalChartsCount + orthodonticPlansCount + orthodonticSessionsCount + doctorPayoutsCount + labWorksCount + consentFormsCount;

    return {
      lastBackup,
      counts: {
        patients: patientsCount,
        treatments: treatmentsCount,
        payments: paymentsCount,
        appointments: appointmentsCount,
        dentalCharts: dentalChartsCount,
        orthodonticPlans: orthodonticPlansCount,
        orthodonticSessions: orthodonticSessionsCount,
        doctorPayouts: doctorPayoutsCount,
        labWorks: labWorksCount,
        consentForms: consentFormsCount,
        doctors: doctorsCount,
        total: totalRecords
      }
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Yedekleme durumu alınırken bir hata oluştu.'
    });
  }
});
