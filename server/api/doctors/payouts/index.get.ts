import { DoctorPayout } from '../../../models/DoctorPayout';
import '../../../models/User';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const query = getQuery(event);
    const doctorId = query.doctorId ? String(query.doctorId) : '';

    const filter: any = {};
    if (doctorId) {
      filter.doctorId = doctorId;
    }

    const payouts = await DoctorPayout.find(filter)
      .populate('doctorId', 'name title rate type')
      .populate('createdBy', 'name')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return payouts;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Hekim ödemeleri listelenirken hata oluştu.'
    });
  }
});
