import dns from 'dns';
import mongoose from 'mongoose';

// Yerel DNS sunucusu SRV/TXT kayıtlarını çözemediğinde doğrudan Google/Cloudflare DNS sunucularını kullanmasını sağlıyoruz.
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
  dns.setDefaultResultOrder('ipv4first');
  console.log('Uygulama DNS sunucuları programatik olarak [1.1.1.1, 8.8.8.8] şeklinde ayarlandı.');
} catch (dnsErr) {
  console.warn('DNS sunucuları ayarlanırken uyarı oluştu:', dnsErr);
}

// Nuxt Server/Nitro başlatıldığında MongoDB bağlantısını kurar.
export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig();

  try {
    // Mongoose bağlantısı kur
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB bağlantısı başarıyla kuruldu.');
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
  }
});
