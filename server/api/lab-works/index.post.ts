import { LabWork } from '../../models/LabWork';
import { Patient } from '../../models/Patient';

// Yeni bir laboratuvar/protez işi oluşturur
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.patientId || !body.workType || !body.labName || !body.expectedDate) {
      throw createError({
        statusCode: 400,
        message: 'Hasta, laboratuvar/teknisyen adı, yapılacak iş türü ve beklenen teslim tarihi zorunludur.'
      });
    }

    // Hasta adını bul ve ekle (eğer body içinde gelmediyse)
    if (!body.patientName) {
      const patient = await Patient.findById(body.patientId);
      if (patient) {
        body.patientName = `${patient.firstName} ${patient.lastName}`;
      } else {
        body.patientName = 'Hasta';
      }
    }

    const labWork = new LabWork({
      patientId: body.patientId,
      patientName: body.patientName,
      labName: body.labName,
      workType: body.workType,
      toothNumbers: Array.isArray(body.toothNumbers) ? body.toothNumbers : (body.toothNumbers ? [body.toothNumbers] : []),
      shadeColor: body.shadeColor || 'A2',
      sentDate: body.sentDate || new Date(),
      expectedDate: body.expectedDate,
      status: body.status || 'sent',
      notes: body.notes || '',
      price: Number(body.price) || 0
    });

    await labWork.save();
    return labWork;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Laboratuvar işi kaydedilirken hata oluştu.'
    });
  }
});
