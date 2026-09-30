import mongoose from 'mongoose';

const doctorPayoutSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hekim seçimi zorunludur.'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Ödenen tutar zorunludur.'],
    min: [0.01, "Ödenen tutar 0'dan büyük olmalıdır."]
  },
  date: {
    type: String, // YYYY-MM-DD
    required: [true, 'Ödeme tarihi zorunludur.']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'transfer', 'other'],
    default: 'cash',
    required: true
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

doctorPayoutSchema.index({ doctorId: 1, date: -1 });
doctorPayoutSchema.index({ date: -1 });
doctorPayoutSchema.index({ createdAt: -1 });

if (mongoose.models.DoctorPayout) {
  delete mongoose.models.DoctorPayout;
}
export const DoctorPayout = mongoose.model('DoctorPayout', doctorPayoutSchema);
