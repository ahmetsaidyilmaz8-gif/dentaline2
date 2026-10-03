import { OrthodonticSession } from '../../../models/OrthodonticSession';
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

    return session;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Seans güncellenirken hata oluştu.'
    });
  }
});
