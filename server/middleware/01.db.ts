import { connectToDatabase } from '../utils/db';

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || '';
  // Sadece dahili API isteklerinde DB bağlantısının kurulu olduğundan emin ol
  if (url.startsWith('/api') && !url.startsWith('/api/_nuxt_icon')) {
    try {
      await connectToDatabase();
    } catch (error: any) {
      console.error('API DB bağlantı hatası:', error.message);
      throw createError({
        statusCode: 503,
        statusMessage: 'Veritabanı Bağlantı Hatası',
        message: 'Veritabanına ulaşılamıyor. Lütfen internet / veritabanı ayarlarını kontrol edin.'
      });
    }
  }
});
