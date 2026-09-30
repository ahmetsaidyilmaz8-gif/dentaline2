import { Patient } from '../../../models/Patient';
import { Treatment } from '../../../models/Treatment';
import { Payment } from '../../../models/Payment';
import { requireDoctor } from '../../../utils/auth';
import mongoose from 'mongoose';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const patientId = event.context.params?.id;

    if (!patientId) {
      throw createError({ statusCode: 400, message: 'Hasta ID bilgisi gereklidir.' });
    }

    const currentPatient = await Patient.findById(patientId)
      .select('_id firstName lastName phone tcNo familyMembers')
      .lean();

    if (!currentPatient) {
      throw createError({ statusCode: 404, message: 'Hasta bulunamadı.' });
    }

    const directMembers = (currentPatient as any).familyMembers || [];
    const reverseLinkedPatients = await Patient.find({
      'familyMembers.patientId': currentPatient._id,
      _id: { $ne: currentPatient._id }
    }).select('_id firstName lastName phone tcNo familyMembers').lean();

    const memberMap = new Map();
    directMembers.forEach((m: any) => {
      if (m.patientId) {
        memberMap.set(String(m.patientId), {
          patientId: String(m.patientId),
          relation: m.relation || 'Aile Bireyi',
          notes: m.notes || ''
        });
      }
    });

    reverseLinkedPatients.forEach((rp: any) => {
      const rpId = String(rp._id);
      if (!memberMap.has(rpId)) {
        const link = (rp.familyMembers || []).find((m: any) => String(m.patientId) === String(currentPatient._id));
        let reverseRelation = 'Aile Bireyi';
        if (link?.relation === 'Çocuk') reverseRelation = 'Ebeveyn';
        else if (link?.relation === 'Ebeveyn') reverseRelation = 'Çocuk';
        else if (link?.relation) reverseRelation = link.relation;

        memberMap.set(rpId, {
          patientId: rpId,
          relation: reverseRelation,
          notes: link?.notes || ''
        });
      }
    });

    const allMemberIds = Array.from(memberMap.keys());
    const queryIds = [String(currentPatient._id), ...allMemberIds];

    const memberPatients = await Patient.find({
      _id: { $in: allMemberIds }
    }).select('_id firstName lastName phone tcNo').lean();

    const memberPatientMap = new Map();
    memberPatients.forEach((p) => memberPatientMap.set(String(p._id), p));

    const objectIds = queryIds.map((id) => new mongoose.Types.ObjectId(id));

    const [treatmentsAgg, paymentsAgg] = await Promise.all([
      Treatment.aggregate([
        { $match: { patientId: { $in: objectIds } } },
        { $group: { _id: '$patientId', totalFee: { $sum: '$fee' } } }
      ]),
      Payment.aggregate([
        { $match: { patientId: { $in: objectIds } } },
        { $group: { _id: '$patientId', totalPaid: { $sum: '$amount' } } }
      ])
    ]);

    const feeMap = new Map();
    treatmentsAgg.forEach((t) => feeMap.set(String(t._id), t.totalFee || 0));

    const paidMap = new Map();
    paymentsAgg.forEach((p) => paidMap.set(String(p._id), p.totalPaid || 0));

    const currentFee = feeMap.get(String(currentPatient._id)) || 0;
    const currentPaid = paidMap.get(String(currentPatient._id)) || 0;
    const currentBalance = Math.round((currentFee - currentPaid) * 100) / 100;

    const familyList = allMemberIds.map((id) => {
      const p: any = memberPatientMap.get(id);
      const meta = memberMap.get(id);
      const fee = feeMap.get(id) || 0;
      const paid = paidMap.get(id) || 0;
      const balance = Math.round((fee - paid) * 100) / 100;

      return {
        patientId: id,
        firstName: p?.firstName || '',
        lastName: p?.lastName || '',
        fullName: `${p?.firstName || ''} ${p?.lastName || ''}`.trim() || 'Aile Bireyi',
        phone: p?.phone || '',
        tcNo: p?.tcNo || '',
        relation: meta?.relation || 'Aile Bireyi',
        notes: meta?.notes || '',
        totalFee: Math.round(fee * 100) / 100,
        totalPaid: Math.round(paid * 100) / 100,
        remainingDebt: balance > 0 ? balance : 0,
        balance
      };
    });

    let totalFamilyDebt = currentBalance > 0 ? currentBalance : 0;
    familyList.forEach((m) => {
      if (m.balance > 0) {
        totalFamilyDebt += m.balance;
      }
    });
    totalFamilyDebt = Math.round(totalFamilyDebt * 100) / 100;

    return {
      currentPatient: {
        _id: currentPatient._id,
        fullName: `${(currentPatient as any).firstName || ''} ${(currentPatient as any).lastName || ''}`.trim(),
        totalFee: currentFee,
        totalPaid: currentPaid,
        remainingDebt: currentBalance > 0 ? currentBalance : 0,
        balance: currentBalance
      },
      familyMembers: familyList,
      totalFamilyDebt,
      hasFamily: familyList.length > 0
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Aile bilgileri alınırken hata oluştu.'
    });
  }
});
