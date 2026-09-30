import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env
const envPath = path.join(__dirname, '.env');
let mongoUri = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match) {
    mongoUri = match[1].trim();
  }
}

if (!mongoUri) {
  console.error('MONGODB_URI .env dosyasında bulunamadı!');
  process.exit(1);
}

const backupDir = path.join(__dirname, 'backups', 'backup_live_' + new Date().toISOString().replace(/[:.]/g, '-'));
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log('MongoDB Atlas\'a bağlanılıyor...');
console.log('Yedekleme klasörü:', backupDir);

async function runBackup() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Bağlantı başarılı!');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`\nToplam ${collections.length} koleksiyon bulundu. Yedekleme başlıyor...\n`);

    const summary = {
      backupDate: new Date().toISOString(),
      databaseName: db.databaseName,
      collections: {}
    };

    for (const col of collections) {
      const colName = col.name;
      const collection = db.collection(colName);
      const docs = await collection.find({}).toArray();
      
      const filePath = path.join(backupDir, `${colName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');
      
      console.log(`[+] ${colName.padEnd(20)}: ${String(docs.length).padStart(5)} kayıt -> ${colName}.json`);
      summary.collections[colName] = docs.length;
    }

    // Write summary.json
    fs.writeFileSync(path.join(backupDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
    
    // Also create a one-click restore script in the backup directory
    const restoreScript = `import mongoose from 'mongoose';
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
    const dataFile = path.join(__dirname, \`\${colName}.json\`);
    if (fs.existsSync(dataFile)) {
      const docs = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      const col = db.collection(colName);
      await col.deleteMany({});
      if (docs.length > 0) {
        await col.insertMany(docs);
      }
      console.log(\`[RESTORED] \${colName}: \${docs.length} kayıt geri yüklendi.\`);
    }
  }
  console.log('✅ Geri yükleme tamamlandı!');
  await mongoose.disconnect();
}
restore().catch(console.error);
`;
    fs.writeFileSync(path.join(backupDir, 'restore.js'), restoreScript, 'utf8');

    console.log(`\n🎉 Tüm veritabanı başarıyla yedeklendi!`);
    console.log(`📁 Konum: ${backupDir}`);
    console.log(`🔄 Gerekirse tek tıkla geri dönmek için: node "${path.join(backupDir, 'restore.js')}"`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Yedekleme sırasında hata:', err);
    process.exit(1);
  }
}

runBackup();
