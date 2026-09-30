import mongoose from 'mongoose';

// Hasta (Patient) Şeması
const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    default: '',
    trim: true,
  },
  lastName: {
    type: String,
    default: '',
    trim: true,
  },
  fullName: {
    type: String,
    trim: true,
    default: '',
  },
  tcNo: {
    type: String,
    trim: true,
    default: '',
  },
  birthDate: {
    type: String, // YYYY-MM-DD formatında saklanır
    default: '',
  },
  gender: {
    type: String, // male, female, other
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  bloodType: {
    type: String, // A Rh+, 0 Rh- vb.
    default: '',
  },
  allergies: {
    type: String, // Penisilin alerjisi vb.
    default: '',
  },
  chronicDiseases: {
    type: String, // Diyabet, tansiyon vb.
    default: '',
  },
  medications: {
    type: String, // Düzenli kullanılan ilaçlar
    default: '',
  },
  emergencyContact: {
    type: String, // Acil durumda aranacak kişi adı
    default: '',
  },
  emergencyPhone: {
    type: String, // Acil durumda aranacak kişi telefonu
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  legacyProtocol: {
    type: Number,
    index: true,
    sparse: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  // Recall (Geri Çağırma & 6 Aylık Kontrol) Kalıcı Durumları
  recallDismissed: {
    type: Boolean,
    default: false,
    index: true,
  },
  recallDismissedAt: {
    type: Date,
  },
  recallSnoozedUntil: {
    type: String, // YYYY-MM-DD
    default: '',
  },
  // Aile Hesabı & Ortak Bakiye (Family Ledger)
  familyId: {
    type: String,
    index: true,
    sparse: true,
    default: '',
  },
  familyRole: {
    type: String, // 'head', 'spouse', 'child', 'parent', 'other'
    default: '',
  },
  familyMembers: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    relation: {
      type: String,
      default: 'Diğer',
    },
    notes: {
      type: String,
      default: '',
    }
  }]
}, {
  timestamps: true
});

patientSchema.pre('save', function() {
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
});

patientSchema.pre(['findOneAndUpdate', 'updateOne'], function() {
  const update: any = this.getUpdate();
  if (!update) return;
  const doc = update.$set || update;
  if (doc.firstName !== undefined || doc.lastName !== undefined) {
    const fn = doc.firstName !== undefined ? doc.firstName : '';
    const ln = doc.lastName !== undefined ? doc.lastName : '';
    if (fn || ln) {
      if (update.$set) {
        update.$set.fullName = `${fn} ${ln}`.trim();
      } else {
        update.fullName = `${fn} ${ln}`.trim();
      }
    }
  }
});

patientSchema.index({ fullName: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ tcNo: 1 });
patientSchema.index({ createdAt: -1 });
patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ doctorId: 1, fullName: 1 });
patientSchema.index({ doctorId: 1, firstName: 1, lastName: 1 });
patientSchema.index({ doctorId: 1, phone: 1 });
patientSchema.index({ doctorId: 1, tcNo: 1 });
patientSchema.index({ firstName: 1, lastName: 1 });

if (mongoose.models.Patient) {
  delete mongoose.models.Patient;
}
export const Patient = mongoose.model('Patient', patientSchema);
