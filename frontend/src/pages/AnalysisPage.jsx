import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toArray, getField, displayItem } from "../utils/resumeHelpers";
import { apiFetch } from "../utils/apiClient";
import "../App.css";

function AnalysisPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [resume, setResume] = useState(
    location.state?.resume || null
  );

  const [loading, setLoading] = useState(
    !location.state?.resume
  );

  const [error, setError] = useState("");

  useEffect(() => {
    if (resume) return;

    const loadAnalysis = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await apiFetch(`/api/resume-history/${resumeId}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load analysis"
          );
        }

        setResume(data.resume);

      } catch (err) {
        setError(err.message || "Unable to load analysis");

      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [resumeId, resume]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <div className="dashboard-content">
            <p>Loading resume analysis...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <div className="dashboard-content">
            <h2>Analysis not available</h2>

            <p className="error-message">
              {error || "Resume analysis not found."}
            </p>

            <button
              className="analyze-btn"
              onClick={() => navigate("/dashboard#history")}
            >
              ← Back to History
            </button>
          </div>
        </main>
      </div>
    );
  }

  const score = Number(
    getField(
      resume,
      [
        "score",
        "resumeScore",
        "resume_score",
        "overall_score",
        "match_score"
      ],
      0
    )
  ) || 0;

  const skills = toArray(
    getField(resume, [
      "detectedSkills",
      "detected_skills",
      "skills",
      "extracted_skills",
      "skills_found"
    ])
  );

  const missing = toArray(
    getField(resume, [
      "missingSkills",
      "missing_skills",
      "skills_missing"
    ])
  );

  const suggestions = toArray(
    getField(resume, [
      "suggestions",
      "aiSuggestions",
      "ai_suggestions",
      "improvement_suggestions",
      "recommendations"
    ])
  );

  const jobs = toArray(
    getField(resume, [
      "jobRecommendations",
      "job_recommendations",
      "recommendedJobs",
      "recommended_jobs",
      "jobs"
    ])
  );

  const summary = getField(
    resume,
    [
      "analysis",
      "summary",
      "resume_analysis",
      "analysis_summary",
      "analysisSummary"
    ],
    ""
  );

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">

        <header className="dashboard-topbar">
          <div>
            <span className="breadcrumb">▦</span>
            Resume Analysis
          </div>

          <div className="topbar-right">
            AI Resume Analyzer
            <span className="user-avatar">U</span>
          </div>
        </header>

        <div className="dashboard-content">

          <section className="welcome-banner">
            <div>
              <span className="welcome-label">
                MATCHWIZE AI REPORT
              </span>

              <h1>Resume Analysis</h1>

              <p>{resume.fileName || "Your Resume"}</p>
            </div>
          </section>

          <section className="stats-grid">

            <div className="stat-card">
              <div className="stat-top">
                <span>Resume Score</span>
                <span className="stat-icon green">◎</span>
              </div>
              <h2>{score}/100</h2>
              <p>Overall resume score</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Detected Skills</span>
                <span className="stat-icon purple">▣</span>
              </div>
              <h2>{skills.length}</h2>
              <p>Skills identified</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Missing Skills</span>
                <span className="stat-icon orange">!</span>
              </div>
              <h2>{missing.length}</h2>
              <p>Skills to improve</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Recommended Jobs</span>
                <span className="stat-icon blue">♙</span>
              </div>
              <h2>{jobs.length}</h2>
              <p>Career opportunities</p>
            </div>

          </section>

          <section className="bottom-grid">

            <div className="result-panel">
              <h2>Detected Skills</h2>

              {skills.length > 0 ? (
                <ul className="improvement-list">
                  {skills.map((item, index) => (
                    <li key={index}>
                      {displayItem(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No detected skills available.</p>
              )}
            </div>

            <div className="result-panel">
              <h2>Missing Skills</h2>

              {missing.length > 0 ? (
                <ul className="improvement-list">
                  {missing.map((item, index) => (
                    <li key={index}>
                      {displayItem(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No missing skills available.</p>
              )}
            </div>

            <div className="result-panel">
              <h2>AI Suggestions</h2>

              {suggestions.length > 0 ? (
                <div className="suggestion-list">
                  {suggestions.map((item, index) => (
                    <p key={index}>
                      • {displayItem(item)}
                    </p>
                  ))}
                </div>
              ) : (
                <p>No suggestions available.</p>
              )}
            </div>

            <div className="result-panel">
              <h2>Job Recommendations</h2>

              {jobs.length > 0 ? (
                <div className="suggestion-list">
                  {jobs.map((item, index) => (
                    <p key={index}>
                      {index + 1}. {displayItem(item)}
                    </p>
                  ))}
                </div>
              ) : (
                <p>No job recommendations available.</p>
              )}
            </div>

            {summary && (
              <div className="result-panel">
                <h2>Overall AI Analysis</h2>

                <p>
                  {typeof summary === "string"
                    ? summary
                    : JSON.stringify(summary)}
                </p>
              </div>
            )}

          </section>

          <button
            className="analyze-btn"
            onClick={() => navigate("/dashboard#history")}
          >
            ← Back to History
          </button>

          <footer className="dashboard-footer">
            © 2026 Matchwize | AI Resume Analyzer
          </footer>

        </div>
      </main>
    </div>
  );
}

export default AnalysisPage;