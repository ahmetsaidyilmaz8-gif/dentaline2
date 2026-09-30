import mongoose from 'mongoose';

// Tedavi (Treatment) Şeması - Yapılan her tedavi hasta için bir borç girdisi oluşturur
const treatmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Tedavi için hasta seçimi zorunludur.'],
  },
  date: {
    type: String, // YYYY-MM-DD formatında saklanır
    required: [true, 'Tedavi tarihi zorunludur.'],
  },
  procedure: {
    type: String, // Dolgu, İmplant, Kanal Tedavisi vb.
    required: [true, 'Yapılan işlem zorunludur.'],
  },
  tooth: {
    type: String, // FDI diş numarası (örn: "36" veya "18, 17" gibi virgülle ayrılmış)
    default: '',
  },
  fee: {
    type: Number, // İşlem ücreti
    required: [true, 'Tedavi ücreti zorunludur.'],
    min: [0, 'Tedavi ücreti negatif olamaz.'],
  },
  notes: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

export const Treatment = mongoose.models.Treatment || mongoose.model('Treatment', treatmentSchema);
