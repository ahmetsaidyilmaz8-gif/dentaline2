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
import { Reminder } from '../../models/Reminder';
import { ClinicSetting } from '../../models/ClinicSetting';
import { User } from '../../models/User';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);

    const [
      patients,
      treatments,
      payments,
      appointments,
      dentalCharts,
      orthodonticPlans,
      orthodonticSessions,
      doctorPayouts,
      labWorks,
      consentForms,
      reminders,
      users
    ] = await Promise.all([
      Patient.find({}).lean(),
      Treatment.find({}).lean(),
      Payment.find({}).lean(),
      Appointment.find({}).lean(),
      DentalChart.find({}).lean(),
      OrthodonticPlan.find({}).lean(),
      OrthodonticSession.find({}).lean(),
      DoctorPayout.find({}).lean(),
      LabWork.find({}).lean(),
      ConsentForm.find({}).lean(),
      Reminder.find({}).lean(),
      User.find({}).lean()
    ]);

    const counts = {
      patients: patients.length,
      treatments: treatments.length,
      payments: payments.length,
      appointments: appointments.length,
      dentalCharts: dentalCharts.length,
      orthodonticPlans: orthodonticPlans.length,
      orthodonticSessions: orthodonticSessions.length,
      doctorPayouts: doctorPayouts.length,
      labWorks: labWorks.length,
      consentForms: consentForms.length,
      reminders: reminders.length,
      users: users.length,
      total: patients.length + treatments.length + payments.length + appointments.length + dentalCharts.length + orthodonticPlans.length + orthodonticSessions.length + doctorPayouts.length + labWorks.length + consentForms.length + reminders.length
    };

    const now = new Date();
    const isoDate = now.toISOString();

    await ClinicSetting.findOneAndUpdate(
      { key: 'last_backup_info' },
      {
        value: {
          date: isoDate,
          by: (currentDoctor as any).name || 'Klinik',
          counts
        },
        updatedAt: now
      },
      { upsert: true, new: true }
    );

    const backupData = {
      meta: {
        appName: 'TenaxLine Clinic Suite',
        version: '2.0',
        exportedAt: isoDate,
        exportedBy: (currentDoctor as any).name || 'Klinik',
        counts
      },
      data: {
        patients,
        treatments,
        payments,
        appointments,
        dentalCharts,
        orthodonticPlans,
        orthodonticSessions,
        doctorPayouts,
        labWorks,
        consentForms,
        reminders,
        users
      }
    };

    const dateSlug = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `tenaxline-yedek-${dateSlug}.json`;
    const query = getQuery(event);
    const contentType = query.download ? 'application/octet-stream' : 'application/json; charset=utf-8';

    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    });

    return backupData;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Yedekleme dosyası oluşturulurken bir hata oluştu.'
    });
  }
});
