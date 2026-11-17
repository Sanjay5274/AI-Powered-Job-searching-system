const express = require("express");
const jwt = require("jsonwebtoken");
const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const Resume = require("../models/Resume");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Helper to calculate skill match percentage between candidate skills and job requirements
function calculateMatchScore(candidateSkills = [], requiredSkills = [], defaultResumeScore = 0) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return defaultResumeScore > 0 ? Math.min(100, defaultResumeScore) : 75;
  }

  const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase().trim());
  let matchedCount = 0;

  requiredSkills.forEach((reqSkill) => {
    const lower = reqSkill.toLowerCase().trim();
    if (normalizedCandidate.some((c) => c.includes(lower) || lower.includes(c))) {
      matchedCount++;
    }
  });

  const skillMatch = Math.round((matchedCount / requiredSkills.length) * 100);

  if (defaultResumeScore > 0) {
    // Weighted average: 70% skill match, 30% resume quality score
    return Math.min(100, Math.round(skillMatch * 0.7 + defaultResumeScore * 0.3));
  }

  return Math.min(100, Math.max(30, skillMatch));
}

// Initial sample jobs seeder
const INITIAL_JOBS = [
  {
    title: "AI / Machine Learning Engineer",
    company: "NeuroTech Labs",
    location: "San Francisco, CA (Remote)",
    jobType: "Remote",
    experienceLevel: "Mid-level",
    salaryRange: "$130,000 - $160,000",
    description: "Build cutting-edge resume parsing, NLP recommendation models, and predictive candidate scoring systems using PyTorch, Scikit-learn, and FastAPI.",
    requiredSkills: ["Python", "Machine Learning", "NLP", "PyTorch", "Docker", "FastAPI"],
  },
  {
    title: "Senior Full Stack Developer",
    company: "Apex Cloud Systems",
    location: "New York, NY",
    jobType: "Full-time",
    experienceLevel: "Senior-level",
    salaryRange: "$140,000 - $175,000",
    description: "Architect and scale mission-critical web applications with React, Node.js, and MongoDB. Lead frontend architecture, performance tuning, and REST API development.",
    requiredSkills: ["React", "Node.js", "MongoDB", "Express", "TypeScript", "REST APIs"],
  },
  {
    title: "Frontend React Developer",
    company: "Pulse Interactive",
    location: "Austin, TX (Hybrid)",
    jobType: "Full-time",
    experienceLevel: "Mid-level",
    salaryRange: "$105,000 - $130,000",
    description: "Craft pixel-perfect, responsive web portals using modern React, Vite, and CSS. Collaborate with product designers to create engaging candidate and recruiter experiences.",
    requiredSkills: ["React", "JavaScript", "HTML", "CSS", "Vite", "Git"],
  },
  {
    title: "Python Backend Developer",
    company: "DataStream Analytics",
    location: "Remote",
    jobType: "Remote",
    experienceLevel: "Mid-level",
    salaryRange: "$115,000 - $145,000",
    description: "Develop robust data pipelines, document parsing engines, and microservices in Python. Integrate with relational and NoSQL databases for high-throughput job matching.",
    requiredSkills: ["Python", "Flask", "SQL", "MongoDB", "Git", "Docker"],
  },
  {
    title: "DevOps & Cloud Engineer",
    company: "CloudScale Infrastructure",
    location: "Seattle, WA",
    jobType: "Full-time",
    experienceLevel: "Senior-level",
    salaryRange: "$145,000 - $180,000",
    description: "Implement CI/CD automation pipelines, maintain Kubernetes container clusters, and manage secure AWS/GCP cloud environments for high-availability recruitment platforms.",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git"],
  },
  {
    title: "Junior Software Engineer",
    company: "InnovateX Tech",
    location: "Boston, MA (Hybrid)",
    jobType: "Full-time",
    experienceLevel: "Entry-level",
    salaryRange: "$80,000 - $95,000",
    description: "Ideal for aspiring engineers with strong foundations in JavaScript, Python, and web fundamentals. Join our mentorship-driven product engineering squad.",
    requiredSkills: ["JavaScript", "Python", "HTML", "CSS", "SQL", "Git"],
  },
];

async function ensureSeedJobs() {
  try {
    const count = await Job.countDocuments();
    if (count === 0) {
      await Job.insertMany(INITIAL_JOBS);
      console.log("Seeded initial job postings into database");
    }
  } catch (err) {
    console.error("Error seeding initial jobs:", err.message);
  }
}

// Ensure seed jobs run on first import/startup
ensureSeedJobs();

// Optional user extractor helper from token
function extractOptionalUserId(req) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.userId;
    }
  } catch {
    // Ignore invalid or expired token in optional helper
  }
  return null;
}

// GET /api/jobs - Search and filter jobs
router.get("/jobs", async (req, res) => {
  try {
    await ensureSeedJobs();

    const { search, q, jobType, location, skill, experienceLevel } = req.query;
    const query = { isActive: true };

    const searchText = search || q;
    if (searchText && searchText.trim()) {
      const term = searchText.trim();
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { company: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { requiredSkills: { $regex: term, $options: "i" } },
      ];
    }

    if (jobType && jobType !== "All") {
      query.jobType = jobType;
    }

    if (experienceLevel && experienceLevel !== "All") {
      query.experienceLevel = experienceLevel;
    }

    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: "i" };
    }

    if (skill && skill.trim()) {
      query.requiredSkills = { $regex: skill.trim(), $options: "i" };
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    // Optional user matching score calculation if user is signed in
    const userId = extractOptionalUserId(req);
    let userApplications = [];
    let userResume = null;

    if (userId) {
      userApplications = await JobApplication.find({ userId }).select("jobId status");
      userResume = await Resume.findOne({ userId, isDefault: true }) ||
                   await Resume.findOne({ userId }).sort({ createdAt: -1 });
    }

    const appliedJobIds = new Set(userApplications.map((a) => a.jobId.toString()));
    const applicationMap = new Map(userApplications.map((a) => [a.jobId.toString(), a.status]));

    const enrichedJobs = jobs.map((job) => {
      const jobObj = job.toObject();
      const hasApplied = appliedJobIds.has(job._id.toString());
      const applicationStatus = applicationMap.get(job._id.toString()) || null;

      let matchScore = null;
      if (userResume) {
        matchScore = calculateMatchScore(userResume.skills, job.requiredSkills, userResume.score);
      }

      return {
        ...jobObj,
        hasApplied,
        applicationStatus,
        matchScore,
      };
    });

    res.status(200).json({
      jobs: enrichedJobs,
      total: enrichedJobs.length,
      candidateResumeDetected: !!userResume,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
});

// GET /api/jobs/:id - Get individual job details
router.get("/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job posting not found",
      });
    }

    const userId = extractOptionalUserId(req);
    let hasApplied = false;
    let applicationStatus = null;
    let matchScore = null;

    if (userId) {
      const application = await JobApplication.findOne({ jobId: job._id, userId });
      if (application) {
        hasApplied = true;
        applicationStatus = application.status;
        matchScore = application.matchScore;
      } else {
        const userResume = (await Resume.findOne({ userId, isDefault: true })) ||
                           (await Resume.findOne({ userId }).sort({ createdAt: -1 }));
        if (userResume) {
          matchScore = calculateMatchScore(userResume.skills, job.requiredSkills, userResume.score);
        }
      }
    }

    res.status(200).json({
      job: {
        ...job.toObject(),
        hasApplied,
        applicationStatus,
        matchScore,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch job details",
      error: error.message,
    });
  }
});

// POST /api/jobs/:id/apply - Apply to a job
router.post("/jobs/:id/apply", authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job posting not found",
      });
    }

    // Check for duplicate application
    const existingApplication = await JobApplication.findOne({
      jobId: job._id,
      userId: req.userId,
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You have already applied for this position.",
        application: existingApplication,
      });
    }

    // Find candidate's resume (either provided in body or default/latest)
    let resume = null;
    if (req.body.resumeId) {
      resume = await Resume.findOne({ _id: req.body.resumeId, userId: req.userId });
    }
    if (!resume) {
      resume = await Resume.findOne({ userId: req.userId, isDefault: true });
    }
    if (!resume) {
      resume = await Resume.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    }

    const matchScore = calculateMatchScore(
      resume?.skills || [],
      job.requiredSkills || [],
      resume?.score || 0
    );

    const application = await JobApplication.create({
      jobId: job._id,
      userId: req.userId,
      resumeId: resume ? resume._id : null,
      matchScore,
      status: "Applied",
      notes: req.body.notes || "",
    });

    const populatedApp = await JobApplication.findById(application._id)
      .populate("jobId", "title company location jobType salaryRange")
      .populate("resumeId", "fileName score");

    res.status(201).json({
      message: "Application submitted successfully!",
      application: populatedApp,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit application",
      error: error.message,
    });
  }
});

// GET /api/applications - Get candidate's applications
router.get("/applications", authMiddleware, async (req, res) => {
  try {
    const applications = await JobApplication.find({ userId: req.userId })
      .populate("jobId")
      .populate("resumeId", "fileName score")
      .sort({ createdAt: -1 });

    res.status(200).json({
      applications,
      total: applications.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
});

// DELETE /api/applications/:id - Withdraw application
router.delete("/applications/:id", authMiddleware, async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (application.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to withdraw this application",
      });
    }

    await application.deleteOne();

    res.status(200).json({
      message: "Application withdrawn successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to withdraw application",
      error: error.message,
    });
  }
});

module.exports = router;
