import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Gider kategorisi zorunludur.'],
    enum: [
      'Sarf Malzeme/Depo',
      'Laboratuvar Ödemesi',
      'Kira/Aidat',
      'Personel/Maaş',
      'Faturalar',
      'Vergi/Muhasebe',
      'Diğer'
    ],
    default: 'Sarf Malzeme/Depo'
  },
  amount: {
    type: Number,
    required: [true, 'Gider tutarı zorunludur.'],
    min: [0.01, 'Gider tutarı sıfırdan büyük olmalıdır.']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'other'],
    default: 'cash'
  },
  date: {
    type: String, // YYYY-MM-DD
    required: [true, 'Gider tarihi zorunludur.']
  },
  description: {
    type: String,
    required: [true, 'Gider açıklaması zorunludur.'],
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDay: {
    type: Number,
    default: 1
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1, date: -1 });
expenseSchema.index({ createdAt: -1 });

if (mongoose.models.Expense) {
  delete mongoose.models.Expense;
}
export const Expense = mongoose.model('Expense', expenseSchema);
