const express = require("express");
const Resume = require("../models/Resume");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Helper to calculate score breakdown for built resumes
function evaluateBuiltResume(data) {
  let score = 0;
  const breakdown = {
    contactInfo: 0,
    summary: 0,
    experience: 0,
    education: 0,
    projects: 0,
    skills: 0,
  };

  // 1. Contact info (max 15)
  if (data.personalInfo?.name && data.personalInfo?.email) {
    breakdown.contactInfo = 10;
    if (data.personalInfo.phone || data.personalInfo.location) {
      breakdown.contactInfo = 15;
    }
  }

  // 2. Summary (max 15)
  if (data.summary && data.summary.trim().length >= 40) {
    breakdown.summary = 15;
  } else if (data.summary && data.summary.trim().length > 0) {
    breakdown.summary = 8;
  }

  // 3. Experience (max 25)
  const expCount = (data.experiences || []).filter((e) => e.title && e.company).length;
  if (expCount >= 2) breakdown.experience = 25;
  else if (expCount === 1) breakdown.experience = 18;

  // 4. Education (max 15)
  const eduCount = (data.education || []).filter((e) => e.degree && e.institution).length;
  if (eduCount >= 1) breakdown.education = 15;

  // 5. Projects (max 15)
  const projCount = (data.projects || []).filter((p) => p.title).length;
  if (projCount >= 2) breakdown.projects = 15;
  else if (projCount === 1) breakdown.projects = 10;

  // 6. Skills (max 15)
  const skillCount = (data.skills || []).length;
  if (skillCount >= 6) breakdown.skills = 15;
  else if (skillCount >= 3) breakdown.skills = 10;
  else if (skillCount >= 1) breakdown.skills = 5;

  score =
    breakdown.contactInfo +
    breakdown.summary +
    breakdown.experience +
    breakdown.education +
    breakdown.projects +
    breakdown.skills;

  return { score: Math.min(100, score), breakdown };
}

// Generate valid minimal PDF buffer for built resumes
function createBuiltPdf(text) {
  const safeText = (text || "Built Resume").replace(/[()]/g, "");
  const stream = `BT /F1 12 Tf 50 700 Td (${safeText.slice(0, 500)}) Tj ET`;
  const streamLen = stream.length;
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLen} >>
stream
${stream}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000${(306 + streamLen).toString().padStart(3, "0")} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${376 + streamLen}
%%EOF`;
  return Buffer.from(pdfContent, "utf-8");
}

// PUT /api/resumes/:id/default - Set resume as default
router.put("/:id/default", authMiddleware, async (req, res) => {
  try {
    const targetResume = await Resume.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!targetResume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    // Set all other user resumes to non-default
    await Resume.updateMany(
      { userId: req.userId, _id: { $ne: targetResume._id } },
      { $set: { isDefault: false } }
    );

    targetResume.isDefault = true;
    await targetResume.save();

    res.status(200).json({
      message: "Default resume updated successfully.",
      resume: targetResume,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to set default resume",
      error: error.message,
    });
  }
});

// POST /api/resumes/compare - Compare two resumes side by side
router.post("/compare", authMiddleware, async (req, res) => {
  try {
    const { resumeId1, resumeId2 } = req.body;

    if (!resumeId1 || !resumeId2) {
      return res.status(400).json({
        message: "Both resumeId1 and resumeId2 are required for comparison.",
      });
    }

    if (resumeId1 === resumeId2) {
      return res.status(400).json({
        message: "Please select two different resumes to compare.",
      });
    }

    const [resume1, resume2] = await Promise.all([
      Resume.findOne({ _id: resumeId1, userId: req.userId }),
      Resume.findOne({ _id: resumeId2, userId: req.userId }),
    ]);

    if (!resume1 || !resume2) {
      return res.status(404).json({
        message: "One or both selected resumes were not found.",
      });
    }

    const score1 = resume1.score ?? 0;
    const score2 = resume2.score ?? 0;
    const delta = score2 - score1;

    const skills1 = (resume1.skills || []).map((s) => s.trim());
    const skills2 = (resume2.skills || []).map((s) => s.trim());

    const lowerSkills1 = new Set(skills1.map((s) => s.toLowerCase()));
    const lowerSkills2 = new Set(skills2.map((s) => s.toLowerCase()));

    const sharedSkills = skills1.filter((s) => lowerSkills2.has(s.toLowerCase()));
    const gainedSkills = skills2.filter((s) => !lowerSkills1.has(s.toLowerCase()));
    const lostSkills = skills1.filter((s) => !lowerSkills2.has(s.toLowerCase()));

    let verdict = "Equal";
    let summary = `Both versions have an identical overall ATS score of ${score1}%.`;
    if (delta > 0) {
      verdict = "Improved";
      summary = `Version 2 improved by +${delta}% over Version 1 (from ${score1}% to ${score2}%).`;
    } else if (delta < 0) {
      verdict = "Decreased";
      summary = `Version 2 scored ${Math.abs(delta)}% lower than Version 1 (from ${score1}% to ${score2}%).`;
    }

    res.status(200).json({
      message: "Resumes compared successfully",
      comparison: {
        resume1: {
          id: resume1._id,
          fileName: resume1.fileName,
          score: score1,
          skills: skills1,
          missingSkills: resume1.missingSkills || [],
          scoreBreakdown: resume1.scoreBreakdown || {},
          createdAt: resume1.createdAt,
        },
        resume2: {
          id: resume2._id,
          fileName: resume2.fileName,
          score: score2,
          skills: skills2,
          missingSkills: resume2.missingSkills || [],
          scoreBreakdown: resume2.scoreBreakdown || {},
          createdAt: resume2.createdAt,
        },
        scoreDelta: delta,
        verdict,
        summary,
        sharedSkills,
        gainedSkills,
        lostSkills,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to compare resumes",
      error: error.message,
    });
  }
});

// POST /api/resumes/save-built - Save resume generated via Resume Builder
router.post("/save-built", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      personalInfo,
      summary,
      experiences,
      education,
      projects,
      skills,
      certifications,
    } = req.body;

    const resumeTitle = title && title.trim() ? title.trim() : "Custom_ATS_Resume";
    const fileName = resumeTitle.toLowerCase().endsWith(".pdf")
      ? resumeTitle
      : `${resumeTitle}.pdf`;

    const { score, breakdown } = evaluateBuiltResume({
      personalInfo,
      summary,
      experiences,
      education,
      projects,
      skills,
    });

    const parsedSkills = Array.isArray(skills)
      ? skills.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean)
      : [];

    const resumeSummaryText = [
      personalInfo?.name,
      personalInfo?.headline,
      summary,
      parsedSkills.join(", "),
    ]
      .filter(Boolean)
      .join("\n");

    const pdfBuffer = createBuiltPdf(resumeSummaryText);

    const newResume = new Resume({
      fileName,
      userId: req.userId,
      fileData: pdfBuffer,
      contentType: "application/pdf",
      isDefault: false,
      skills: parsedSkills,
      score,
      missingSkills: [],
      suggestions: [
        "Include measurable impact metrics and statistics in your job bullets.",
        "Add target keywords matching the specific job postings you apply to.",
      ],
      jobRecommendations: [
        {
          title: personalInfo?.headline || "Software Engineer",
          match_percentage: score,
        },
      ],
      scoreBreakdown: breakdown,
      analysisSummary: summary || "Resume created using Matchwize ATS Resume Builder.",
    });

    await newResume.save();

    res.status(201).json({
      message: "Resume created and saved successfully!",
      resume: newResume,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save built resume",
      error: error.message,
    });
  }
});

module.exports = router;
