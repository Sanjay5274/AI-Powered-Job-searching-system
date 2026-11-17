const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Original PDF storage
    fileData: {
      type: Buffer,
      default: null,
    },

    contentType: {
      type: String,
      default: "application/pdf",
    },

    // Default resume selection
    isDefault: {
      type: Boolean,
      default: false,
    },

    skills: {
      type: [String],
      default: [],
    },

    score: {
      type: Number,
      default: 0,
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    jobRecommendations: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    scoreBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    analysisSummary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);