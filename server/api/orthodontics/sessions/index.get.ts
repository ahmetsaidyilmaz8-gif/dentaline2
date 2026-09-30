import { OrthodonticSession } from '../../../models/OrthodonticSession';
import '../../../models/Patient';
import '../../../models/User';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const query = getQuery(event);
    const patientId = query.patientId ? String(query.patientId) : '';
    const planId = query.planId ? String(query.planId) : '';
    const doctorId = query.doctorId ? String(query.doctorId) : '';

    const filter: any = {};
    if (patientId) filter.patientId = patientId;
    if (planId) filter.planId = planId;
    if (doctorId) filter.doctorId = doctorId;

    const sessions = await OrthodonticSession.find(filter)
      .populate('patientId', 'firstName lastName phone')
      .populate('doctorId', 'name title')
      .sort({ sessionNumber: 1, date: 1 })
      .lean();

    return sessions;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Seans kayıtları listelenirken hata oluştu.'
    });
  }
});
