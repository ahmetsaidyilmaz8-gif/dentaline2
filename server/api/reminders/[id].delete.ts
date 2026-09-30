import { Reminder } from '../../models/Reminder';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const id = event.context.params?.id;

    const reminder = await Reminder.findOneAndDelete({ _id: id, doctorId: currentDoctor._id });
    if (!reminder) {
      throw createError({
        statusCode: 404,
        message: 'Hatırlatıcı bulunamadı.'
      });
    }

    return {
      success: true,
      message: 'Hatırlatıcı kalıcı olarak silindi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Hatırlatıcı silinirken hata oluştu.'
    });
  }
});
