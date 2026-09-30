import mongoose from 'mongoose';

// Tedavi (Treatment) Şeması
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
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }
}, {
  timestamps: true
});

treatmentSchema.index({ doctorId: 1, date: -1 });
treatmentSchema.index({ patientId: 1, date: -1 });
treatmentSchema.index({ date: -1 });
treatmentSchema.index({ tooth: 1 });
treatmentSchema.index({ createdAt: -1 });

if (mongoose.models.Treatment) {
  delete mongoose.models.Treatment;
}
export const Treatment = mongoose.model('Treatment', treatmentSchema);
