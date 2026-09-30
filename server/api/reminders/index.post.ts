import { Reminder } from '../../models/Reminder';
import { Patient } from '../../models/Patient';
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
    const body = await readBody(event);
    const note = (body?.note || '').trim();
    const targetDate = (body?.targetDate || '').trim();
    const leadDays = Number(body?.leadDays) || 0;
    const category = body?.category || 'treatment';

    if (!note) {
      throw createError({
        statusCode: 400,
        message: 'Lütfen hatırlatıcı notunu giriniz.'
      });
    }

    if (!targetDate) {
      throw createError({
        statusCode: 400,
        message: 'Lütfen hedef tarihi belirleyiniz.'
      });
    }

    let patientName = (body?.patientName || '').trim();
    let patientPhone = (body?.patientPhone || '').trim();
    const patientId = body?.patientId || null;

    if (patientId) {
      const p = await Patient.findById(patientId);
      if (p) {
        patientName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
        patientPhone = p.phone || patientPhone;
      }
    }

    const reminderDate = calculateReminderDate(targetDate, leadDays);
    const reminder = new Reminder({
      patientId,
      patientName,
      patientPhone,
      category,
      note,
      targetDate,
      leadDays,
      reminderDate,
      status: 'active',
      snoozedUntil: null,
      doctorId: currentDoctor._id
    });

    await reminder.save();
    return {
      success: true,
      data: reminder
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Hatırlatıcı kaydedilirken bir hata oluştu.'
    });
  }
});
