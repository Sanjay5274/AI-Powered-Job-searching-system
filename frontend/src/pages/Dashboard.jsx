import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/apiClient";
import "./Dashboard.css";

function Dashboard() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await apiFetch("/api/resume-history");

        const data = await response.json();

        if (response.ok) {
          setHistory(Array.isArray(data) ? data : data.resumes || []);
        }
      } catch (error) {
        console.log("History loading error:", error);
      }
    };

    fetchHistory();
  }, []);

  const totalAnalyses = history.length;

  const averageScore =
    totalAnalyses > 0
      ? Math.round(
          history.reduce(
            (total, item) => total + (Number(item.score) || 0),
            0
          ) / totalAnalyses
        )
      : 0;

  const recommendedJobs = history.reduce(
    (total, item) =>
      total +
      (Array.isArray(item.jobRecommendations)
        ? item.jobRecommendations.length
        : 0),
    0
  );

  return (
    <DashboardLayout title="Dashboard">
      <div className="dashboard-overview">

        {/* Welcome Banner */}
        <div className="welcome-banner">

          <div className="welcome-content">

            <span className="welcome-tag">
              ✨ YOUR CAREER JOURNEY STARTS HERE
            </span>

            <h1>
              Welcome to <span>Matchwize!</span>
            </h1>

            <p>
              Analyze your resume, discover your strengths
              and unlock exciting career opportunities.
            </p>

            <div className="welcome-features">
              <span>✓ AI Resume Analysis</span>
              <span>✓ Smart Job Matching</span>
              <span>✓ Skill Improvement</span>
            </div>

          </div>

          <div className="welcome-icon">
            <div className="rocket-circle">
              🚀
            </div>
            <span className="rocket-star star-one">✦</span>
            <span className="rocket-star star-two">✧</span>
            <span className="rocket-star star-three">✦</span>
          </div>

        </div>

        {/* Statistics */}
        <div className="stats-grid">

          <div className="stat-card stat-blue">
            <div className="stat-top">
              <div className="stat-icon">📊</div>
              <span className="stat-label">ANALYSIS</span>
            </div>
            <h3>Total Analyses</h3>
            <h2>{totalAnalyses}</h2>
            <p>Your completed resume analyses</p>
          </div>

          <div className="stat-card stat-purple">
            <div className="stat-top">
              <div className="stat-icon">⭐</div>
              <span className="stat-label">PERFORMANCE</span>
            </div>
            <h3>Average Resume Score</h3>
            <h2>{averageScore}%</h2>
            <p>Your average resume performance</p>
          </div>

          <div className="stat-card stat-green">
            <div className="stat-top">
              <div className="stat-icon">📄</div>
              <span className="stat-label">UPLOADS</span>
            </div>
            <h3>Resumes Uploaded</h3>
            <h2>{totalAnalyses}</h2>
            <p>Your uploaded resume records</p>
          </div>

          <div className="stat-card stat-orange">
            <div className="stat-top">
              <div className="stat-icon">💼</div>
              <span className="stat-label">CAREER</span>
            </div>
            <h3>Recommended Jobs</h3>
            <h2>{recommendedJobs}</h2>
            <p>Job opportunities recommended</p>
          </div>

        </div>

        {/* Getting Started Card */}
        <div className="dashboard-welcome-card">

          <div className="start-icon">
            🎯
          </div>

          <div className="start-content">
            <span className="start-tag">
              GET STARTED
            </span>

            <h2>Start Your Resume Analysis</h2>

            <p>
              Upload your PDF resume to discover your skills,
              resume score, missing skills and job recommendations.
            </p>
          </div>

          <div className="start-decoration">
            ✨
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;