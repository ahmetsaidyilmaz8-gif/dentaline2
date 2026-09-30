import { Patient } from '../../../models/Patient';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const patientId = event.context.params?.id;
    const body = await readBody(event);
    const { targetPatientId, relation, notes } = body || {};

    if (!patientId || !targetPatientId) {
      throw createError({ statusCode: 400, message: 'Ana hasta ID ve bağlanacak hasta ID gereklidir.' });
    }

    if (String(patientId) === String(targetPatientId)) {
      throw createError({ statusCode: 400, message: 'Hasta kendisini aile bireyi olarak ekleyemez.' });
    }

    const [patientA, patientB] = await Promise.all([
      Patient.findById(patientId),
      Patient.findById(targetPatientId)
    ]);

    if (!patientA || !patientB) {
      throw createError({ statusCode: 404, message: 'Hasta kayıtlarından biri veya her ikisi bulunamadı.' });
    }

    const existsInA = (patientA.familyMembers || []).some(
      (m: any) => String(m.patientId) === String(targetPatientId)
    );

    if (!existsInA) {
      patientA.familyMembers.push({
        patientId: patientB._id,
        relation: relation || 'Aile Bireyi',
        notes: notes || ''
      });
      await patientA.save();
    }

    let reverseRelation = 'Aile Bireyi';
    if (relation === 'Çocuk') reverseRelation = 'Ebeveyn';
    else if (relation === 'Ebeveyn') reverseRelation = 'Çocuk';
    else if (relation === 'Eş') reverseRelation = 'Eş';
    else if (relation === 'Kardeş') reverseRelation = 'Kardeş';

    const existsInB = (patientB.familyMembers || []).some(
      (m: any) => String(m.patientId) === String(patientId)
    );

    if (!existsInB) {
      patientB.familyMembers.push({
        patientId: patientA._id,
        relation: reverseRelation,
        notes: notes || ''
      });
      await patientB.save();
    }

    return {
      success: true,
      message: `${patientB.firstName} ${patientB.lastName} aile bireyi olarak başarıyla bağlandı.`
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Aile bireyi bağlanırken hata oluştu.'
    });
  }
});
