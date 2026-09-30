import mongoose from 'mongoose';

const orthodonticSessionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Hasta seçimi zorunludur.'],
    index: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrthodonticPlan',
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hekim seçimi zorunludur.'],
    index: true
  },
  sessionNumber: {
    type: Number,
    required: [true, 'Seans numarası zorunludur.']
  },
  date: {
    type: String, // YYYY-MM-DD
    required: [true, 'Seans tarihi zorunludur.']
  },
  time: {
    type: String, // HH:MM
    default: '10:00'
  },
  sessionNotes: {
    type: String,
    required: [true, 'Seans notu zorunludur.'],
    trim: true
  },
  archwireUpper: {
    type: String,
    default: '',
    trim: true
  },
  archwireLower: {
    type: String,
    default: '',
    trim: true
  },
  elastics: {
    type: String,
    default: '',
    trim: true
  },
  nextAppointmentDate: {
    type: String, // YYYY-MM-DD
    default: ''
  },
  nextAppointmentNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['completed', 'scheduled', 'cancelled'],
    default: 'completed'
  }
}, {
  timestamps: true
});

orthodonticSessionSchema.index({ patientId: 1, sessionNumber: 1 });
orthodonticSessionSchema.index({ patientId: 1, date: -1 });
orthodonticSessionSchema.index({ doctorId: 1, date: -1 });
orthodonticSessionSchema.index({ date: -1 });
orthodonticSessionSchema.index({ createdAt: -1 });

if (mongoose.models.OrthodonticSession) {
  delete mongoose.models.OrthodonticSession;
}
export const OrthodonticSession = mongoose.model('OrthodonticSession', orthodonticSessionSchema);
