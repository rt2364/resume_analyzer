import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Resume must belong to a logged-in user
    },
    fileName: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      default: 'General Role',
    },
    overallScore: {
      type: Number,
      required: true,
    },
    matchPercentage: {
      type: Number,
      required: true,
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    missingKeywords: [{ type: String }],
    actionableFeedback: [{ type: String }],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);