import { Patient } from '../../models/Patient';

// Yeni hasta profili oluşturur
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Zorunlu alan kısıtlamaları kaldırıldı - Boş bırakılırsa varsayılan isim atanır
    body.firstName = (body.firstName || '').trim() || 'İsimsiz';
    body.lastName = (body.lastName || '').trim() || 'Hasta';

    const patient = new Patient(body);
    await patient.save();
    
    return patient;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Hasta kaydedilirken hata oluştu.'
    });
  }
});

