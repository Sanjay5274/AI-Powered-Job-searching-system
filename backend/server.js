const express = require("express");
require("dotenv").config();
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

const connectDB = require("./config/db");
const Resume = require("./models/Resume");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const authMiddleware = require("./middleware/authMiddleware");

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", jobRoutes);

// Secure Multer configuration for PDF resumes (Max 10MB)
const uploadPDF = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".pdf" && (file.mimetype === "application/pdf" || file.mimetype === "application/octet-stream")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

// Secure Multer configuration for Job Matching (Resume PDF + optional Job Description PDF/TXT)
const uploadMatchJob = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === "resume") {
      if (ext === ".pdf" && (file.mimetype === "application/pdf" || file.mimetype === "application/octet-stream")) {
        return cb(null, true);
      }
      return cb(new Error("Only PDF files are allowed for resumes."));
    }
    if (file.fieldname === "jobDescription") {
      if ([".pdf", ".txt"].includes(ext) || file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
        return cb(null, true);
      }
      return cb(new Error("Only PDF and TXT files are allowed for job descriptions."));
    }
    cb(null, true);
  },
});

// Multer error handling wrapper
const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File exceeds the 10 MB size limit.",
        });
      }
      return res.status(400).json({
        message: err.message || "File upload error.",
      });
    }
    next();
  });
};

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "AI Resume Screening Backend is running!",
  });
});

// Resume upload route
app.post("/api/upload-resume", handleUpload(uploadPDF.single("resume")), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Please upload a resume PDF.",
    });
  }

  res.json({
    message: "Resume uploaded successfully!",
    fileName: req.file.originalname,
  });
});

// Analyze resume using Python AI service
app.post(
  "/api/analyze-resume",
  authMiddleware,
  handleUpload(uploadPDF.single("resume")),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a resume PDF.",
        });
      }

      console.log("Received resume:", req.file.originalname);

      const form = new FormData();

      form.append("resume", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      // Send PDF to Python Flask AI service
      const response = await axios.post(
        "http://127.0.0.1:5001/analyze",
        form,
        {
          headers: form.getHeaders(),
          timeout: 120000,
        }
      );

      const aiResult = response.data;

      console.log("Python AI analysis completed");

        // Save result to MongoDB
      let dbSaved = false;

      try {
        const newResume = new Resume({
          userId: req.userId,
          fileName: req.file.originalname,

          fileData: req.file.buffer,
          contentType: req.file.mimetype,
          isDefault: true,

          skills:
            aiResult.detected_skills ||
            aiResult.detectedSkills ||
            [],

          score: aiResult.score || 0,

          missingSkills:
            aiResult.missing_skills ||
            aiResult.missingSkills ||
            [],

          suggestions: aiResult.suggestions || [],

          jobRecommendations:
            aiResult.job_recommendations ||
            aiResult.jobRecommendations ||
            [],

          scoreBreakdown:
            aiResult.score_breakdown ||
            aiResult.scoreBreakdown ||
            {},

          analysisSummary:
            aiResult.analysis ||
            aiResult.summary ||
            "",
        });

        await newResume.save();

        // Make all other resumes non-default
        await Resume.updateMany(
          {
            userId: req.userId,
            _id: { $ne: newResume._id },
          },
          {
            $set: { isDefault: false },
          }
        );

        dbSaved = true;

        console.log("Resume PDF and analysis saved to MongoDB");

      } catch (dbError) {
        console.error("MongoDB Save Error:", dbError.message);
      }
      // Send AI result to React
      return res.status(200).json({
        message: "Resume analyzed successfully!",
        fileName: req.file.originalname,
        aiResult: aiResult,
        dbSaved: dbSaved,
      });
    } catch (error) {
      console.error("Analysis Error:", error.message);

      if (error.response) {
        console.error("Python AI Error:", error.response.data);

        return res.status(error.response.status || 500).json({
          message: "Python AI service returned an error.",
          error: error.response.data,
        });
      }

      return res.status(500).json({
        message: "Resume analysis failed.",
        error: error.message,
      });
    }
  }
);
// =====================================================
// COMPANY JOB REQUIREMENT MATCHING API
// =====================================================

app.post(
  "/api/match-job",
  authMiddleware,
  handleUpload(
    uploadMatchJob.fields([
      { name: "resume", maxCount: 1 },
      { name: "jobDescription", maxCount: 1 },
    ])
  ),
  async (req, res) => {
    try {
      const { jobTitle, requiredSkills, resumeId } = req.body;

      // Validate job title
      if (!jobTitle || !jobTitle.trim()) {
        return res.status(400).json({
          message: "Please enter a job title.",
        });
      }

      // Convert required skills into an array
      let skillsArray = [];
      if (Array.isArray(requiredSkills)) {
        skillsArray = requiredSkills;
      } else if (typeof requiredSkills === "string" && requiredSkills.trim()) {
        try {
          const parsed = JSON.parse(requiredSkills);
          skillsArray = Array.isArray(parsed)
            ? parsed
            : requiredSkills.split(",");
        } catch (error) {
          skillsArray = requiredSkills.split(",");
        }
      }

      skillsArray = skillsArray
        .map((skill) => String(skill).trim())
        .filter(Boolean);

      const resumeFile = req.files && req.files.resume ? req.files.resume[0] : null;
      const jdFile = req.files && req.files.jobDescription ? req.files.jobDescription[0] : null;

      if (skillsArray.length === 0 && !jdFile) {
        return res.status(400).json({
          message: "Please enter at least one required skill or upload a job description.",
        });
      }

      const form = new FormData();
      form.append("job_title", jobTitle.trim());

      if (skillsArray.length > 0) {
        form.append("required_skills", JSON.stringify(skillsArray));
      }

      if (jdFile) {
        form.append("job_description", jdFile.buffer, {
          filename: jdFile.originalname,
          contentType: jdFile.mimetype || "application/octet-stream",
        });
      }

      let fileName = "";

      // OPTION 1: New PDF resume
      if (resumeFile) {
        if (!resumeFile.originalname.toLowerCase().endsWith(".pdf")) {
          return res.status(400).json({
            message: "Only PDF files are allowed for resumes.",
          });
        }

        form.append("resume", resumeFile.buffer, {
          filename: resumeFile.originalname,
          contentType: resumeFile.mimetype,
        });

        fileName = resumeFile.originalname;
      }
      // OPTION 2: Previously uploaded resume
      else if (resumeId) {
        const existingResume = await Resume.findOne({
          _id: resumeId,
          userId: req.userId,
        });

        if (!existingResume) {
          return res.status(404).json({
            message: "Selected resume was not found.",
          });
        }

        if (!existingResume.skills || existingResume.skills.length === 0) {
          return res.status(400).json({
            message: "No analyzed skills found in this resume.",
          });
        }

        form.append(
          "resume_skills",
          JSON.stringify(existingResume.skills)
        );

        fileName = existingResume.fileName;
      }
      // No resume selected
      else {
        return res.status(400).json({
          message: "Please upload a PDF or select an existing resume.",
        });
      }

      // Send data to Python AI service
      const response = await axios.post(
        "http://127.0.0.1:5001/match-job",
        form,
        {
          headers: form.getHeaders(),
          timeout: 120000,
        }
      );

      return res.status(200).json({
        message: "Job matching completed successfully!",
        fileName,
        matchResult: response.data,
      });

    } catch (error) {
      console.error("Job Matching Error:", error.message);

      if (error.response) {
        return res.status(error.response.status || 500).json({
          message: error.response.data?.error || "Python AI matching service returned an error.",
          error: error.response.data,
        });
      }

      return res.status(500).json({
        message: "Job matching failed.",
        error: error.message,
      });
    }
  }
);
// Get logged-in user's resume history
app.get("/api/resume-history", authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json({
      message: "Resume history fetched successfully",
      resumes,
    });
  } catch (error) {
    console.error("History Error:", error.message);
    res.status(500).json({
      message: "Unable to fetch resume history",
    });
  }
});
// Get one resume analysis by ID
app.get("/api/resume-history/:id", authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    res.status(200).json({
      message: "Resume analysis fetched successfully",
      resume,
    });

  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch resume analysis",
      error: error.message,
    });
  }
});

// Delete a resume from history
app.delete("/api/resume-history/:id", authMiddleware, async (req, res) => {
  try {
    const deletedResume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedResume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    res.json({
      message: "Resume history deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({
      message: "Unable to delete resume history",
    });
  }
});

// Test Python AI connection
app.get("/api/test-ai", async (req, res) => {
  try {
    const response = await axios.get(
      "http://127.0.0.1:5001/"
    );

    res.json({
      message: "Python AI service is reachable.",
      aiResult: response.data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Python AI service connection failed.",
      error: error.message,
    });
  }
});
// =====================================================
// AI SKILL GAP ANALYSIS API
// =====================================================

app.post(
  "/api/skill-gap",
  authMiddleware,
  async (req, res) => {
    try {
      const { jobTitle, resumeId } = req.body;

      // Validate job title
      if (!jobTitle || !jobTitle.trim()) {
        return res.status(400).json({
          message: "Please enter a target job role."
        });
      }

      // Validate resume ID
      if (!resumeId) {
        return res.status(400).json({
          message: "Please select an analyzed resume."
        });
      }

      // Get logged-in user's resume
      const existingResume = await Resume.findOne({
        _id: resumeId,
        userId: req.userId
      });

      if (!existingResume) {
        return res.status(404).json({
          message: "Resume not found."
        });
      }

      // Check resume skills
      if (
        !existingResume.skills ||
        existingResume.skills.length === 0
      ) {
        return res.status(400).json({
          message: "No analyzed skills found in this resume."
        });
      }

      // Prepare data for Python AI service
      const form = new FormData();

      form.append("job_title", jobTitle.trim());

      form.append(
        "resume_skills",
        JSON.stringify(existingResume.skills)
      );

      // Send request to Python AI
      const response = await axios.post(
        "http://127.0.0.1:5001/skill-gap",
        form,
        {
          headers: form.getHeaders(),
          timeout: 120000
        }
      );

      // Return result to React
      return res.status(200).json({
        message: "Skill Gap Analysis completed successfully!",
        fileName: existingResume.fileName,
        skillGapResult: response.data
      });

    } catch (error) {
      console.error("Skill Gap Analysis Error:", error.message);

      if (error.response) {
        return res.status(error.response.status || 500).json({
          message: "Python AI Skill Gap service returned an error.",
          error: error.response.data
        });
      }

      return res.status(500).json({
        message: "Skill Gap Analysis failed.",
        error: error.message
      });
    }
  }
);
 // ==========================================
// ATS RESUME CHECKER API - ADVANCED
// ==========================================

 app.post(
  "/api/ats-check",
  authMiddleware,
  handleUpload(uploadPDF.single("resume")),
  async (req, res) => {
    try {
      const { jobDescription, jobTitle, resumeId } = req.body;

      if (!jobDescription || !jobDescription.trim()) {
        return res.status(400).json({
          message: "Please enter the Job Description."
        });
      }

      let resumeBuffer;
      let fileName;
      let contentType;

      // Option 1: New PDF upload
      if (req.file) {
        if (!req.file.originalname.toLowerCase().endsWith(".pdf")) {
          return res.status(400).json({
            message: "Only PDF files are allowed."
          });
        }

        resumeBuffer = req.file.buffer;
        fileName = req.file.originalname;
        contentType = req.file.mimetype;
      }

      // Option 2: Use existing saved resume
      else {
        let savedResume;

        if (resumeId) {
          savedResume = await Resume.findOne({
            _id: resumeId,
            userId: req.userId
          });
        } else {
          savedResume = await Resume.findOne({
            userId: req.userId,
            isDefault: true
          });

          if (!savedResume) {
            savedResume = await Resume.findOne({
              userId: req.userId
            }).sort({ createdAt: -1 });
          }
        }

        if (!savedResume) {
          return res.status(404).json({
            message: "No saved resume found. Please upload a resume."
          });
        }

        if (!savedResume.fileData) {
          return res.status(400).json({
            message: "This resume has no saved PDF file. Please upload it again."
          });
        }

        resumeBuffer = savedResume.fileData;
        fileName = savedResume.fileName;
        contentType = savedResume.contentType || "application/pdf";
      }

      const form = new FormData();

      form.append("resume", resumeBuffer, {
        filename: fileName,
        contentType: contentType
      });

      form.append("job_description", jobDescription.trim());
      form.append("job_title", jobTitle || "");

      const response = await axios.post(
        "http://127.0.0.1:5001/ats-check",
        form,
        {
          headers: form.getHeaders(),
          timeout: 120000
        }
      );

      return res.status(200).json({
        message: "Advanced ATS checking completed successfully.",
        fileName,
        atsResult: response.data
      });

    } catch (error) {
      console.error(
        "ATS Checker Error:",
        error.response?.data || error.message
      );

      return res.status(error.response?.status || 500).json({
        message: "ATS checking failed.",
        error: error.response?.data || error.message
      });
    }
  }
);
// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});