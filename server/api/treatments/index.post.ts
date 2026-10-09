import { Treatment } from '../../models/Treatment';
import { User } from '../../models/User';
import { DentalChart } from '../../models/DentalChart';

function parseTeeth(toothStr: string): number[] {
  if (!toothStr) return [];
  const matches = String(toothStr).match(/\b([1-8][1-8])\b/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(Number)));
}

function mapProcedureToStatus(procName: string): string {
  const norm = String(procName || '').toLowerCase().trim();
  if (/kanal|endodonti/i.test(norm)) return 'rootcanal';
  if (/dolgu|kompozit|amalgam/i.test(norm)) return 'filled';
  if (/kaplama|kron|kuron|zirkon|porselen|veneer|lamine/i.test(norm)) return 'crown';
  if (/implant/i.test(norm)) return 'implant';
  if (/çekim|cekim|extraction/i.test(norm)) return 'extraction';
  if (/temizlik|tartar|detertraj|scaling/i.test(norm)) return 'scaling';
  if (/küretaj|kuretaj/i.test(norm)) return 'curettage';
  if (/köprü|kopru|bridge/i.test(norm)) return 'bridge';
  if (/çürük|curuk|decay/i.test(norm)) return 'decay';
  if (/gömülü|gomulu|impacted/i.test(norm)) return 'impacted';
  return 'filled';
}

// Yeni bir tedavi kaydı oluşturur
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.patientId || !body.procedure || body.fee === undefined) {
      throw createError({
        statusCode: 400,
        message: 'Hasta seçimi, yapılacak işlem ve ücret alanları zorunludur.'
      });
    }

    if (!body.doctorId || String(body.doctorId) === '6aa1cd9f6be357016bee9c25') {
      const defaultDoc = await User.findOne({ username: 'dtselo' }) || await User.findOne({ name: /Selman/i });
      if (defaultDoc) {
        body.doctorId = defaultDoc._id;
      }
    }

    const treatment = new Treatment(body);
    await treatment.save();

    // Diş haritasına otomatik senkronize et
    const teethList = parseTeeth(body.tooth);
    if (teethList.length > 0 && body.syncDentalChart !== false) {
      try {
        const statusKey = mapProcedureToStatus(body.procedure);
        const existingChart = await DentalChart.findOne({ patientId: body.patientId });
        const chartData = existingChart?.chartData ? Object.fromEntries(existingChart.chartData) : {};

        for (const tNum of teethList) {
          const key = String(tNum);
          const cur = chartData[key] || {
            status: 'healthy',
            procedures: [],
            note: '',
            plannedPrice: null,
            isBilled: false
          };

          const prevProcs = Array.isArray(cur.procedures) ? cur.procedures.filter((p: string) => p !== 'healthy') : [];
          if (!prevProcs.includes(statusKey)) {
            prevProcs.push(statusKey);
          }

          const treatmentNote = body.notes ? `${body.procedure}: ${body.notes}` : `${body.procedure} (${body.date || ''})`;
          const combinedNote = cur.note ? `${cur.note} • ${treatmentNote}` : treatmentNote;

          chartData[key] = {
            status: statusKey,
            procedures: prevProcs.length > 0 ? prevProcs : [statusKey],
            note: combinedNote,
            plannedPrice: Number(body.fee) || cur.plannedPrice,
            isBilled: true
          };
        }

        await DentalChart.findOneAndUpdate(
          { patientId: body.patientId },
          { patientId: body.patientId, chartData },
          { upsert: true, new: true }
        );
      } catch (chartErr) {
        console.warn('Diş haritası otomatik senkronizasyon uyarısı:', chartErr);
      }
    }

    return treatment;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Tedavi kaydedilirken hata oluştu.'
    });
  }
});


