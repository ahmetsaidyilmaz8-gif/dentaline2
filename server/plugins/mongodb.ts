import dns from 'dns';
import mongoose from 'mongoose';

// Yerel DNS sunucusu SRV/TXT kayıtlarını çözemediğinde doğrudan Google/Cloudflare DNS sunucularını kullanmasını sağlıyoruz.
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
  dns.setDefaultResultOrder('ipv4first');
} catch (dnsErr) {
  // Serverless ortamında DNS setServers kısıtlı olabilir, sessizce geç
}

// Nuxt Server/Nitro başlatıldığında MongoDB bağlantısını kurar.
export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig();

  // Bağlantı zaten açıksa tekrar bağlanma (Serverless optimizasyonu)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('MongoDB bağlantısı başarıyla kuruldu.');
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
  }
});
