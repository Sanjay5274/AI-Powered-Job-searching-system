import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/apiClient";

function Analytics() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await apiFetch("/api/resume-history");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load analytics.");
        }

        setHistory(
          Array.isArray(data) ? data : data.resumes || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const total = history.length;

  const scores = history.map((item) => Number(item.score) || 0);

  const average =
    total > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / total)
      : 0;

  const highest = total > 0 ? Math.max(...scores) : 0;

  const lowest = total > 0 ? Math.min(...scores) : 0;

  return (
    <DashboardLayout title="Analytics">
      <div className="analytics-section">
        <h2>Resume Analytics</h2>
        <p>Track your resume analysis performance.</p>

        {loading && <p>Loading analytics...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Analyses</h3>
              <h2>{total}</h2>
            </div>

            <div className="stat-card">
              <h3>Average Score</h3>
              <h2>{average}%</h2>
            </div>

            <div className="stat-card">
              <h3>Highest Score</h3>
              <h2>{highest}%</h2>
            </div>

            <div className="stat-card">
              <h3>Lowest Score</h3>
              <h2>{lowest}%</h2>
            </div>
          </div>
        )}

        {!loading && total > 0 && (
          <div className="result-card">
            <h3>Resume Score Overview</h3>

            {history.map((item) => (
              <div key={item._id}>
                <p>
                  {item.fileName || item.file_name || "Resume"} —{" "}
                  {item.score ?? 0}%
                </p>

                <div className="score-bar">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(item.score) || 0)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Analytics;