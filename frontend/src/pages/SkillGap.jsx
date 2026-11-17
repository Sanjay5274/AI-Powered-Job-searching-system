import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/apiClient";
import "./SkillGap.css";

function SkillGap() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Fetch user's resume history
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await apiFetch("/api/resume-history");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch resumes."
          );
        }

        const resumeList = Array.isArray(data)
          ? data
          : data.resumes || [];

        setResumes(resumeList);

      } catch (err) {
        setError(err.message);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchResumes();
  }, []);

  // Analyze Skill Gap
  const handleAnalyze = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!jobRole) {
      setError("Please select a target job role.");
      return;
    }

    if (!resumeId) {
      setError("Please select a resume.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await apiFetch(
        "/api/skill-gap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobTitle: jobRole,
            resumeId: resumeId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.error ||
          data.message ||
          "Skill Gap Analysis failed."
        );
      }

      setResult(data.skillGapResult);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Skill Gap Analysis">

      <div className="skill-gap-container">

        <h2>AI Skill Gap Analysis</h2>

        <p>
          Compare your resume skills with the skills
          required for your dream job.
        </p>

        <div className="skill-gap-card">

          <h3>Analyze Your Skills</h3>

          <form onSubmit={handleAnalyze}>

            <label>Select Your Resume</label>

            {historyLoading ? (
              <p>Loading your resumes...</p>
            ) : resumes.length === 0 ? (
              <p>
                No analyzed resumes found.
                Please analyze a resume first.
              </p>
            ) : (
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
              >
                <option value="">Select Resume</option>

                {resumes.map((resume) => (
                  <option
                    key={resume._id}
                    value={resume._id}
                  >
                    {resume.fileName}
                  </option>
                ))}
              </select>
            )}

            <label>Enter Your Target Job Role</label>

            <select
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
            >
              <option value="">Select Job Role</option>
              <option value="Python Developer">
                Python Developer
              </option>
              <option value="Machine Learning Engineer">
                Machine Learning Engineer
              </option>
              <option value="AI Engineer">
                AI Engineer
              </option>
              <option value="Data Analyst">
                Data Analyst
              </option>
              <option value="Frontend Developer">
                Frontend Developer
              </option>
              <option value="Backend Developer">
                Backend Developer
              </option>
              <option value="Full Stack Developer">
                Full Stack Developer
              </option>
            </select>

            <button
              type="submit"
              disabled={
                loading ||
                historyLoading ||
                resumes.length === 0
              }
            >
              {loading
                ? "Analyzing..."
                : "Analyze Skill Gap"}
            </button>

          </form>

          {error && (
            <p className="skill-gap-error">
              {error}
            </p>
          )}

        </div>

        {/* Skill Gap Results */}

        {result && (
          <div className="skill-gap-result">

            <h2>Skill Gap Analysis Result</h2>

            <h3>{result.job_title}</h3>

            <div className="skill-gap-score">
              {result.match_percentage}%
            </div>

            <p>
              Your Job Skill Match Percentage
            </p>

            <div className="skill-gap-stats">

              <div className="matched-skills">
                <h3>
                  Matched Skills (
                  {result.total_matched_skills}
                  )
                </h3>

                {result.matched_skills.length > 0 ? (
                  result.matched_skills.map((skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No matching skills found.</p>
                )}
              </div>

              <div className="missing-skills">
                <h3>
                  Missing Skills (
                  {result.missing_skills.length}
                  )
                </h3>

                {result.missing_skills.length > 0 ? (
                  result.missing_skills.map((skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No missing skills!</p>
                )}
              </div>

            </div>

            <div className="skill-gap-suggestions">

              <h3>AI Learning Suggestions</h3>

              {result.suggestions.map((suggestion, index) => (
                <p key={index}>
                  {index + 1}. {suggestion}
                </p>
              ))}

            </div>

          </div>
        )}

      </div>

    </DashboardLayout>
  );
}

export default SkillGap;