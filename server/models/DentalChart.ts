import mongoose from 'mongoose';

// Diş Haritası Şeması - Her dişin durumu ve notunu saklar
const dentalChartSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    unique: true, // Her hastanın tek bir diş haritası olmalı
  },
  // Map yapısı: { "18": { status: "decay", note: "çürük başlangıcı" }, "36": { status: "filled", note: "" } }
  chartData: {
    type: Map,
    of: new mongoose.Schema({
      status: {
        type: String, // healthy, filled, decay, missing, bridge, implant, rootcanal, crown
        default: 'healthy',
      },
      procedures: {
        type: [String],
        default: [],
      },
      note: {
        type: String,
        default: '',
      },
      plannedPrice: {
        type: Number,
        default: null,
      },
      isBilled: {
        type: Boolean,
        default: false,
      }
    }, { _id: false }),
    default: {},
  }
}, {
  timestamps: true
});

export const DentalChart = mongoose.models.DentalChart || mongoose.model('DentalChart', dentalChartSchema);
