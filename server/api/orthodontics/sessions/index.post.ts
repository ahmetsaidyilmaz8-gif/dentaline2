import { OrthodonticSession } from '../../../models/OrthodonticSession';
import { Appointment } from '../../../models/Appointment';
import { Patient } from '../../../models/Patient';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const body = await readBody(event);

    if (!body.patientId || !body.date || !body.sessionNotes) {
      throw createError({
        statusCode: 400,
        message: 'Hasta seçimi, seans tarihi ve seans notu (yapılan işlem) zorunludur.'
      });
    }

    const patient = await Patient.findById(body.patientId);
    if (!patient) {
      throw createError({
        statusCode: 404,
        message: 'Hasta bulunamadı.'
      });
    }

    const doctorId = body.doctorId || patient.doctorId || currentDoctor._id;
    let sessionNumber = Number(body.sessionNumber);
    if (!sessionNumber || sessionNumber < 1) {
      const lastSession = await OrthodonticSession.findOne({ patientId: body.patientId })
        .sort({ sessionNumber: -1 })
        .lean();
      sessionNumber = ((lastSession as any)?.sessionNumber || 0) + 1;
    }

    const session = new OrthodonticSession({
      patientId: body.patientId,
      planId: body.planId || null,
      doctorId,
      sessionNumber,
      date: body.date,
      time: body.time || '10:00',
      sessionNotes: body.sessionNotes.trim(),
      archwireUpper: body.archwireUpper ? body.archwireUpper.trim() : '',
      archwireLower: body.archwireLower ? body.archwireLower.trim() : '',
      elastics: body.elastics ? body.elastics.trim() : '',
      nextAppointmentDate: body.nextAppointmentDate || '',
      nextAppointmentNotes: body.nextAppointmentNotes ? body.nextAppointmentNotes.trim() : '',
      status: body.status || 'completed'
    });

    await session.save();

    if (body.nextAppointmentDate) {
      try {
        const nextAppt = new Appointment({
          patientId: body.patientId,
          date: body.nextAppointmentDate,
          time: body.nextAppointmentTime || '11:00',
          procedure: `Ortodonti ${sessionNumber + 1}. Seans Kontrolü`,
          duration: 30,
          notes: body.nextAppointmentNotes ? `Ortodonti Notu: ${body.nextAppointmentNotes}` : 'Ortodontik seans kontrolü',
          status: 'pending',
          doctorId
        });
        await nextAppt.save();
      } catch (apptErr) {
        console.warn('Otomatik randevu oluşturulurken uyarı:', apptErr);
      }
    }

    return session;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Seans kaydedilirken hata oluştu.'
    });
  }
});
