import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/apiClient";

function AnalysisHistory() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await apiFetch("/api/resume-history");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load history.");
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

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this analysis?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await apiFetch(`/api/resume-history/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed.");
      }

      setHistory((previous) =>
        previous.filter((item) => item._id !== id)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Analysis History">
      <div className="history-section">
        <h2>Resume Analysis History</h2>
        <p>View and manage your previous resume analyses.</p>

        {loading && <p>Loading history...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && history.length === 0 && (
          <p>No analysis history found.</p>
        )}

        {history.map((item) => (
          <div className="history-card" key={item._id}>
            <div>
              <h3>
                {item.fileName || item.file_name || "Resume"}
              </h3>

              <p>
                Resume Score: {item.score ?? 0}%
              </p>

              <p>
                Date:{" "}
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : "Not available"}
              </p>
            </div>

            <div className="history-actions">
              <button
                onClick={() =>
                  navigate(`/analysis/${item._id}`, {
                    state: { analysis: item },
                  })
                }
              >
                View Analysis
              </button>

              <button onClick={() => handleDelete(item._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default AnalysisHistory;