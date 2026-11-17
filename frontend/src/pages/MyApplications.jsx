import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/apiClient";
import { Link } from "react-router-dom";

const PIPELINE_STAGES = ["Applied", "Reviewing", "Shortlisted", "Interview", "Decision"];

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/applications");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load applications");
      }

      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message || "Error loading applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) {
      return;
    }

    try {
      setWithdrawingId(applicationId);
      setError("");
      setActionSuccess("");

      const response = await apiFetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to withdraw application");
      }

      setActionSuccess("Application withdrawn successfully.");
      setApplications((prev) => prev.filter((app) => app._id !== applicationId));
    } catch (err) {
      setError(err.message || "Error withdrawing application");
    } finally {
      setWithdrawingId(null);
    }
  };

  // Metrics computation
  const totalCount = applications.length;
  const underReviewCount = applications.filter((a) =>
    ["Applied", "Reviewing"].includes(a.status)
  ).length;
  const interviewingCount = applications.filter((a) =>
    ["Shortlisted", "Interview"].includes(a.status)
  ).length;
  const decisionCount = applications.filter((a) =>
    ["Accepted", "Rejected"].includes(a.status)
  ).length;

  const getStageIndex = (status) => {
    if (status === "Applied") return 0;
    if (status === "Reviewing") return 1;
    if (status === "Shortlisted") return 2;
    if (status === "Interview") return 3;
    if (status === "Accepted" || status === "Rejected") return 4;
    return 0;
  };

  const getMatchScoreBadge = (score) => {
    if (score === null || score === undefined) return null;
    let badgeClass = "match-low";
    if (score >= 70) badgeClass = "match-high";
    else if (score >= 45) badgeClass = "match-mid";

    return (
      <span className={`match-badge ${badgeClass}`}>
        ★ {score}% Match
      </span>
    );
  };

  return (
    <DashboardLayout title="My Applications">
      <div className="applications-section">
        <div className="section-heading">
          <div>
            <h2>Application Tracker</h2>
            <p>Monitor the hiring status and progress of your submitted job applications.</p>
          </div>
          <Link to="/jobs" style={{ textDecoration: "none" }}>
            <button
              type="button"
              className="job-apply-btn"
              style={{ padding: "10px 18px", fontSize: "13px" }}
            >
              💼 Browse More Jobs
            </button>
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}
        {actionSuccess && <div className="success-message">{actionSuccess}</div>}

        {/* STATS OVERVIEW */}
        <div className="stats-grid" style={{ marginBottom: "24px" }}>
          <div className="stat-card">
            <div className="stat-top">
              <span>TOTAL APPLICATIONS</span>
              <span className="stat-icon">📨</span>
            </div>
            <h2>{totalCount}</h2>
            <span className="stat-sub">Submitted to date</span>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>UNDER REVIEW</span>
              <span className="stat-icon">⏳</span>
            </div>
            <h2>{underReviewCount}</h2>
            <span className="stat-sub">In screening</span>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>INTERVIEWING</span>
              <span className="stat-icon">🎤</span>
            </div>
            <h2>{interviewingCount}</h2>
            <span className="stat-sub">Shortlisted / rounds</span>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>DECISION</span>
              <span className="stat-icon">📋</span>
            </div>
            <h2>{decisionCount}</h2>
            <span className="stat-sub">Offers & outcomes</span>
          </div>
        </div>

        {/* APPLICATIONS LIST */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            Loading your applications...
          </p>
        ) : applications.length === 0 ? (
          <div className="result-card" style={{ textAlign: "center", padding: "50px 20px" }}>
            <div style={{ fontSize: "42px", marginBottom: "12px" }}>📬</div>
            <h3>No applications yet</h3>
            <p style={{ color: "var(--muted)", margin: "8px auto 20px", maxWidth: "420px" }}>
              You haven't submitted any job applications yet. Head over to the Job Portal to discover roles tailored to your resume profile.
            </p>
            <Link to="/jobs">
              <button type="button" className="job-apply-btn">
                Explore Job Portal
              </button>
            </Link>
          </div>
        ) : (
          <div>
            {applications.map((app) => {
              const job = app.jobId || {};
              const currentStageIdx = getStageIndex(app.status);
              const isRejected = app.status === "Rejected";
              const isAccepted = app.status === "Accepted";

              return (
                <div key={app._id} className="application-card">
                  <div className="application-header">
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--navy)", marginBottom: "4px" }}>
                        {job.title || "Job Position"}
                      </h3>
                      <p style={{ color: "var(--purple)", fontWeight: 600, fontSize: "14px", marginBottom: "6px" }}>
                        {job.company || "Company"} &bull; {job.location || "Location"}
                      </p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                        {job.jobType && (
                          <span className="job-badge">💼 {job.jobType}</span>
                        )}
                        {job.salaryRange && (
                          <span className="job-badge salary">💰 {job.salaryRange}</span>
                        )}
                        {app.resumeId?.fileName && (
                          <span className="job-badge" style={{ background: "#f1eff8" }}>
                            📄 {app.resumeId.fileName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                      {getMatchScoreBadge(app.matchScore)}
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* PIPELINE VISUAL TRACKER */}
                  <div className="pipeline-tracker">
                    <div className="pipeline-line"></div>

                    {PIPELINE_STAGES.map((stage, idx) => {
                      let stepClass = "";
                      let displayLabel = stage;

                      if (stage === "Decision") {
                        if (isRejected) {
                          displayLabel = "Rejected";
                          stepClass = "rejected";
                        } else if (isAccepted) {
                          displayLabel = "Accepted";
                          stepClass = "completed";
                        }
                      } else {
                        if (idx < currentStageIdx) {
                          stepClass = "completed";
                        } else if (idx === currentStageIdx) {
                          stepClass = "active";
                        }
                      }

                      return (
                        <div key={stage} className={`pipeline-step ${stepClass}`}>
                          <div className="pipeline-dot">
                            {idx < currentStageIdx ? "✓" : idx + 1}
                          </div>
                          <span className="pipeline-label">{displayLabel}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* FOOTER ACTIONS */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "16px",
                      paddingTop: "14px",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "var(--text)" }}>
                      Current Status:{" "}
                      <strong
                        style={{
                          color: isRejected
                            ? "#ef4444"
                            : isAccepted
                            ? "#10b981"
                            : "var(--purple)",
                        }}
                      >
                        {app.status}
                      </strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleWithdraw(app._id)}
                      disabled={withdrawingId === app._id}
                      style={{
                        background: "#fff0f0",
                        color: "#d94c59",
                        border: "1px solid #ffd4d4",
                        borderRadius: "8px",
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {withdrawingId === app._id ? "Withdrawing..." : "Withdraw Application"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MyApplications;
