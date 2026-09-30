import mongoose from 'mongoose';

// Ödeme (Payment) Şeması - Yapılan ödemeler hastanın toplam borcunu azaltır
const paymentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Ödeme için hasta seçimi zorunludur.'],
  },
  amount: {
    type: Number, // Ödenen miktar
    required: [true, 'Ödeme miktarı zorunludur.'],
    min: [0.01, 'Ödeme miktarı en az 0.01 TL olmalıdır.'],
  },
  method: {
    type: String, // cash (nakit), card (kart), transfer (havale), other (diğer)
    enum: ['cash', 'card', 'transfer', 'other'],
    required: [true, 'Ödeme yöntemi zorunludur.'],
    default: 'cash',
  },
  date: {
    type: String, // YYYY-MM-DD formatında saklanır
    required: [true, 'Ödeme tarihi zorunludur.'],
  },
  notes: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
