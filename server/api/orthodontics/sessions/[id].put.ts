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

    const normalizeDateStr = (raw: string) => {
      if (!raw) return '';
      const trimmed = String(raw).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        return trimmed.substring(0, 10);
      }
      if (/^\d{2}\.\d{2}\.\d{4}/.test(trimmed)) {
        const parts = trimmed.split('.');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return trimmed;
    };

    const updateData: any = {};
    if (body.doctorId !== undefined) updateData.doctorId = body.doctorId;
    if (body.sessionNumber !== undefined) updateData.sessionNumber = Number(body.sessionNumber);
    if (body.sessionNotes !== undefined) updateData.sessionNotes = body.sessionNotes.trim();
    if (body.archwireUpper !== undefined) updateData.archwireUpper = body.archwireUpper.trim();
    if (body.archwireLower !== undefined) updateData.archwireLower = body.archwireLower.trim();
    if (body.elastics !== undefined) updateData.elastics = body.elastics.trim();
    if (body.date !== undefined) updateData.date = normalizeDateStr(body.date);
    if (body.time !== undefined) updateData.time = body.time;
    if (body.nextAppointmentDate !== undefined) updateData.nextAppointmentDate = normalizeDateStr(body.nextAppointmentDate);
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

    // 1. Seansın kendi randevusunu güncelle/oluştur
    const sessionDate = body.date || session.date;
    const sessionTime = body.time || session.time || '11:00';
    if (sessionDate) {
      try {
        const patient = await Patient.findById(session.patientId);
        const pName = patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'Ortodonti Hastası';
        const pPhone = patient?.phone || '';
        const todayStr = new Date().toISOString().split('T')[0];
        const isFutureOrToday = sessionDate >= todayStr;

        let existingSessionAppt = await Appointment.findOne({
          patientId: session.patientId,
          procedure: new RegExp(`Ortodonti ${session.sessionNumber}\\. Seans`, 'i'),
          isDeleted: { $ne: true }
        });

        if (existingSessionAppt) {
          existingSessionAppt.date = sessionDate;
          existingSessionAppt.time = sessionTime;
          if (body.sessionNotes !== undefined) {
            existingSessionAppt.notes = body.sessionNotes ? `Seans Notu: ${body.sessionNotes.trim()}` : '';
          }
          if (session.doctorId) {
            existingSessionAppt.doctorId = session.doctorId;
          }
          existingSessionAppt.status = isFutureOrToday ? 'pending' : 'completed';
          await existingSessionAppt.save();
        } else {
          const sessionAppt = new Appointment({
            patientId: session.patientId,
            patientName: pName,
            patientPhone: pPhone,
            date: sessionDate,
            time: sessionTime,
            procedure: `Ortodonti ${session.sessionNumber}. Seans`,
            duration: 30,
            notes: (body.sessionNotes || session.sessionNotes) ? `Seans Notu: ${(body.sessionNotes || session.sessionNotes).trim()}` : 'Ortodontik seans',
            status: isFutureOrToday ? 'pending' : 'completed',
            doctorId: session.doctorId
          });
          await sessionAppt.save();
        }
      } catch (apptErr) {
        console.warn('Seans randevusu güncellenirken uyarı:', apptErr);
      }
    }

    // 2. Bir sonraki seans kontrol randevusu
    if (body.nextAppointmentDate) {
      try {
        const patient = await Patient.findById(session.patientId);
        const pName = patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'Ortodonti Hastası';
        const pPhone = patient?.phone || '';

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
            existingAppt.notes = `Ortodonti Notu: ${body.nextAppointmentNotes.trim()}`;
          }
          if (session.doctorId) {
            existingAppt.doctorId = session.doctorId;
          }
          await existingAppt.save();
        } else {
          const nextAppt = new Appointment({
            patientId: session.patientId,
            patientName: pName,
            patientPhone: pPhone,
            date: body.nextAppointmentDate,
            time: body.nextAppointmentTime || '11:00',
            procedure: `Ortodonti ${session.sessionNumber + 1}. Seans Kontrolü`,
            duration: 30,
            notes: body.nextAppointmentNotes ? `Ortodonti Notu: ${body.nextAppointmentNotes.trim()}` : 'Ortodontik seans kontrolü',
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
