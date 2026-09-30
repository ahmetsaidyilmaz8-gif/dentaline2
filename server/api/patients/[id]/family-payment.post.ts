import { Patient } from '../../../models/Patient';
import { Payment } from '../../../models/Payment';
import { User } from '../../../models/User';
import { requireDoctor } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    await requireDoctor(event);
    const patientId = event.context.params?.id;
    const body = await readBody(event);
    const {
      distributions, // [{ patientId, amount, patientName }]
      method = 'cash',
      doctorId,
      date = new Date().toISOString().split('T')[0],
      notes = ''
    } = body || {};

    if (!patientId) {
      throw createError({ statusCode: 400, message: 'Ödeyen hasta ID bilgisi gereklidir.' });
    }
    if (!Array.isArray(distributions) || distributions.length === 0) {
      throw createError({ statusCode: 400, message: 'Dağıtılacak ödeme satırları gereklidir.' });
    }

    const payer = await Patient.findById(patientId).select('firstName lastName fullName').lean();
    const payerName = payer ? `${(payer as any).firstName || ''} ${(payer as any).lastName || ''}`.trim() : 'Aile Bireyi';

    let doctorRate = 30;
    if (doctorId) {
      const doc = await User.findById(doctorId).select('rate type').lean();
      if (doc && (doc as any).rate !== undefined) {
        doctorRate = (doc as any).rate;
      }
    }

    const createdPayments = [];
    for (const dist of distributions) {
      const amt = Number(dist.amount);
      if (!amt || amt <= 0) continue;
      const targetPid = dist.patientId;
      const docEarning = Math.round(amt * (doctorRate / 100) * 100) / 100;
      const paymentNote = `Aile Tahsilatı (Ödeyen: ${payerName})${notes ? ` - ${notes}` : ''}`;

      const payment = new Payment({
        patientId: targetPid,
        amount: amt,
        method,
        date,
        doctorId: doctorId || null,
        doctorRate,
        doctorEarning: docEarning,
        notes: paymentNote
      });
      await payment.save();
      createdPayments.push(payment);
    }

    return {
      success: true,
      count: createdPayments.length,
      message: `${createdPayments.length} aile bireyine toplam ödeme başarıyla dağıtıldı ve cari hesaplarına işlendi.`
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Aile ödemesi dağıtılırken hata oluştu.'
    });
  }
});
