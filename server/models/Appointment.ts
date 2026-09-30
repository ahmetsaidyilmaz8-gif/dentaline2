import mongoose from 'mongoose';

// Randevu (Appointment) Şeması
const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false,
    default: null,
  },
  patientName: {
    type: String, // Hasta seçilmediğinde girilen serbest/manuel isim
    default: '',
    trim: true,
  },
  patientPhone: {
    type: String, // Manuel hasta için isteğe bağlı telefon
    default: '',
    trim: true,
  },
  date: {
    type: String, // YYYY-MM-DD formatında saklanır
    required: [true, 'Randevu tarihi zorunludur.'],
  },
  time: {
    type: String, // HH:MM formatında saklanır
    required: [true, 'Randevu saati zorunludur.'],
  },
  procedure: {
    type: String, // Muayene, Dolgu, Kanal Tedavisi vb.
    required: [true, 'Tedavi/İşlem türü zorunludur.'],
  },
  status: {
    type: String, // pending (bekliyor), completed (tamamlandı), cancelled (iptal), noshow (gelmedi), postponed (ertelendi)
    enum: ['pending', 'completed', 'cancelled', 'noshow', 'postponed'],
    default: 'pending',
  },
  duration: {
    type: Number, // dakika cinsinden süre (örn: 30, 60)
    default: 30,
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
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

appointmentSchema.index({ doctorId: 1, date: 1, time: 1 });
appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });

if (mongoose.models.Appointment) {
  delete mongoose.models.Appointment;
}
export const Appointment = mongoose.model('Appointment', appointmentSchema);
