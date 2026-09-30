import { User } from '../../models/User';
import { Payment } from '../../models/Payment';
import { Appointment } from '../../models/Appointment';
import { requireDoctor } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentDoctor = await requireDoctor(event);
    const id = event.context.params?.id;

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Hekim ID zorunludur.'
      });
    }

    if (String(currentDoctor._id) === String(id)) {
      throw createError({
        statusCode: 400,
        message: 'Şu an oturum açmış olan hekim hesabı silinemez.'
      });
    }

    const doctor = await User.findById(id);
    if (!doctor) {
      throw createError({
        statusCode: 404,
        message: 'Hekim bulunamadı.'
      });
    }

    const [hasPayments, hasAppointments] = await Promise.all([
      Payment.exists({ doctorId: id }),
      Appointment.exists({ doctorId: id })
    ]);

    if (hasPayments || hasAppointments) {
      doctor.isActive = false;
      if (!doctor.endDate) {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        doctor.endDate = `${y}-${m}-${d}`;
      }
      await doctor.save();
      return {
        success: true,
        deactivated: true,
        message: 'Hekime ait geçmiş finansal/klinik kayıtlar bulunduğu için hesap silinmedi, arşivlendi ve pasife alındı.'
      };
    }

    await User.findByIdAndDelete(id);
    return {
      success: true,
      deleted: true,
      message: 'Hekim kaydı tamamen silindi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Hekim silinirken hata oluştu.'
    });
  }
});
