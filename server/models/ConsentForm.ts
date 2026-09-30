import mongoose, { Schema, Document } from 'mongoose';

export interface IConsentForm extends Document {
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  formType: string;
  formTitle: string;
  toothNumber?: string;
  acceptanceText?: string; // "Okudum, anladım, kabul ediyorum" beyanı
  acceptanceSignatureBase64?: string; // Hastanın el yazısıyla "Okudum, anladım, kabul ediyorum" çizimi
  contentSummary: string;
  signatureBase64: string; // Hastanın dijital imzası
  signerName?: string;
  doctorName?: string; // Hekim Adı Soyadı
  doctorSignatureBase64?: string; // Hekimin dijital imzası
  signedAt: Date;
  signedAtFormatted?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentFormSchema = new Schema<IConsentForm>({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  formType: { 
    type: String, 
    required: true
  },
  formTitle: { type: String, default: 'Bilgilendirilmiş Onam Formu' },
  toothNumber: { type: String, default: '' },
  acceptanceText: { type: String, default: 'Okudum, anladım, kabul ediyorum.' },
  acceptanceSignatureBase64: { type: String, default: '' },
  contentSummary: { type: String, required: true },
  signatureBase64: { type: String, required: true },
  signerName: { type: String },
  doctorName: { type: String, default: 'Dt. M. Selman' },
  doctorSignatureBase64: { type: String, default: '' },
  signedAt: { type: Date, default: Date.now },
  signedAtFormatted: { type: String }
}, { timestamps: true });

export const ConsentForm = mongoose.models.ConsentForm || mongoose.model<IConsentForm>('ConsentForm', ConsentFormSchema);
export default ConsentForm;
