const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["Applied", "Reviewing", "Shortlisted", "Interview", "Rejected", "Accepted"],
      default: "Applied",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications by the same user to the same job
jobApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
