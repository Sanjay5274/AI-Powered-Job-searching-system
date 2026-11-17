import React, { useState, useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import "./App.css";

// Convert different backend response formats into arrays
const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value];
  return [];
};

// Get the first available field from backend response
const getField = (obj, keys, fallback = []) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }
  return fallback;
};

// Display text from strings or objects
const displayItem = (item) => {
  if (typeof item === "string") return item;

  return (
    item?.name ||
    item?.skill ||
    item?.title ||
    item?.job_title ||
    item?.role ||
    item?.description ||
    JSON.stringify(item)
  );
};

// Protect pages from users who are not logged in
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/" replace />;
}

// Separate Resume Analysis Page
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

  // Fetch analysis if page is opened directly or refreshed
  useEffect(() => {
    if (resume) return;

    const loadAnalysis = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/resume-history/${resumeId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

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

              <p>
                {resume.fileName || "Your Resume"}
              </p>
            </div>
          </section>

          {/* ANALYSIS STATISTICS */}
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

          {/* ANALYSIS DETAILS */}
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

// Dashboard Page
function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  // Job Matching states
  const [jobTitle, setJobTitle] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobFile, setJobFile] = useState(null);

  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [matchError, setMatchError] = useState("");

  // Fetch resume history from MongoDB
  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/resume-history",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch history"
        );
      }

      setHistory(data.resumes || []);

    } catch (err) {
      setHistoryError(err.message);

    } finally {
      setHistoryLoading(false);
    }
  };

  // Load history when Dashboard opens
  useEffect(() => {
    loadHistory();
  }, []);

  // Scroll to Analysis History when returning from Analysis Page
  useEffect(() => {
    if (location.hash === "#history") {
      document.getElementById("history")?.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, [location]);

  // Delete a resume from MongoDB
  const handleDelete = async (resumeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/resume-history/${resumeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setHistory((previousHistory) =>
        previousHistory.filter(
          (item) => item._id !== resumeId
        )
      );

    } catch (err) {
      setHistoryError(err.message);
    }
  };

  // Open a separate Resume Analysis page
  const handleViewAnalysis = async (resumeId) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/resume-history/${resumeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch analysis"
        );
      }

      // Navigate to separate analysis page
      navigate(`/analysis/${resumeId}`, {
        state: {
          resume: data.resume
        }
      });

    } catch (err) {
      setError(
        err.message || "Unable to view analysis"
      );
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Upload and analyze resume
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a resume PDF file.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/analyze-resume",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      console.log("Backend Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Resume analysis failed."
        );
      }

      const analysis =
        data.aiResult ||
        data.result ||
        data.data ||
        data;

      console.log("Analysis Result:", analysis);

      setResult(analysis);

      // Refresh history after successful upload
      await loadHistory();

    } catch (err) {
      console.error("Analysis Error:", err);

      setError(
        err.message || "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  };
  // Company Job Requirement Matching
  const handleJobMatching = async (e) => {
    e.preventDefault();

    if (!jobTitle.trim()) {
      setMatchError("Please enter a job title.");
      return;
    }

    const skillsList = requiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skillsList.length === 0) {
      setMatchError("Please enter required skills.");
      return;
    }

    if (!jobFile && !selectedResumeId) {
      setMatchError("Please upload a PDF or select an existing resume.");
      return;
    }

    const formData = new FormData();

    formData.append("jobTitle", jobTitle.trim());
    formData.append("requiredSkills", JSON.stringify(skillsList));

    // New PDF takes priority if selected
    if (jobFile) {
      formData.append("resume", jobFile);
    } else {
      formData.append("resumeId", selectedResumeId);
    }

    try {
      setMatchLoading(true);
      setMatchError("");
      setMatchResult(null);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/match-job",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Job matching failed."
        );
      }

      setMatchResult(data.matchResult);

    } catch (err) {
      setMatchError(
        err.message || "Unable to match job requirements."
      );
    } finally {
      setMatchLoading(false);
    }
  };

  // Resume score
  const score = Number(
    getField(
      result,
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

  // Detected skills
  const skills = toArray(
    getField(
      result,
      [
        "detectedSkills",
        "detected_skills",
        "skills",
        "extracted_skills",
        "skills_found"
      ]
    )
  );

  // Missing skills
  const missing = toArray(
    getField(
      result,
      [
        "missingSkills",
        "missing_skills",
        "skills_missing"
      ]
    )
  );

  // AI suggestions
  const suggestions = toArray(
    getField(
      result,
      [
        "suggestions",
        "aiSuggestions",
        "ai_suggestions",
        "improvement_suggestions",
        "recommendations"
      ]
    )
  );

  // Job recommendations
  const jobs = toArray(
    getField(
      result,
      [
        "jobRecommendations",
        "job_recommendations",
        "recommendedJobs",
        "recommended_jobs",
        "jobs"
      ]
    )
  );

  // General AI analysis
  const summary = getField(
    result,
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

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <span className="brand-icon">↗️</span>
          Match<span>wize</span>
        </div>

        <p className="menu-heading">MAIN MENU</p>

        <nav className="sidebar-menu">

          <a href="#dashboard" className="active">
            <span>▦</span> Dashboard
          </a>

          <a href="#upload">
            <span>⇧</span> Upload & Analyze
          </a>
          <a href="#job-matching">
  <span>🎯</span> Job Matching
</a>

          <a href="#history">
            <span>◷</span> Analysis History
          </a>

          <a href="#history">
            <span>▣</span> My Resumes
          </a>

          <a href="#insights">
            <span>▥</span> Analytics
          </a>

        </nav>

        <div className="sidebar-bottom">

          <a href="#dashboard">♙ Profile</a>

          <a href="#dashboard">⚙️ Settings</a>

          <button onClick={handleLogout}>
            ⇥ Logout
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main" id="dashboard">

        <header className="dashboard-topbar">

          <div>
            <span className="breadcrumb">▦</span>
            Dashboard
          </div>

          <div className="topbar-right">
            <span className="online-dot"></span>
            AI Resume Analyzer
            <span className="user-avatar">U</span>
          </div>

        </header>

        <div className="dashboard-content">

          {/* WELCOME */}
          <section className="welcome-banner">

            <div>
              <span className="welcome-label">
                YOUR CAREER DASHBOARD
              </span>

              <h1>Good morning! 👋</h1>

              <p>
                Ready to land your dream job?
                Let's optimize your resume and track your progress.
              </p>
            </div>

            <button
              className="new-analysis-btn"
              onClick={() =>
                document.getElementById("upload")?.scrollIntoView({
                  behavior: "smooth"
                })
              }
            >
              ✧ New Analysis
            </button>

          </section>

          {/* STATISTICS */}
          <section className="stats-grid">

            <div className="stat-card">
              <div className="stat-top">
                <span>Total Analyses</span>
                <span className="stat-icon blue">▤</span>
              </div>

              <h2>{history.length}</h2>
              <p>Resume analyses completed</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Resume Score</span>
                <span className="stat-icon green">◎</span>
              </div>

              <h2>{result ? `${score}%` : "--"}</h2>
              <p>Latest resume score</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Skills Detected</span>
                <span className="stat-icon purple">▣</span>
              </div>

              <h2>{skills.length}</h2>
              <p>Skills found in latest analysis</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Recommended Jobs</span>
                <span className="stat-icon orange">♙</span>
              </div>

              <h2>{jobs.length}</h2>
              <p>Career opportunities</p>
            </div>

          </section>

          {/* UPLOAD RESUME */}
          <section className="upload-card" id="upload">

            <div className="section-heading">
              <div>
                <h2>Upload & Analyze Resume</h2>
                <p>Get AI-powered insights about your resume.</p>
              </div>
              <span className="upload-heading-icon">✧</span>
            </div>

            <form onSubmit={handleUpload}>
              <label htmlFor="resume" className="file-upload-area">
                <span className="upload-big-icon">📄</span>
                <strong>Choose your resume PDF</strong>
                <span>Click below to select your resume</span>

                <input
                  id="resume"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setError("");
                  }}
                />

                <span className="choose-file-btn">
                  Browse Files
                </span>
              </label>

              {file && (
                <p className="selected-file">
                  Selected: {file.name}
                </p>
              )}

              <button
                type="submit"
                className="analyze-btn"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "✧ Analyze Resume"}
              </button>
            </form>

            {error && (
              <p className="error-message">{error}</p>
            )}
          </section>
          {/* COMPANY JOB MATCHING */}
          <section className="upload-card" id="job-matching">

            <div className="section-heading">
              <div>
                <h2>Company Job Requirement Matching</h2>
                <p>Compare your resume with company job requirements.</p>
              </div>
              <span className="upload-heading-icon">🎯</span>
            </div>

            <form onSubmit={handleJobMatching}>

              <label>Job Title</label>
              <input
                type="text"
                placeholder="Example: Python Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />

              <label>Company Required Skills</label>
              <textarea
                rows="3"
                placeholder="Python, SQL, Django, Git"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
              />

              <p className="form-help">
                Enter skills separated by commas.
              </p>

              <label>Select Existing Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => {
                  setSelectedResumeId(e.target.value);
                  setJobFile(null);
                }}
              >
                <option value="">Choose an existing resume</option>

                {history.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.fileName || "Resume"}
                  </option>
                ))}
              </select>

              <p className="form-help">OR upload a new PDF resume</p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;

                  if (selectedFile && selectedFile.type !== "application/pdf") {
                    setJobFile(null);
                    setMatchError("Only PDF files are allowed.");
                    e.target.value = "";
                    return;
                  }

                  setJobFile(selectedFile);
                  setSelectedResumeId("");
                  setMatchError("");
                }}
              />

              {jobFile && (
                <p className="selected-file">
                  Selected: {jobFile.name}
                </p>
              )}

              <button
                type="submit"
                className="analyze-btn"
                disabled={matchLoading}
              >
                {matchLoading ? "Matching..." : "🎯 Match Now"}
              </button>

            </form>

            {matchError && (
              <p className="error-message">{matchError}</p>
            )}

            {/* MATCHING RESULTS */}
            {matchResult && (
              <div className="result-panel">

                <h2>Job Matching Result</h2>

                <h3>{matchResult.job_title}</h3>

                <div className="recent-score">
                  <span>{matchResult.match_percentage}%</span>
                  <span>Job Match Percentage</span>
                </div>

                <p>
                  Matching Skills:{" "}
                  <strong>{matchResult.total_matched_skills}</strong>
                </p>

                <p>
                  Required Skills:{" "}
                  <strong>{matchResult.total_required_skills}</strong>
                </p>

                <h3>Matching Skills</h3>

                {matchResult.matched_skills?.length > 0 ? (
                  <ul className="improvement-list">
                    {matchResult.matched_skills.map((skill, index) => (
                      <li key={index}>✓ {skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No matching skills found.</p>
                )}

                <h3>Missing Skills</h3>

                {matchResult.missing_skills?.length > 0 ? (
                  <ul className="improvement-list">
                    {matchResult.missing_skills.map((skill, index) => (
                      <li key={index}>• {skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No missing skills. Great match!</p>
                )}

              </div>
            )}

          </section>

          {/* RESUME ANALYSIS HISTORY */}
          <section className="upload-card" id="history">

            <div className="section-heading">
              <div>
                <h2>Analysis History</h2>
                <p>Your previous resume analysis records.</p>
              </div>
            </div>

            {historyLoading ? (
              <p>Loading history...</p>
            ) : historyError ? (
              <p className="error-message">{historyError}</p>
            ) : history.length > 0 ? (

              <div className="history-list">
                {history.map((item) => (
                  <div className="result-panel" key={item._id}>

                    <h3>{item.fileName || "Resume"}</h3>

                    <p>
                      Resume Score:{" "}
                      <strong>{item.score ?? 0}/100</strong>
                    </p>

                    <p>
                      Skills Detected: {item.skills?.length || 0}
                    </p>

                    <small>
                      Uploaded:{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </small>

                    <br />

                    <button
                      type="button"
                      className="analyze-btn"
                      onClick={() => handleViewAnalysis(item._id)}
                    >
                      👁️ View Analysis
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(item._id)}
                    >
                      🗑️ Delete Resume
                    </button>

                  </div>
                ))}
              </div>

            ) : (
              <div className="empty-state">
                <span>📂</span>
                <p>No resume history found.</p>
              </div>
            )}

          </section>
          {/* AI ANALYSIS RESULTS AFTER NEW UPLOAD */}
          {result && (
            <section className="bottom-grid" id="results">

              {/* RESUME SCORE */}
              <div className="result-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Resume Score</h2>
                    <p>Your AI-based resume score</p>
                  </div>
                </div>

                <div className="recent-score">
                  <span>{score}/100</span>
                  <span>Resume Score</span>
                </div>

                <div className="result-detail">
                  <p>
                    Detected Skills:
                    <strong>{skills.length}</strong>
                  </p>

                  <p>
                    Missing Skills:
                    <strong>{missing.length}</strong>
                  </p>

                  <p>
                    Recommended Jobs:
                    <strong>{jobs.length}</strong>
                  </p>
                </div>
              </div>

              {/* DETECTED SKILLS */}
              <div className="result-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Detected Skills</h2>
                    <p>Skills identified from your resume</p>
                  </div>
                </div>

                {skills.length > 0 ? (
                  <ul className="improvement-list">
                    {skills.map((skill, index) => (
                      <li key={index}>
                        {displayItem(skill)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No detected skills returned by AI.</p>
                )}
              </div>

              {/* MISSING SKILLS */}
              <div className="result-panel" id="insights">
                <div className="panel-heading">
                  <div>
                    <h2>Missing Skills</h2>
                    <p>Skills you can improve or learn</p>
                  </div>
                </div>

                {missing.length > 0 ? (
                  <ul className="improvement-list">
                    {missing.map((skill, index) => (
                      <li key={index}>
                        {displayItem(skill)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No missing skills returned by AI.</p>
                )}
              </div>

              {/* AI SUGGESTIONS */}
              <div className="result-panel">
                <div className="panel-heading">
                  <div>
                    <h2>AI Suggestions</h2>
                    <p>Suggestions to improve your resume</p>
                  </div>
                </div>

                {suggestions.length > 0 ? (
                  <div className="suggestion-list">
                    {suggestions.map((item, index) => (
                      <p key={index}>
                        • {displayItem(item)}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p>No suggestions returned by AI.</p>
                )}
              </div>

              {/* JOB RECOMMENDATIONS */}
              <div className="result-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Job Recommendations</h2>
                    <p>Jobs based on your resume skills</p>
                  </div>
                </div>

                {jobs.length > 0 ? (
                  <div className="suggestion-list">
                    {jobs.map((job, index) => (
                      <p key={index}>
                        {index + 1}. {displayItem(job)}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p>No job recommendations returned by AI.</p>
                )}
              </div>

              {/* GENERAL AI ANALYSIS */}
              {summary && (
                <div className="result-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>AI Resume Analysis</h2>
                      <p>Overall analysis of your resume</p>
                    </div>
                  </div>

                  <p>
                    {typeof summary === "string"
                      ? summary
                      : JSON.stringify(summary)}
                  </p>
                </div>
              )}

            </section>
          )}

          {!result && !loading && (
            <div className="result-panel" id="results">
              <div className="empty-state">
                <span>📊</span>
                <p>No analyses yet.</p>
                <small>
                  Upload your resume to see AI analysis results.
                </small>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <footer className="dashboard-footer">
            © 2026 Matchwize | AI Resume Analyzer
          </footer>
          </div>
      </main>
    </div>
  );
}

// Main App
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* SEPARATE RESUME ANALYSIS PAGE */}
        <Route
          path="/analysis/:resumeId"
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;