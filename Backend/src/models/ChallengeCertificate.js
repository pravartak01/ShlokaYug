/**
 * Challenge Certificate Model - Enhanced for challenge-based certificates
 */

const mongoose = require('mongoose');

const challengeCertificateSchema = new mongoose.Schema({
  // Certificate Identification
  certificateId: {
    type: String,
    unique: true,
    required: [true, 'Certificate ID is required'],
    index: true
  },
  verificationCode: {
    type: String,
    unique: true,
    required: [true, 'Verification code is required'],
    index: true
  },
  
  // Certificate Recipients and Challenge
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Challenge ID is required'],
    index: true
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChallengeParticipant',
    required: [true, 'Participant ID is required']
  },
  
  // Certificate Content
  title: {
    type: String,
    required: [true, 'Certificate title is required'],
    trim: true,
    maxlength: [200, 'Certificate title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Certificate description cannot exceed 500 characters']
  },
  recipientName: {
    type: String,
    required: [true, 'Recipient name is required'],
    trim: true
  },
  
  // Achievement Details
  achievement: {
    challengeTitle: {
      type: String,
      required: [true, 'Challenge title is required']
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative']
    },
    maxScore: {
      type: Number,
      required: [true, 'Max score is required'],
      min: [0, 'Max score cannot be negative']
    },
    accuracy: {
      type: Number,
      min: [0, 'Accuracy cannot be negative'],
      max: [100, 'Accuracy cannot exceed 100%']
    },
    completionDate: {
      type: Date,
      required: [true, 'Completion date is required']
    },
    timeSpent: {
      type: Number, // in minutes
      min: [0, 'Time spent cannot be negative']
    },
    rank: {
      position: Number,
      totalParticipants: Number
    }
  },
  
  // Certificate Template and Design
  template: {
    templateId: {
      type: String,
      required: [true, 'Template ID is required'],
      default: 'default_challenge_certificate'
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF'
    },
    primaryColor: {
      type: String,
      default: '#FFD700' // Gold
    },
    secondaryColor: {
      type: String,
      default: '#4169E1' // Royal Blue
    },
    fontFamily: {
      type: String,
      default: 'Times New Roman'
    },
    logoUrl: String,
    backgroundImageUrl: String,
    borderStyle: {
      type: String,
      enum: ['none', 'simple', 'decorative', 'ornate'],
      default: 'decorative'
    }
  },
  
  // Digital Signature and Verification
  signature: {
    issuerName: {
      type: String,
      required: [true, 'Issuer name is required'],
      default: 'ShlokaYug Academy'
    },
    issuerTitle: {
      type: String,
      default: 'Chief Learning Officer'
    },
    signatureImageUrl: String,
    digitalHash: String, // Hash for verification
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Issued by is required']
    }
  },
  
  // File Information
  files: {
    pdfUrl: String,
    imageUrl: String, // PNG/JPG version
    thumbnailUrl: String,
    cloudinaryPublicId: String,
    fileSize: Number, // in bytes
    generatedAt: Date
  },
  
  // Status and Lifecycle
  status: {
    type: String,
    enum: ['pending', 'generated', 'issued', 'revoked', 'expired'],
    default: 'pending',
    index: true
  },
  
  // Metadata
  metadata: {
    downloadCount: {
      type: Number,
      default: 0
    },
    lastDownloadedAt: Date,
    shareCount: {
      type: Number,
      default: 0
    },
    verificationCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
challengeCertificateSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
challengeCertificateSchema.index({ status: 1, createdAt: -1 });

// Virtual for percentage score
challengeCertificateSchema.virtual('percentageScore').get(function() {
  if (this.achievement.maxScore === 0) return 0;
  return ((this.achievement.score / this.achievement.maxScore) * 100).toFixed(2);
});

// Pre-save middleware to generate IDs
challengeCertificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    this.certificateId = generateCertificateId();
  }
  if (!this.verificationCode) {
    this.verificationCode = generateVerificationCode();
  }
  next();
});

// Helper functions
function generateCertificateId() {
  const prefix = 'SY-CERT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = mongoose.model('ChallengeCertificate', challengeCertificateSchema);