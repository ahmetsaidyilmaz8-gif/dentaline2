import { ConsentForm } from '../../models/ConsentForm';
import { Patient } from '../../models/Patient';

// Yeni imzalanmış dijital onam formu kaydeder
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.patientId || !body.formType || !body.contentSummary || !body.signatureBase64) {
      throw createError({
        statusCode: 400,
        message: 'Hasta seçimi, onam türü, form metni ve dijital imza zorunludur.'
      });
    }

    if (!body.patientName) {
      const patient = await Patient.findById(body.patientId);
      if (patient) {
        body.patientName = `${patient.firstName} ${patient.lastName}`;
      } else {
        body.patientName = 'Hasta';
      }
    }

    const formTitles: Record<string, string> = {
      endodonti: 'Endodontik Tedavi (Kanal Tedavisi) Onam Formu',
      cerrahi: 'Cerrahi ve Diş Çekimi (Gömülü 20\'lik Dahil) Onam Formu',
      implant: 'Dental İmplant Cerrahisi Onam Formu',
      sabit_protez: 'Sabit Protez (Zirkonyum / Kaplama / Köprü) Onam Formu',
      hareketli_protez: 'Hareketli Protez (Damak / Çıtçıtlı Protez) Onam Formu',
      restoratif: 'Restoratif Diş Tedavisi (Dolgu / İnley-Onley) Onam Formu',
      cerrahi_ve_cekim: 'Diş Çekimi ve Cerrahi İşlemler Aydınlatılmış Onamı',
      kanal_tedavisi: 'Endodonti (Kanal Tedavisi) Aydınlatılmış Onamı',
      genel_onam: 'Genel Diş Hekimliği Muayene ve Tedavi Onamı',
      protez: 'Protez ve Kaplama Tedavisi Onamı',
      beyazlatma: 'Diş Beyazlatma (Bleaching) Onamı'
    };

    const now = body.signedAt ? new Date(body.signedAt) : new Date();
    const formattedDateStr = body.signedAtFormatted || now.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const consentForm = new ConsentForm({
      patientId: body.patientId,
      patientName: body.patientName,
      formType: body.formType,
      formTitle: body.formTitle || formTitles[body.formType] || 'Bilgilendirilmiş Onam Formu',
      toothNumber: body.toothNumber || '',
      acceptanceText: body.acceptanceText || 'Okudum, anladım, kabul ediyorum.',
      acceptanceSignatureBase64: body.acceptanceSignatureBase64 || '',
      contentSummary: body.contentSummary,
      signatureBase64: body.signatureBase64,
      signerName: body.signerName || body.patientName,
      doctorName: body.doctorName || 'Dt. M. Selman',
      doctorSignatureBase64: body.doctorSignatureBase64 || '',
      signedAt: now,
      signedAtFormatted: formattedDateStr
    });

    await consentForm.save();
    return consentForm;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Onam formu kaydedilirken hata oluştu.'
    });
  }
});
