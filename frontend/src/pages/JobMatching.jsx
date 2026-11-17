import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { toArray, displayItem } from "../utils/resumeHelpers";

function JobMatching() {
  const [history, setHistory] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [jobFile, setJobFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/resume-history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          const resumes = Array.isArray(data)
            ? data
            : data.resumes || [];

          setHistory(resumes);

          if (resumes.length > 0) {
            setResumeId(resumes[0]._id);
          }
        }
      } catch (err) {
        setError("Unable to load resume history.");
      }
    };

    fetchHistory();
  }, []);

  const handleJobMatching = async (e) => {
    e.preventDefault();

    if (!resumeId) {
      setError("Please upload a resume first.");
      return;
    }

    if (!jobTitle.trim() && !requiredSkills.trim() && !jobFile) {
      setError("Enter job details or upload a job description.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();

      formData.append("resumeId", resumeId);
      formData.append("jobTitle", jobTitle);
      formData.append("requiredSkills", requiredSkills);

      if (jobFile) {
        formData.append("jobDescription", jobFile);
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/match-job",
        {
          method: "POST",
          headers: {
            Authorization:`Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Job matching failed.");
      }

      setResult(data.matchResult || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const matchedSkills = toArray(
    result?.matchedSkills || result?.matched_skills
  );

  const missingSkills = toArray(
    result?.missingSkills || result?.missing_skills
  );
  const selectedResume = history.find(
  (item) => item._id === resumeId
);

const comparisonSkills = [
  ...matchedSkills.map((skill) => ({
    skill: displayItem(skill),
    status: "Matched",
  })),
  ...missingSkills.map((skill) => ({
    skill: displayItem(skill),
    status: "Missing",
  })),
];

  return (
    <DashboardLayout title="Job Matching">
      <div className="upload-section">
        <h2>Company Job Requirement Matching</h2>
        <p>Compare your resume with a company's job requirements.</p>

        <form onSubmit=            {handleJobMatching}>
          <label>Select Resume</label>

          <select
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
          >
            <option value="">Select a resume</option>

            {history.map((item) => (
              <option key={item._id} value={item._id}>
                {item.fileName || item.file_name || "Resume"}
              </option>
            ))}
          </select>

          <label>Job Title</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Example: Python Developer"
          />

          <label>Required Skills</label>
          <textarea
            value={requiredSkills}
onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="Example: Python, SQL, HTML, Machine Learning"
          />

          <label>Upload Job Description (Optional)</label>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setJobFile(e.target.files[0])}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Matching..." : "Check Job Match"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </div>

      {result && (
        <div className="analysis-results">
          <h2>Job Matching Result</h2>

          <div className="result-card">
            <h3>Matching Percentage</h3>
            <h1>
              {result.matchPercentage ??
                result.match_percentage ??
                result.score ??
                0}%
            </h1>
          </div>
          
            <div className="result-card">
            <h3>Matched Skills</h3>
            {matchedSkills.length ? (
              matchedSkills.map((item, index) => (
                <p key={index}>{displayItem(item)}</p>
              ))
            ) : (
              <p>No matched skills found.</p>
            )}
          </div>

          <div className="result-card">
            <h3>Missing Skills</h3>
            {missingSkills.length ? (
              missingSkills.map((item, index) => (
                <p key={index}>{displayItem(item)}</p>
              ))
            ) : (
              <p>No missing skills found.</p>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default JobMatching;