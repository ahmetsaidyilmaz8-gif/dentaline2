import dns from 'dns';
import { connectToDatabase } from '../utils/db';

// Yerel DNS sunucusu SRV kayıtlarını çözemediğinde sadece yerel ortamda Google/Cloudflare DNS kullan
// Serverless (Vercel/AWS Lambda) ortamında dns.setServers dış DNS isteklerini engelleyeceği için kesinlikle çalıştırılmaz!
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    dns.setDefaultResultOrder('ipv4first');
  } catch (dnsErr) {
    // DNS ayarı desteklenmiyorsa sessizce geç
  }
}

// Nuxt Server/Nitro başlatıldığında MongoDB bağlantısını başlat
export default defineNitroPlugin(async () => {
  try {
    await connectToDatabase();
    console.log('MongoDB bağlantısı hazır.');
  } catch (error: any) {
    console.warn('MongoDB başlangıç bağlantı uyarısı (istek anında tekrar denenecek):', error.message);
  }
});
