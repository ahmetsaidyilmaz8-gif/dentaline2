import dns from 'dns';
import { connectToDatabase } from '../utils/db';
import { User } from '../models/User';
import { hashPassword } from '../utils/auth';

// Yerel DNS sunucusu SRV kayıtlarını çözemediğinde sadece yerel ortamda Google/Cloudflare DNS kullan
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

    // Varsayılan klinik admin hesabını kontrol et, yoksa oluştur
    const clinicExists = await User.findOne({ username: 'klinik' });
    if (!clinicExists) {
      await User.create({
        username: 'klinik',
        password: hashPassword('123456'),
        name: 'Klinik',
        title: 'Poliklinik Yönetimi',
        role: 'admin',
        type: 'percentage',
        rate: 30,
        isActive: true
      });
      console.log('Varsayılan "klinik" kullanıcısı başarıyla oluşturuldu.');
    }
  } catch (error: any) {
    console.warn('MongoDB başlangıç bağlantı uyarısı (istek anında tekrar denenecek):', error.message);
  }
});
