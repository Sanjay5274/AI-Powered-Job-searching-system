import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/apiClient";
import { Link } from "react-router-dom";

function ResumeComparison() {
  const [resumes, setResumes] = useState([]);
  const [resumeId1, setResumeId1] = useState("");
  const [resumeId2, setResumeId2] = useState("");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/resume-history");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load resumes");
      }

      const list = data.resumes || [];
      setResumes(list);

      if (list.length >= 2) {
        setResumeId1(list[1]._id); // Older version
        setResumeId2(list[0]._id); // Newer version
      } else if (list.length === 1) {
        setResumeId1(list[0]._id);
      }
    } catch (err) {
      setError(err.message || "Failed to load resume list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCompare = async (e) => {
    if (e) e.preventDefault();

    if (!resumeId1 || !resumeId2) {
      setError("Please select two resumes to compare.");
      return;
    }

    if (resumeId1 === resumeId2) {
      setError("Please select two distinct resumes to perform a comparative analysis.");
      return;
    }

    try {
      setComparing(true);
      setError("");
      setActionSuccess("");

      const response = await apiFetch("/api/resumes/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId1, resumeId2 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Comparison failed");
      }

      setComparison(data.comparison);
    } catch (err) {
      setError(err.message || "Error comparing resumes");
    } finally {
      setComparing(false);
    }
  };

  // Auto trigger comparison if two resumes are pre-selected
  useEffect(() => {
    if (resumeId1 && resumeId2 && resumeId1 !== resumeId2 && !comparison) {
      handleCompare();
    }
  }, [resumeId1, resumeId2]);

  const handleSetDefault = async (resumeId) => {
    try {
      setActionSuccess("");
      setError("");

      const response = await apiFetch(`/api/resumes/${resumeId}/default`, {
        method: "PUT",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to set default resume");
      }

      setActionSuccess("Active default resume updated successfully!");
    } catch (err) {
      setError(err.message || "Error setting default resume");
    }
  };

  return (
    <DashboardLayout title="Resume Comparison">
      <div className="resume-comparison-section">
        <div className="section-heading">
          <div>
            <h2>Resume Version Comparison</h2>
            <p>
              Compare two versions of your resume side by side to measure ATS score growth, keyword coverage, and skill expansion.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/upload" style={{ textDecoration: "none" }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "10px 18px", fontSize: "13px" }}
              >
                ⇧ Upload New Version
              </button>
            </Link>

            <Link to="/resume-builder" style={{ textDecoration: "none" }}>
              <button
                type="button"
                className="job-apply-btn"
                style={{ padding: "10px 18px", fontSize: "13px" }}
              >
                📄 Resume Builder
              </button>
            </Link>
          </div>
        </div>

        {error && <div className="error-message" style={{ marginBottom: "16px" }}>{error}</div>}
        {actionSuccess && <div className="success-message" style={{ marginBottom: "16px" }}>{actionSuccess}</div>}

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            Loading candidate resumes...
          </p>
        ) : resumes.length < 2 ? (
          <div className="result-card" style={{ textAlign: "center", padding: "45px 20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚖️</div>
            <h3>Need at least 2 resumes to compare</h3>
            <p style={{ color: "var(--muted)", margin: "8px auto 20px", maxWidth: "450px" }}>
              You currently have {resumes.length} resume in your history. Upload an updated revision or create an ATS resume in the builder to see comparative metrics.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link to="/upload">
                <button type="button" className="job-apply-btn">
                  Upload Resume PDF
                </button>
              </Link>
              <Link to="/resume-builder">
                <button type="button" className="btn-secondary">
                  Create with Resume Builder
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* SELECTION BAR */}
            <form className="comparison-selection-bar" onSubmit={handleCompare}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--navy)", marginBottom: "6px" }}>
                  Version A (Baseline / Older)
                </label>
                <select
                  className="job-filter-select"
                  style={{ width: "100%" }}
                  value={resumeId1}
                  onChange={(e) => setResumeId1(e.target.value)}
                >
                  <option value="">Select Baseline Resume</option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.fileName} (Score: {r.score ?? 0}%) – {new Date(r.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--navy)", marginBottom: "6px" }}>
                  Version B (Comparison / Newer)
                </label>
                <select
                  className="job-filter-select"
                  style={{ width: "100%" }}
                  value={resumeId2}
                  onChange={(e) => setResumeId2(e.target.value)}
                >
                  <option value="">Select Comparison Resume</option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.fileName} (Score: {r.score ?? 0}%) – {new Date(r.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
                <button
                  type="submit"
                  className="job-apply-btn"
                  disabled={comparing || !resumeId1 || !resumeId2 || resumeId1 === resumeId2}
                  style={{ padding: "11px 24px" }}
                >
                  {comparing ? "Comparing Resumes..." : "Compare Selected Resumes"}
                </button>
              </div>
            </form>

            {/* COMPARISON RESULTS */}
            {comparison && (
              <div>
                {/* DELTA SUMMARY BANNER */}
                <div
                  style={{
                    background:
                      comparison.scoreDelta > 0
                        ? "#ecfdf5"
                        : comparison.scoreDelta < 0
                        ? "#fff1f2"
                        : "#f8fafc",
                    border: `1px solid ${
                      comparison.scoreDelta > 0
                        ? "#a7f3d0"
                        : comparison.scoreDelta < 0
                        ? "#fecdd3"
                        : "#e2e8f0"
                    }`,
                    borderRadius: "14px",
                    padding: "20px 24px",
                    marginBottom: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color:
                          comparison.scoreDelta > 0
                            ? "#047857"
                            : comparison.scoreDelta < 0
                            ? "#b91c1c"
                            : "#475569",
                        marginBottom: "4px",
                      }}
                    >
                      Comparison Verdict: {comparison.verdict}
                    </span>
                    <h3 style={{ fontSize: "16px", color: "var(--navy)", margin: 0 }}>
                      {comparison.summary}
                    </h3>
                  </div>

                  <div
                    className={`delta-badge ${
                      comparison.scoreDelta > 0
                        ? "delta-positive"
                        : comparison.scoreDelta < 0
                        ? "delta-negative"
                        : "delta-neutral"
                    }`}
                    style={{ fontSize: "16px", padding: "8px 18px" }}
                  >
                    {comparison.scoreDelta > 0
                      ? `+${comparison.scoreDelta}%`
                      : `${comparison.scoreDelta}%`}
                  </div>
                </div>

                {/* SIDE BY SIDE METRICS */}
                <div className="comparison-grid">
                  {/* RESUME 1 */}
                  <div className="comparison-column">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                          Version A (Baseline)
                        </span>
                        <h3 style={{ fontSize: "17px", color: "var(--navy)", marginTop: "2px" }}>
                          {comparison.resume1.fileName}
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--muted)" }}>
                          Uploaded: {new Date(comparison.resume1.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--navy)" }}>
                          {comparison.resume1.score}%
                        </span>
                        <span style={{ display: "block", fontSize: "10px", color: "var(--muted)" }}>
                          ATS Score
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <strong style={{ fontSize: "12px", color: "var(--text)" }}>
                        Detected Skills ({comparison.resume1.skills.length}):
                      </strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {comparison.resume1.skills.map((s, idx) => (
                          <span key={idx} className="skill-tag">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RESUME 2 */}
                  <div className="comparison-column">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--purple)", textTransform: "uppercase" }}>
                          Version B (Comparison)
                        </span>
                        <h3 style={{ fontSize: "17px", color: "var(--navy)", marginTop: "2px" }}>
                          {comparison.resume2.fileName}
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--muted)" }}>
                          Uploaded: {new Date(comparison.resume2.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "24px",
                            fontWeight: 800,
                            color:
                              comparison.scoreDelta >= 0 ? "var(--purple)" : "#d94c59",
                          }}
                        >
                          {comparison.resume2.score}%
                        </span>
                        <span style={{ display: "block", fontSize: "10px", color: "var(--muted)" }}>
                          ATS Score
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <strong style={{ fontSize: "12px", color: "var(--text)" }}>
                        Detected Skills ({comparison.resume2.skills.length}):
                      </strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {comparison.resume2.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="skill-tag"
                            style={
                              comparison.gainedSkills.includes(s)
                                ? { background: "#dcfce7", color: "#15803d", borderColor: "#86efac" }
                                : {}
                            }
                          >
                            {s}
                            {comparison.gainedSkills.includes(s) && " ★ New"}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
                      <button
                        type="button"
                        onClick={() => handleSetDefault(comparison.resume2.id)}
                        className="job-apply-btn"
                        style={{ width: "100%", fontSize: "12px" }}
                      >
                        ✓ Set Version B as Active Default Resume
                      </button>
                    </div>
                  </div>
                </div>

                {/* SKILLS DELTA SECTION */}
                <div className="result-card" style={{ padding: "24px", marginTop: "20px" }}>
                  <h3 style={{ fontSize: "16px", color: "var(--navy)", marginBottom: "14px" }}>
                    Skill Difference Breakdown
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                    {/* GAINED SKILLS */}
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "16px", borderRadius: "10px" }}>
                      <h4 style={{ color: "#166534", fontSize: "13px", marginBottom: "8px" }}>
                        + Skills Added in Version B ({comparison.gainedSkills.length})
                      </h4>
                      {comparison.gainedSkills.length === 0 ? (
                        <p style={{ fontSize: "12px", color: "#4b5563" }}>No new skills added.</p>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {comparison.gainedSkills.map((s, idx) => (
                            <span key={idx} style={{ background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* LOST SKILLS */}
                    <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", padding: "16px", borderRadius: "10px" }}>
                      <h4 style={{ color: "#9f1239", fontSize: "13px", marginBottom: "8px" }}>
                        - Skills Removed in Version B ({comparison.lostSkills.length})
                      </h4>
                      {comparison.lostSkills.length === 0 ? (
                        <p style={{ fontSize: "12px", color: "#4b5563" }}>No previous skills omitted.</p>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {comparison.lostSkills.map((s, idx) => (
                            <span key={idx} style={{ background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SHARED SKILLS */}
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "10px" }}>
                      <h4 style={{ color: "#334155", fontSize: "13px", marginBottom: "8px" }}>
                        = Shared Skills Maintained ({comparison.sharedSkills.length})
                      </h4>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {comparison.sharedSkills.map((s, idx) => (
                          <span key={idx} className="skill-tag">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ResumeComparison;
