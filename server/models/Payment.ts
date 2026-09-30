import mongoose from 'mongoose';

// Ödeme (Payment) Şeması
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
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  doctorRate: {
    type: Number,
    default: 0
  },
  doctorEarning: {
    type: Number,
    default: 0
  },
  isOrthodontic: {
    type: Boolean,
    default: false,
    index: true
  },
  orthodonticPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrthodonticPlan',
    index: true
  },
  installmentNo: {
    type: Number
  }
}, {
  timestamps: true
});

paymentSchema.index({ doctorId: 1, date: -1 });
paymentSchema.index({ isOrthodontic: 1, date: -1 });
paymentSchema.index({ patientId: 1, date: -1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ createdAt: -1 });

if (mongoose.models.Payment) {
  delete mongoose.models.Payment;
}
export const Payment = mongoose.model('Payment', paymentSchema);
