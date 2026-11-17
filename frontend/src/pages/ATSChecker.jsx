import React, { useState } from "react";
import "./ATSChecker.css";

function ATSChecker() {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a PDF resume.");
      return;
    }

    if (!jobTitle.trim()) {
      setError("Please enter the job title.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobTitle", jobTitle);
    formData.append("jobDescription", jobDescription);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/ats-check",
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
          data.message || "ATS checking failed."
        );
      }

      setResult(data.atsResult);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const score = Number(result?.match_score) || 0;

  const scoreCards = [
    {
      title: "Keyword Match",
      value: result?.keyword_match ?? 0,
      icon: "🔑"
    },
    {
      title: "Job Title Match",
      value: result?.job_title_match ?? 0,
      icon: "💼"
    },
    {
      title: "Qualifications Match",
      value: result?.qualifications_match ?? 0,
      icon: "🎓"
    },
    {
      title: "Responsibilities Match",
      value: result?.responsibilities_match ?? 0,
      icon: "📋"
    }
  ];

  return (
    <div className="ats-container">

      <div className="ats-page-header">
        <div>
          <span className="ats-eyebrow">
            RESUME OPTIMIZATION
          </span>
          <h1>ATS Resume Checker</h1>
          <p>
            Discover how well your resume matches
            your target job and improve your chances.
          </p>
        </div>

        <div className="ats-header-icon">📊</div>
      </div>

      {/* INPUT SECTION */}

      <form onSubmit={handleCheck}>

        <div className="ats-input-card">

          <div className="ats-section-heading">
            <div className="ats-heading-icon">🎯</div>
            <div>
              <h2>Job Description Matching</h2>
              <p>
                Upload your resume and provide the job
                details to check compatibility.
              </p>
            </div>
          </div>

          <div className="ats-form-group">
            <label>Job Title</label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="ats-form-group">
            <label>Job Description</label>
            <textarea
              placeholder="Paste the complete job description here. Include required skills, qualifications and responsibilities..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={7}
            />
            <small>
              {jobDescription.length} characters
            </small>
          </div>

          <div className="ats-form-group">
            <label>Upload Your Resume (PDF)</label>

            <label className="ats-file-upload">
              <span className="ats-file-icon">📄</span>
              <span>
                <strong>
                  {file ? file.name : "Choose your resume"}
                </strong>
                <small>
                  {file
                    ? "PDF selected successfully"
                    : "PDF format only"}
                </small>
              </span>

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const selected = e.target.files?.[0];

                  setFile(selected || null);
                  setResult(null);
                  setError("");
                }}
              />
            </label>
          </div>

          {error && (
            <div className="ats-error">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="ats-analyze-btn"
            disabled={loading}
          >
            {loading
              ? "Analyzing Resume..."
              : "✦ Analyze Job Match"}
          </button>

        </div>
      </form>

      {/* RESULTS */}

      {result && (
        <div className="ats-results">

          <div className="ats-result-heading">
            <div>
              <span className="ats-eyebrow">
                ANALYSIS COMPLETE
              </span>
              <h2>Your ATS Match Report</h2>
              <p>
                Here is how your resume matches the
                {` ${jobTitle}`} position.
              </p>
            </div>
            <span className="ats-success-label">
              ✓ Completed
            </span>
          </div>

          {/* MAIN SCORE */}

          <div className="ats-score-layout">

            <div className="ats-score-card">
              <h3>Overall Match Score</h3>

              <div
                className="ats-circle"
                style={{
                  "--score":`${score * 3.6}deg`
                }}
              >
                <div className="ats-circle-inner">
                  <strong>{score}%</strong>
                  <span>Match Score</span>
                </div>
              </div>

              <p>
                {score >= 75
                  ? "Excellent job match!"
                  : score >= 50
                  ? "Good match. Some improvements needed."
                  : "Your resume needs improvement."}
              </p>
            </div>

            <div className="ats-metrics-grid">
              {scoreCards.map((card) => (
                <div
                  className="ats-metric-card"
                  key={card.title}
                >
                  <span className="ats-metric-icon">
                    {card.icon}
                  </span>

                  <h3>{card.value}%</h3>
                  <p>{card.title}</p>

                  <div className="ats-progress">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, Number(card.value) || 0)
                        )}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* KEYWORDS */}

          <div className="ats-detail-card">
            <div className="ats-card-title">
              <div>
                <h3>Keyword Analysis</h3>
                <p>
                  Compare your resume keywords with
                  the job requirements.
                </p>
              </div>
              <span>🔍</span>
            </div>

            <div className="ats-keyword-columns">

              <div className="ats-keyword-group">
                <h4>
                  <span className="ats-dot green-dot" />
                  Matched Keywords
                </h4>

                <div className="ats-keyword-list">
                  {result.matched_keywords?.length > 0
                    ? result.matched_keywords.map((word, i) => (
                        <span className="ats-keyword matched" key={i}>
                          ✓ {word}
                        </span>
                      ))
                    : <p>No matching keywords found.</p>}
                </div>
              </div>

              <div className="ats-keyword-group">
                <h4>
                  <span className="ats-dot red-dot" />
                  Missing Keywords
                </h4>

                <div className="ats-keyword-list">
                  {result.missing_keywords?.length > 0
                    ? result.missing_keywords.map((word, i) => (
                        <span className="ats-keyword missing" key={i}>
                          + {word}
                        </span>
                      ))
                    : <p>No missing keywords found.</p>}
                </div>
              </div>

            </div>
          </div>

          {/* ATS FINDINGS */}

          <div className="ats-detail-card">
            <div className="ats-card-title">
              <div>
                <h3>Detailed ATS Findings</h3>
                <p>
                  Basic resume compatibility checks.
                </p>
              </div>
              <span>📋</span>
            </div>

            <div className="ats-findings-summary">
              <strong>
                {result.passed_checks}/{result.total_checks}
              </strong>
              <span>Checks Passed</span>
            </div>

            <div className="ats-findings-list">
              {Object.entries(result.checks || {}).map(
                ([name, passed]) => (
                  <div className="ats-finding-item" key={name}>
                    <span>{name}</span>

                    <span className={passed ? "passed" : "failed"}>
                      {passed ? "✓ Passed" : "✕ Missing"}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* SUGGESTIONS */}

          <div className="ats-detail-card">
            <div className="ats-card-title">
              <div>
                <h3>Improvement Suggestions</h3>
                <p>
                  Recommended actions to improve your resume.
                </p>
              </div>
              <span>💡</span>
            </div>

            <div className="ats-suggestions-list">
              {(result.suggestions || []).map(
                (suggestion, index) => (
                  <div
                    className="ats-suggestion-item"
                    key={index}
                  >
                    <span>💡</span>
                    <p>{suggestion}</p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="ats-note">
            <strong>Note:</strong> This report uses
            keyword-based matching and basic resume checks.
            It is an estimate, not a guarantee of selection
            or compatibility with every company's ATS.
          </div>

        </div>
      )}

    </div>
  );
}

export default ATSChecker;