import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function MyResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
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

        if (!response.ok) {
          throw new Error(data.message || "Unable to load resumes.");
        }

        setResumes(
          Array.isArray(data) ? data : data.resumes || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  return (
    <DashboardLayout title="My Resumes">
      <div className="history-section">
        <h2>My Uploaded Resumes</h2>
        <p>View all your uploaded and analyzed resumes.</p>

        {loading && <p>Loading resumes...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && resumes.length === 0 && (
          <p>No resumes uploaded yet.</p>
        )}

        <div className="resume-list">
          {resumes.map((item) => (
            <div className="history-card" key={item._id}>
              <div>
                <h3>
                  📄 {item.fileName || item.file_name || "Resume"}
                </h3>

                <p>Resume Score: {item.score ?? 0}%</p>

                <p>
                  Uploaded:{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(`/analysis/${item._id}`, {
                    state: { analysis: item },
                  })
                }
              >
                View Resume
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyResumes;