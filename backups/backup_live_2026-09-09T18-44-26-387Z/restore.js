import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoUri = envContent.match(/MONGODB_URI=(.+)/)[1].trim();

async function restore() {
  console.log('Bu yedekten geri yükleme başlatılıyor...');
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const summary = JSON.parse(fs.readFileSync(path.join(__dirname, 'summary.json'), 'utf8'));

  for (const colName of Object.keys(summary.collections)) {
    const dataFile = path.join(__dirname, `${colName}.json`);
    if (fs.existsSync(dataFile)) {
      const docs = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      const col = db.collection(colName);
      await col.deleteMany({});
      if (docs.length > 0) {
        await col.insertMany(docs);
      }
      console.log(`[RESTORED] ${colName}: ${docs.length} kayıt geri yüklendi.`);
    }
  }
  console.log('✅ Geri yükleme tamamlandı!');
  await mongoose.disconnect();
}
restore().catch(console.error);
