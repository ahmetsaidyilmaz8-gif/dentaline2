import { OrthodonticPlan } from '../../../models/OrthodonticPlan';
import { Treatment } from '../../../models/Treatment';
import { Payment } from '../../../models/Payment';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const id = event.context.params?.id;

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Plan ID zorunludur.'
      });
    }

    const plan = await OrthodonticPlan.findById(id);
    if (!plan) {
      throw createError({
        statusCode: 404,
        message: 'Silinecek ortodonti anlaşması bulunamadı.'
      });
    }

    if (plan.treatmentId) {
      await Treatment.findByIdAndDelete(plan.treatmentId);
    } else {
      await Treatment.findOneAndDelete({
        patientId: plan.patientId,
        procedure: { $regex: 'Ortodonti Tedavi Anlaşması' }
      });
    }

    await Payment.deleteMany({ orthodonticPlanId: plan._id });
    await OrthodonticPlan.findByIdAndDelete(id);

    return {
      success: true,
      message: 'Ortodonti anlaşması ve bağlı kayıtları başarıyla silindi.'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Anlaşma silinirken hata oluştu.'
    });
  }
});
