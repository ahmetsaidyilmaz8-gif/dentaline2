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
import mongoose from 'mongoose';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const body = await readBody(event);

    if (!body) {
      throw createError({
        statusCode: 400,
        message: 'Geri yüklenecek yedek verisi boş olamaz.'
      });
    }

    const backupData = body.data || body;
    const mode = body.mode || 'merge';

    if (!backupData || typeof backupData !== 'object') {
      throw createError({
        statusCode: 400,
        message: 'Geçersiz yedek dosyası biçimi.'
      });
    }

    const {
      patients = [],
      treatments = [],
      payments = [],
      appointments = [],
      dentalCharts = [],
      orthodonticPlans = [],
      orthodonticSessions = [],
      doctorPayouts = [],
      labWorks = [],
      consentForms = [],
      reminders = [],
      users = []
    } = backupData;

    const restoredCounts: Record<string, number> = {
      patients: 0,
      treatments: 0,
      payments: 0,
      appointments: 0,
      dentalCharts: 0,
      orthodonticPlans: 0,
      orthodonticSessions: 0,
      doctorPayouts: 0,
      labWorks: 0,
      consentForms: 0,
      reminders: 0,
      users: 0
    };

    const restoreCollection = async (Model: any, items: any[], keyName: string) => {
      if (!Array.isArray(items) || items.length === 0) return;

      if (mode === 'overwrite') {
        if (keyName === 'users') {
          const currentId = (currentDoctor as any)._id;
          await Model.deleteMany({ _id: { $ne: currentId } });
        } else {
          await Model.deleteMany({});
        }

        if (items.length > 0) {
          try {
            await Model.insertMany(items, { ordered: false });
            restoredCounts[keyName] = items.length;
          } catch (e) {
            let count = 0;
            for (const item of items) {
              try {
                await Model.updateOne(
                  { _id: item._id || new mongoose.Types.ObjectId() },
                  { $set: item },
                  { upsert: true }
                );
                count++;
              } catch {}
            }
            restoredCounts[keyName] = count;
          }
        }
      } else {
        let count = 0;
        for (const item of items) {
          try {
            if (item._id) {
              await Model.updateOne(
                { _id: item._id },
                { $set: item },
                { upsert: true }
              );
            } else {
              const doc = new Model(item);
              await doc.save();
            }
            count++;
          } catch (err) {
            console.error(`Error merging item in ${keyName}:`, err);
          }
        }
        restoredCounts[keyName] = count;
      }
    };

    await restoreCollection(User, users, 'users');
    await restoreCollection(Patient, patients, 'patients');
    await restoreCollection(Treatment, treatments, 'treatments');
    await restoreCollection(Payment, payments, 'payments');
    await restoreCollection(Appointment, appointments, 'appointments');
    await restoreCollection(DentalChart, dentalCharts, 'dentalCharts');
    await restoreCollection(OrthodonticPlan, orthodonticPlans, 'orthodonticPlans');
    await restoreCollection(OrthodonticSession, orthodonticSessions, 'orthodonticSessions');
    await restoreCollection(DoctorPayout, doctorPayouts, 'doctorPayouts');
    await restoreCollection(LabWork, labWorks, 'labWorks');
    await restoreCollection(ConsentForm, consentForms, 'consentForms');
    await restoreCollection(Reminder, reminders, 'reminders');

    const now = new Date();
    await ClinicSetting.findOneAndUpdate(
      { key: 'last_restore_info' },
      {
        value: {
          date: now.toISOString(),
          by: (currentDoctor as any).name || 'Klinik',
          mode,
          counts: restoredCounts
        },
        updatedAt: now
      },
      { upsert: true, new: true }
    );

    const totalRestored = Object.values(restoredCounts).reduce((a, b) => a + b, 0);

    return {
      success: true,
      message: `Yedekleme başarıyla geri yüklendi. Toplam ${totalRestored} kayıt işlendi.`,
      mode,
      restoredCounts,
      totalRestored
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Yedek geri yüklenirken bir hata oluştu.'
    });
  }
});
