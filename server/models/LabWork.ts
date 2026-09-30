import mongoose, { Schema, Document } from 'mongoose';

export interface ILabWork extends Document {
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  labName: string; // Teknisyen / Laboratuvar Adı
  workType: string; // Zirkonyum, E-Max, Metal Destekli Porselen, Total Protez vb.
  toothNumbers: string[]; // Örn: ["11", "21", "22"]
  shadeColor: string; // Renk Kodu: A1, A2, 3D Master 2M2 vb.
  sentDate: Date; // Gönderim Tarihi
  expectedDate: Date; // Beklenen Teslim/Prova Tarihi
  status: 'sent' | 'received' | 'fitted' | 'revision'; // Gönderildi, Kliniğe Geldi, Takıldı, Revizyona Gitti
  notes?: string;
  price?: number; // Laboratuvar maliyeti
  createdAt: Date;
  updatedAt: Date;
}

const LabWorkSchema = new Schema<ILabWork>({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  labName: { type: String, required: true },
  workType: { type: String, required: true },
  toothNumbers: [{ type: String }],
  shadeColor: { type: String, default: 'A2' },
  sentDate: { type: Date, default: Date.now },
  expectedDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['sent', 'received', 'fitted', 'revision'], 
    default: 'sent' 
  },
  notes: { type: String, default: '' },
  price: { type: Number, default: 0 }
}, { timestamps: true });

export const LabWork = mongoose.models.LabWork || mongoose.model<ILabWork>('LabWork', LabWorkSchema);
export default LabWork;
