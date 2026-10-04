import { OrthodonticSession } from '../../../models/OrthodonticSession';
import { Appointment } from '../../../models/Appointment';
import { Patient } from '../../../models/Patient';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const id = event.context.params?.id;
    const body = await readBody(event);

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Seans ID zorunludur.'
      });
    }

    const updateData: any = {};
    if (body.doctorId !== undefined) updateData.doctorId = body.doctorId;
    if (body.sessionNumber !== undefined) updateData.sessionNumber = Number(body.sessionNumber);
    if (body.sessionNotes !== undefined) updateData.sessionNotes = body.sessionNotes.trim();
    if (body.archwireUpper !== undefined) updateData.archwireUpper = body.archwireUpper.trim();
    if (body.archwireLower !== undefined) updateData.archwireLower = body.archwireLower.trim();
    if (body.elastics !== undefined) updateData.elastics = body.elastics.trim();
    if (body.date !== undefined) updateData.date = body.date;
    if (body.time !== undefined) updateData.time = body.time;
    if (body.nextAppointmentDate !== undefined) updateData.nextAppointmentDate = body.nextAppointmentDate;
    if (body.nextAppointmentTime !== undefined) updateData.nextAppointmentTime = body.nextAppointmentTime;
    if (body.nextAppointmentNotes !== undefined) updateData.nextAppointmentNotes = body.nextAppointmentNotes;
    if (body.status !== undefined) updateData.status = body.status;

    const session = await OrthodonticSession.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!session) {
      throw createError({
        statusCode: 404,
        message: 'Seans kaydı bulunamadı.'
      });
    }

    if (body.nextAppointmentDate) {
      try {
        const patient = await Patient.findById(session.patientId);
        let existingAppt = await Appointment.findOne({
          patientId: session.patientId,
          procedure: new RegExp(`Ortodonti .*Seans Kontrolü`, 'i'),
          status: 'pending',
          isDeleted: { $ne: true }
        });

        if (existingAppt) {
          existingAppt.date = body.nextAppointmentDate;
          existingAppt.time = body.nextAppointmentTime || '11:00';
          if (body.nextAppointmentNotes) {
            existingAppt.notes = `Ortodonti Notu: ${body.nextAppointmentNotes}`;
          }
          if (session.doctorId) {
            existingAppt.doctorId = session.doctorId;
          }
          await existingAppt.save();
        } else {
          const nextAppt = new Appointment({
            patientId: session.patientId,
            patientName: patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : '',
            patientPhone: patient?.phone || '',
            date: body.nextAppointmentDate,
            time: body.nextAppointmentTime || '11:00',
            procedure: `Ortodonti ${session.sessionNumber + 1}. Seans Kontrolü`,
            duration: 30,
            notes: body.nextAppointmentNotes ? `Ortodonti Notu: ${body.nextAppointmentNotes}` : 'Ortodontik seans kontrolü',
            status: 'pending',
            doctorId: session.doctorId
          });
          await nextAppt.save();
        }
      } catch (apptErr) {
        console.warn('Otomatik randevu oluşturulurken uyarı:', apptErr);
      }
    }

    return session;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Seans güncellenirken hata oluştu.'
    });
  }
});
