import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { toArray, displayItem } from "../utils/resumeHelpers";
import { apiFetch } from "../utils/apiClient";

function UploadResume() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a PDF resume.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const token = localStorage.getItem("token");

      const response = await apiFetch(
        "/api/analyze-resume",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Resume analysis failed.");
      }

      setResult(data.aiResult || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const skills = toArray(
    result?.detected_skills || result?.skills
  );

  const missingSkills = toArray(
    result?.missing_skills || result?.missingSkills
  );

  const suggestions = toArray(result?.suggestions);

  const jobs = toArray(
    result?.job_recommendations || result?.jobRecommendations
  );

  return (
    <DashboardLayout title="Upload & Analyze">
      <div className="upload-section">
        <h2>Upload Your Resume</h2>
        <p>Select your resume in PDF format for AI analysis.</p>

        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </div>

      {result && (
        <div className="analysis-results">
          <h2>Resume Analysis Result</h2>

          <div className="result-card">
            <h3>Resume Score</h3>
            <h1>
              {result.score ?? result.resume_score ?? 0}%
            </h1>
          </div>

          <div className="result-card">
            <h3>Detected Skills</h3>
            {skills.length ? (
              skills.map((item, index) => (
                <p key={index}>{displayItem(item)}</p>
              ))
            ) : (
              <p>No skills detected.</p>
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

          <div className="result-card">
            <h3>Suggestions</h3>
            {suggestions.length ? (
              suggestions.map((item, index) => (
                <p key={index}>{displayItem(item)}</p>
              ))
            ) : (
              <p>No suggestions available.</p>
            )}
          </div>

          <div className="result-card">
            <h3>Job Recommendations</h3>
            {jobs.length ? (
              jobs.map((item, index) => (
                <p key={index}>{displayItem(item)}</p>
              ))
            ) : (
              <p>No job recommendations available.</p>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default UploadResume;