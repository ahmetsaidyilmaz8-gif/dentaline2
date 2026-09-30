import mongoose from 'mongoose';

let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  // 1. Bağlantı zaten kurulu ve aktifse hemen dön
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // 2. Halihazırda devam eden bir bağlantı denemesi varsa aynı promise'i kullan (Connection pooling)
  if (cachedPromise) {
    return cachedPromise;
  }

  const config = useRuntimeConfig();
  const uri = process.env.MONGODB_URI || process.env.NUXT_MONGODB_URI || config.mongodbUri;

  if (!uri) {
    throw new Error('MongoDB URI bulunamadı. Lütfen MONGODB_URI ortam değişkenini tanımlayın.');
  }

  cachedPromise = mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  }).then((m) => {
    return m;
  }).catch((err) => {
    cachedPromise = null;
    throw err;
  });

  return cachedPromise;
}
