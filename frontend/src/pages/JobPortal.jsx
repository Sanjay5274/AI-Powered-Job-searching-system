import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/apiClient";
import { Link } from "react-router-dom";

function JobPortal() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("All");
  const [experienceLevel, setExperienceLevel] = useState("All");

  // Application Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [userResumes, setUserResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState("");
  const [modalError, setModalError] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (jobType !== "All") params.append("jobType", jobType);
      if (experienceLevel !== "All") params.append("experienceLevel", experienceLevel);

      const response = await apiFetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load job listings");
      }

      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.message || "Unable to fetch jobs from server");
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await apiFetch("/api/resume-history");
      if (response.ok) {
        const data = await response.json();
        const resumes = data.resumes || [];
        setUserResumes(resumes);
        if (resumes.length > 0) {
          const defaultRes = resumes.find((r) => r.isDefault) || resumes[0];
          setSelectedResumeId(defaultRes._id);
        }
      }
    } catch {
      // Non-critical, fallback to automatic backend resume selection
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchResumes();
  }, [jobType, experienceLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleOpenApplyModal = (job) => {
    setSelectedJob(job);
    setModalSuccess("");
    setModalError("");
    setNotes("");
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    setModalSuccess("");
    setModalError("");
    setNotes("");
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      setSubmitting(true);
      setModalError("");

      const response = await apiFetch(`/api/jobs/${selectedJob._id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId || undefined,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Application submission failed");
      }

      setModalSuccess("Application submitted successfully!");

      // Update local jobs state to reflect application
      setJobs((prevJobs) =>
        prevJobs.map((j) =>
          j._id === selectedJob._id
            ? { ...j, hasApplied: true, applicationStatus: "Applied" }
            : j
        )
      );

      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      setModalError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
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
    <DashboardLayout title="Job Portal">
      <div className="job-portal-section">
        <div className="section-heading">
          <div>
            <h2>Explore Opportunities</h2>
            <p>Discover open roles matched with your skills and AI resume profile.</p>
          </div>
          <Link to="/applications" style={{ textDecoration: "none" }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: "10px 18px", fontSize: "13px" }}
            >
              📨 My Applications
            </button>
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* SEARCH & FILTERS BAR */}
        <form className="job-filters-bar" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="job-search-input"
            placeholder="Search by job title, company, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="job-filter-select"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="All">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Remote">Remote</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>

          <select
            className="job-filter-select"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
          >
            <option value="All">All Experience Levels</option>
            <option value="Entry-level">Entry-level</option>
            <option value="Mid-level">Mid-level</option>
            <option value="Senior-level">Senior-level</option>
            <option value="Lead">Lead</option>
          </select>

          <button
            type="submit"
            style={{
              padding: "12px 20px",
              background: "linear-gradient(100deg, #6240d9, #855ff0)",
              color: "#fff",
              border: "none",
              borderRadius: "9px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        {/* JOBS GRID */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            Loading available opportunities...
          </p>
        ) : jobs.length === 0 ? (
          <div className="result-card" style={{ textAlign: "center", padding: "40px" }}>
            <h3>No jobs found</h3>
            <p style={{ marginTop: "8px", color: "var(--muted)" }}>
              Try adjusting your search query or filter criteria.
            </p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job._id} className="job-card">
                <div>
                  <div className="job-card-header">
                    <div>
                      <h3 className="job-card-title">{job.title}</h3>
                      <p className="job-card-company">{job.company}</p>
                    </div>
                    {getMatchScoreBadge(job.matchScore)}
                  </div>

                  <div className="job-meta-badges">
                    <span className="job-badge">📍 {job.location}</span>
                    <span
                      className={`job-badge ${
                        job.jobType === "Remote" ? "remote" : ""
                      }`}
                    >
                      💼 {job.jobType}
                    </span>
                    {job.salaryRange && (
                      <span className="job-badge salary">
                        💰 {job.salaryRange}
                      </span>
                    )}
                    <span className="job-badge">
                      🎯 {job.experienceLevel || "Mid-level"}
                    </span>
                  </div>

                  <p className="job-card-description">{job.description}</p>

                  <div className="job-skills-tags">
                    {(job.requiredSkills || []).map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="job-card-actions">
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    Posted recently
                  </span>

                  {job.hasApplied ? (
                    <span className="job-applied-badge">
                      ✓ {job.applicationStatus || "Applied"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="job-apply-btn"
                      onClick={() => handleOpenApplyModal(job)}
                    >
                      Apply Now ↗
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* APPLY MODAL */}
        {selectedJob && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: "18px", color: "var(--navy)", marginBottom: "6px" }}>
                Apply to {selectedJob.title}
              </h3>
              <p style={{ color: "var(--purple)", fontWeight: 600, fontSize: "13px", marginBottom: "16px" }}>
                {selectedJob.company} &bull; {selectedJob.location}
              </p>

              {modalError && <div className="error-message" style={{ marginBottom: "12px" }}>{modalError}</div>}
              {modalSuccess && <div className="success-message" style={{ marginBottom: "12px" }}>{modalSuccess}</div>}

              {selectedJob.matchScore !== null && selectedJob.matchScore !== undefined && (
                <div
                  style={{
                    background: "#f3f0fa",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
                    AI Skill Compatibility Score:
                  </span>
                  {getMatchScoreBadge(selectedJob.matchScore)}
                </div>
              )}

              <form onSubmit={handleSubmitApplication}>
                {userResumes.length > 0 && (
                  <div style={{ marginBottom: "14px" }}>
                    <label
                      htmlFor="modal-resume-select"
                      style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#424b68" }}
                    >
                      Select Resume
                    </label>
                    <select
                      id="modal-resume-select"
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 13px",
                        borderRadius: "8px",
                        border: "1px solid #ded8ed",
                        background: "#f3f0fa",
                        fontSize: "13px",
                      }}
                    >
                      {userResumes.map((res) => (
                        <option key={res._id} value={res._id}>
                          {res.fileName} (Score: {res.score || 0}%)
                          {res.isDefault ? " [Default]" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ marginBottom: "18px" }}>
                  <label
                    htmlFor="modal-notes"
                    style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#424b68" }}
                  >
                    Note / Message to Hiring Team (Optional)
                  </label>
                  <textarea
                    id="modal-notes"
                    rows={3}
                    placeholder="Briefly state why you are excited about this role..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 13px",
                      borderRadius: "8px",
                      border: "1px solid #ded8ed",
                      background: "#f3f0fa",
                      fontSize: "13px",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCloseModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="job-apply-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default JobPortal;
