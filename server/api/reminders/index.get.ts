import { Reminder } from '../../models/Reminder';
import '../../models/Patient';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const query = getQuery(event);

    const filter: any = {
      doctorId: currentDoctor._id,
      status: { $ne: 'completed' }
    };

    if (query.patientId) {
      filter.patientId = query.patientId;
    }
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }
    if (query.category) {
      filter.category = query.category;
    }

    const reminders = await Reminder.find(filter)
      .populate('patientId', 'firstName lastName phone')
      .sort({ reminderDate: 1, createdAt: -1 })
      .lean();

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const formatted = reminders.map((r: any) => {
      const isSnoozed = Boolean(r.snoozedUntil && r.snoozedUntil > todayStr);
      const isDue = r.reminderDate <= todayStr && !isSnoozed;
      let pName = r.patientName || '';
      let pPhone = r.patientPhone || '';

      if (r.patientId && typeof r.patientId === 'object') {
        const fn = r.patientId.firstName || '';
        const ln = r.patientId.lastName || '';
        pName = `${fn} ${ln}`.trim() || pName;
        pPhone = r.patientId.phone || pPhone;
      }

      return {
        ...r,
        _id: String(r._id),
        patientName: pName,
        patientPhone: pPhone,
        isDue,
        isSnoozed,
        isToday: r.targetDate === todayStr
      };
    });

    return {
      success: true,
      count: formatted.length,
      data: formatted
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Hatırlatıcılar yüklenirken bir hata oluştu.'
    });
  }
});
