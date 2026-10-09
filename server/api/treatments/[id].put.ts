import { Treatment } from '../../models/Treatment';
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

// Belirli bir tedavi kaydını günceller
export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Tedavi ID parametresi gereklidir.'
      });
    }

    const body = await readBody(event);
    const treatment = await Treatment.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!treatment) {
      throw createError({
        statusCode: 404,
        message: 'Tedavi kaydı bulunamadı.'
      });
    }

    // Diş haritasına senkronize et
    const pId = body.patientId || treatment.patientId;
    const teethList = parseTeeth(body.tooth || treatment.tooth);
    if (pId && teethList.length > 0 && body.syncDentalChart !== false) {
      try {
        const procName = body.procedure || treatment.procedure;
        const statusKey = mapProcedureToStatus(procName);
        const existingChart = await DentalChart.findOne({ patientId: pId });
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

          const treatmentNote = body.notes ? `${procName}: ${body.notes}` : `${procName} (${body.date || ''})`;
          const combinedNote = cur.note ? `${cur.note} • ${treatmentNote}` : treatmentNote;

          chartData[key] = {
            status: statusKey,
            procedures: prevProcs.length > 0 ? prevProcs : [statusKey],
            note: combinedNote,
            plannedPrice: Number(body.fee ?? cur.plannedPrice) || cur.plannedPrice,
            isBilled: true
          };
        }

        await DentalChart.findOneAndUpdate(
          { patientId: pId },
          { patientId: pId, chartData },
          { upsert: true, new: true }
        );
      } catch (chartErr) {
        console.warn('Diş haritası güncelleme senkronizasyon uyarısı:', chartErr);
      }
    }

    return treatment;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Tedavi kaydı güncellenirken hata oluştu.'
    });
  }
});
