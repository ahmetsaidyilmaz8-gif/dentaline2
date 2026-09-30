import mongoose from 'mongoose';

const clinicSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

if (mongoose.models.ClinicSetting) {
  delete mongoose.models.ClinicSetting;
}
export const ClinicSetting = mongoose.model('ClinicSetting', clinicSettingSchema);
