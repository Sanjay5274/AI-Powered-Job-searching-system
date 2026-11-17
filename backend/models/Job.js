const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Remote", "Contract", "Internship"],
      default: "Full-time",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ["Entry-level", "Mid-level", "Senior-level", "Lead", "All levels"],
      default: "Mid-level",
    },
    salaryRange: {
      type: String,
      default: "",
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
