import { Patient } from '../../models/Patient';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const doctor = await requireDoctor(event);
    const body = await readBody(event);
    const { patientId } = body || {};

    if (!patientId) {
      throw createError({
        statusCode: 400,
        message: 'Hasta ID bilgisi gereklidir.'
      });
    }

    const updated = await Patient.findOneAndUpdate(
      { _id: patientId, doctorId: (doctor as any)._id },
      {
        $set: {
          recallDismissed: true,
          recallDismissedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updated) {
      await Patient.findByIdAndUpdate(patientId, {
        $set: {
          recallDismissed: true,
          recallDismissedAt: new Date()
        }
      });
    }

    return {
      success: true,
      message: 'Recall bildirimi veritabanından kalıcı olarak silindi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Recall bildirimi silinirken hata oluştu.'
    });
  }
});
