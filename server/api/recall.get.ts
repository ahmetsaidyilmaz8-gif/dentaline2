import { Treatment } from '../models/Treatment';
import { Patient } from '../models/Patient';
import { DentalChart } from '../models/DentalChart';

// Otomatik Geri Çağırma (Recall) Hesaplama API'si
export default defineEventHandler(async (event) => {
  try {
    const now = new Date();

    // Zaman eşikleri
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);

    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
    const fortyFiveDaysAgoStr = fortyFiveDaysAgo.toISOString().split('T')[0];

    // Tüm tedavileri hastalarıyla birlikte çek
    const allTreatments = await Treatment.find()
      .populate('patientId', 'firstName lastName phone')
      .lean();

    // Hasta bazında tedavileri grupla
    const patientTreatmentsMap = new Map();
    for (const t of allTreatments) {
      if (!t.patientId || !t.patientId._id) continue;
      const pid = String(t.patientId._id);
      if (!patientTreatmentsMap.has(pid)) {
        patientTreatmentsMap.set(pid, {
          patient: t.patientId,
          treatments: []
        });
      }
      patientTreatmentsMap.get(pid).treatments.push(t);
    }

    const recalls = [];

    for (const [pid, data] of patientTreatmentsMap.entries()) {
      const { patient, treatments } = data;
      const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Hasta';
      const phone = patient.phone || '';

      // Tedavileri tarihe göre sırala (en yeniden en eskiye)
      treatments.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''));
      const latestTreatment = treatments[0];
      const latestDateStr = latestTreatment.date;

      // 1. İmplant Kontrolü: Herhangi bir implant işlemi yapılmış ve üzerinden 90 gün geçmiş mi?
      const implantTreatment = treatments.find((t: any) => {
        const proc = (t.procedure || '').toLocaleLowerCase('tr-TR');
        return proc.includes('implant') && (t.date || '') <= threeMonthsAgoStr;
      });

      if (implantTreatment) {
        const itemDate = new Date(implantTreatment.date);
        const daysPassed = Math.max(1, Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)));
        recalls.push({
          patientId: pid,
          fullName,
          phone,
          lastTreatmentDate: implantTreatment.date,
          procedure: implantTreatment.procedure,
          tooth: implantTreatment.tooth,
          recallType: 'IMPLANT_CROWN_READY',
          reason: '3 Aylık Kemik Kaynama Süresi Doldu (Üst Yapı Provası)',
          daysPassed
        });
        continue; // Bu hasta için implant üst yapı provası önceliklidir
      }

      // 2. Rutin Kontrol & Temizlik: Son işlemi 180 gün önce mi?
      if (latestDateStr && latestDateStr <= sixMonthsAgoStr) {
        const itemDate = new Date(latestDateStr);
        const daysPassed = Math.max(1, Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)));
        recalls.push({
          patientId: pid,
          fullName,
          phone,
          lastTreatmentDate: latestDateStr,
          procedure: latestTreatment.procedure,
          tooth: latestTreatment.tooth,
          recallType: 'ROUTINE_CHECKUP',
          reason: '6 Aylık Rutin Kontrol & Temizlik Vakti Geldi',
          daysPassed
        });
      }
    }

    // 3. Yarım Kalan Planlı Tedaviler (Dental Chart üzerinde 45 gündür faturalandırılmamış planlar)
    const charts = await DentalChart.find({
      updatedAt: { $lte: fortyFiveDaysAgo }
    }).populate('patientId', 'firstName lastName phone').lean();

    for (const chart of charts) {
      if (!chart.patientId || !chart.patientId._id) continue;
      const pid = String(chart.patientId._id);
      if (recalls.some(r => String(r.patientId) === pid)) continue;

      const hasUnbilled = (chart.teethData || []).some((t: any) => 
        (t.procedures || []).some((p: any) => !p.isBilled)
      );

      if (hasUnbilled) {
        const fullName = `${(chart.patientId as any).firstName || ''} ${(chart.patientId as any).lastName || ''}`.trim();
        const chartDate = chart.updatedAt ? new Date(chart.updatedAt) : fortyFiveDaysAgo;
        const daysPassed = Math.max(1, Math.floor((now.getTime() - chartDate.getTime()) / (1000 * 60 * 60 * 24)));
        recalls.push({
          patientId: pid,
          fullName,
          phone: (chart.patientId as any).phone || '',
          lastTreatmentDate: chartDate.toISOString().split('T')[0],
          recallType: 'UNFINISHED_TREATMENT',
          reason: '45+ Gündür Devam Edilmeyen Planlı Tedavi',
          daysPassed
        });
      }
    }

    recalls.sort((a, b) => b.daysPassed - a.daysPassed);

    return {
      success: true,
      count: recalls.length,
      data: recalls
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Recall verileri hesaplanırken hata oluştu.'
    });
  }
});
