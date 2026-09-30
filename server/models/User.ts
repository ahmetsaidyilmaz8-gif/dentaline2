import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Kullanıcı adı zorunludur.'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Şifre zorunludur.']
  },
  name: {
    type: String,
    required: [true, 'Hekim adı zorunludur.'],
    trim: true
  },
  title: {
    type: String,
    default: 'Diş Hekimi',
    trim: true
  },
  role: {
    type: String,
    enum: ['doctor', 'admin'],
    default: 'doctor'
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'salary'],
    default: 'percentage'
  },
  rate: {
    type: Number,
    default: 30, // Yüzdelik hak ediş oranı (örn: 30 = %30)
    min: [0, 'Hak ediş oranı negatif olamaz.']
  },
  startDate: {
    type: String, // YYYY-MM-DD
    default: ''
  },
  endDate: {
    type: String, // YYYY-MM-DD
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  notes: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

if (mongoose.models.User) {
  delete mongoose.models.User;
}
export const User = mongoose.model('User', userSchema);
