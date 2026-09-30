import { Patient } from '../../models/Patient';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const doctor = await requireDoctor(event);
    const body = await readBody(event);
    const { patientId, snoozeUntil } = body || {};

    if (!patientId || !snoozeUntil) {
      throw createError({
        statusCode: 400,
        message: 'Hasta ID ve erteleme tarihi gereklidir.'
      });
    }

    const updated = await Patient.findOneAndUpdate(
      { _id: patientId, doctorId: (doctor as any)._id },
      {
        $set: {
          recallSnoozedUntil: snoozeUntil
        }
      },
      { new: true }
    );

    if (!updated) {
      await Patient.findByIdAndUpdate(patientId, {
        $set: {
          recallSnoozedUntil: snoozeUntil
        }
      });
    }

    return {
      success: true,
      message: `Recall bildirimi ${snoozeUntil} tarihine kadar ertelendi.`
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Recall bildirimi ertelenirken hata oluştu.'
    });
  }
});
