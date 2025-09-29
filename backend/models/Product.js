import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  keyFeatures: [String],
  images: [{
    url: String,
    localPath: String,
    textExtracted: Boolean,
    ocrText: String
  }],
  extractedData: {
    htmlText: String,
    ocrText: String,
    combinedText: String
  },
  complianceResults: {
    score: Number,
    status: {
      type: String,
      enum: ['Compliant', 'Non-Compliant', 'Needs Review'],
      default: 'Needs Review'
    },
    rules: [{
      ruleId: String,
      ruleName: String,
      status: {
        type: String,
        enum: ['PASS', 'FAIL', 'NOT_FOUND'],
        default: 'NOT_FOUND'
      },
      evidence: String,
      description: String,
      isCritical: Boolean
    }],
    violations: [String]
  },
  scanDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);