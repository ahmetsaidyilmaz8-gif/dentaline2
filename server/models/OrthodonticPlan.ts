import mongoose from 'mongoose';

const installmentSchema = new mongoose.Schema({
  installmentNo: {
    type: Number,
    required: true
  },
  dueDate: {
    type: String, // YYYY-MM-DD
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: String, // YYYY-MM-DD
    default: ''
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: true });

const orthodonticPlanSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Hasta seçimi zorunludur.'],
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hekim seçimi zorunludur.'],
    index: true
  },
  treatmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment',
    default: null
  },
  planType: {
    type: String,
    enum: ['installments', 'per_session'],
    default: 'installments'
  },
  hasInstallments: {
    type: Boolean,
    default: true
  },
  totalAmount: {
    type: Number,
    required: [true, 'Toplam anlaşma tutarı zorunludur.'],
    min: [0, 'Anlaşma tutarı negatif olamaz.']
  },
  downPayment: {
    type: Number,
    default: 0,
    min: [0, 'Peşinat negatif olamaz.']
  },
  durationMonths: {
    type: Number,
    default: 12,
    min: [0, 'Süre negatif olamaz.']
  },
  startDate: {
    type: String, // YYYY-MM-DD
    required: [true, 'Başlangıç tarihi zorunludur.']
  },
  bracketType: {
    type: String,
    default: 'Metal Braket'
  },
  diagnosis: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active',
    index: true
  },
  installments: [installmentSchema]
}, {
  timestamps: true
});

orthodonticPlanSchema.index({ patientId: 1, status: 1 });
orthodonticPlanSchema.index({ doctorId: 1, createdAt: -1 });
orthodonticPlanSchema.index({ createdAt: -1 });

if (mongoose.models.OrthodonticPlan) {
  delete mongoose.models.OrthodonticPlan;
}
export const OrthodonticPlan = mongoose.model('OrthodonticPlan', orthodonticPlanSchema);
