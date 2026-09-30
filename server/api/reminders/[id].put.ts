import { Reminder } from '../../models/Reminder';
import { requireDoctor } from '../../utils/auth';

function calculateReminderDate(targetDateStr: string, leadDays: number) {
  const parts = targetDateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return targetDateStr;
  }
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() - (Number(leadDays) || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const id = event.context.params?.id;
    const body = await readBody(event);

    const reminder = await Reminder.findOne({ _id: id, doctorId: currentDoctor._id });
    if (!reminder) {
      throw createError({
        statusCode: 404,
        message: 'Hatırlatıcı bulunamadı.'
      });
    }

    if (body.status !== undefined) {
      reminder.status = body.status;
    }
    if (body.snoozedUntil !== undefined) {
      reminder.snoozedUntil = body.snoozedUntil;
      if (!body.snoozedUntil && reminder.status === 'hidden') {
        reminder.status = 'active';
      }
    }
    if (body.note !== undefined) {
      reminder.note = String(body.note).trim();
    }
    if (body.targetDate !== undefined) {
      reminder.targetDate = body.targetDate;
    }
    if (body.leadDays !== undefined) {
      reminder.leadDays = Number(body.leadDays) || 0;
    }
    if (body.targetDate !== undefined || body.leadDays !== undefined) {
      reminder.reminderDate = calculateReminderDate(reminder.targetDate, reminder.leadDays);
    }

    await reminder.save();
    return {
      success: true,
      data: reminder
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Hatırlatıcı güncellenirken hata oluştu.'
    });
  }
});
