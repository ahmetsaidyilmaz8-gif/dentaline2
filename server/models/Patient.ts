import mongoose from 'mongoose';

// Hasta (Patient) Şeması
const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    default: '',
    trim: true,
  },
  lastName: {
    type: String,
    default: '',
    trim: true,
  },
  tcNo: {
    type: String,
    trim: true,
    default: '',
  },
  birthDate: {
    type: String, // YYYY-MM-DD formatında saklanır
    default: '',
  },
  gender: {
    type: String, // male, female, other
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  bloodType: {
    type: String, // A Rh+, 0 Rh- vb.
    default: '',
  },
  allergies: {
    type: String, // Penisilin alerjisi vb.
    default: '',
  },
  chronicDiseases: {
    type: String, // Diyabet, tansiyon vb.
    default: '',
  },
  medications: {
    type: String, // Düzenli kullanılan ilaçlar
    default: '',
  },
  emergencyContact: {
    type: String, // Acil durumda aranacak kişi adı
    default: '',
  },
  emergencyPhone: {
    type: String, // Acil durumda aranacak kişi telefonu
    default: '',
  },
  notes: {
    type: String,
    default: '',
  }
}, {
  timestamps: true // otomatik createdAt ve updatedAt ekler
});

// Nuxt geliştirme ortamında modelin tekrar derlenmesini önlemek için kontrol
export const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
