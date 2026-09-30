import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false,
    default: null
  },
  patientName: {
    type: String,
    default: '',
    trim: true
  },
  patientPhone: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    enum: ['treatment', 'payment', 'general'],
    default: 'treatment'
  },
  note: {
    type: String,
    required: [true, 'Hatırlatıcı notu zorunludur.'],
    trim: true
  },
  targetDate: {
    type: String, // YYYY-MM-DD
    required: [true, 'Hedef tarih zorunludur.']
  },
  leadDays: {
    type: Number, // 0 (aynı gün), 1, 2, 3, 7 (1 hafta önce)
    default: 0
  },
  reminderDate: {
    type: String, // YYYY-MM-DD (targetDate - leadDays)
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'hidden'],
    default: 'active'
  },
  snoozedUntil: {
    type: String, // YYYY-MM-DD (ertelendiği tarih)
    default: null
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }
}, {
  timestamps: true
});

reminderSchema.index({ doctorId: 1, reminderDate: 1, status: 1 });
reminderSchema.index({ patientId: 1, status: 1 });
reminderSchema.index({ targetDate: 1 });

if (mongoose.models.Reminder) {
  delete mongoose.models.Reminder;
}
export const Reminder = mongoose.model('Reminder', reminderSchema);
