import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "./LearningRoadmap.css";

function LearningRoadmap() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [missingSkills, setMissingSkills] = useState([]);
  const [completedDays, setCompletedDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
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
          throw new Error(data.message || "Unable to fetch resumes.");
        }

        setResumes(
          Array.isArray(data) ? data : data.resumes || []
        );
      } catch (err) {
        setError(err.message);
      }
    };

    fetchResumes();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setMissingSkills([]);
    setCompletedDays([]);

    if (!resumeId || !jobRole) {
      setError("Please select resume and job role.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/skill-gap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
          data.message || "Unable to generate roadmap."
        );
      }

      const skills =
        data.skillGapResult?.missing_skills || [];

      setMissingSkills(skills);

      if (skills.length === 0) {
        setError("Great! No missing skills found for this job role.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTask = (skill, day) => {
    if (day <= 7) {
      return `Learn ${skill} basics and understand important concepts.`;
    }

    if (day <= 14) {
      return `Study intermediate ${skill} concepts and practice examples.`;
    }

    if (day <= 21) {
      return `Practice ${skill} with hands-on coding exercises.`;
    }

    if (day <= 26) {
      return` Build a small project using ${skill}.`;
    }

    return `Revise ${skill} concepts and practice interview questions.`;
  };

  const roadmap = Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    const skill = missingSkills[index % missingSkills.length];

    return {
      day,
      skill,
      task: getTask(skill, day),
    };
  });

  const toggleComplete = (day) => {
    setCompletedDays((previous) =>
      previous.includes(day)
        ? previous.filter((item) => item !== day)
        : [...previous, day]
    );
  };

  const progress = Math.round(
    (completedDays.length / 30) * 100
  );

  return (
    <DashboardLayout title="Learning Roadmap">
      <div className="roadmap-container">

        <h2>AI Learning Roadmap</h2>

        <p>
          Build your skills with a personalized 30-day learning plan.
        </p>

        <div className="roadmap-card">
          <h3>Generate Your Learning Plan</h3>

          <form onSubmit={handleGenerate}>
            <label>Select Resume</label>

            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
            >
              <option value="">Select Resume</option>

              {resumes.map((resume) => (
                <option key={resume._id} value={resume._id}>
                  {resume.fileName}
                </option>
              ))}
            </select>

            <label>Select Target Job Role</label>

            <select
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
            >
              <option value="">Select Job Role</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Python Developer">Python Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="AI Engineer">AI Engineer</option>
              <option value="Machine Learning Engineer">
                Machine Learning Engineer
              </option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Roadmap"}
            </button>
          </form>

          {error && <p className="roadmap-error">{error}</p>}
        </div>

        {missingSkills.length > 0 && (
          <>
            <div className="roadmap-progress">
              <h3>Your Learning Progress</h3>

              <h2>{progress}% Completed</h2>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}% `}}
                />
              </div>

              <p>
                {completedDays.length} of 30 days completed
              </p>
            </div>

            <div className="roadmap-skills">
              <h3>Skills You Need to Learn</h3>

              {missingSkills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <div className="roadmap-days">
              <h3>30 Days Learning Plan</h3>

              {roadmap.map((item) => (
                <div
                  className={`roadmap-day ${
                    completedDays.includes(item.day)
                      ? "completed"
                      : ""
                  }`}
                  key={item.day}
                >
                  <div>
                    <h4>Day {item.day}</h4>
                    <strong>{item.skill}</strong>
                    <p>{item.task}</p>
                    <div className="roadmap-resources">

  <a
    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.skill + " tutorial for beginners")}`}
    target="_blank"
    rel="noreferrer"
  >
    ▶️ YouTube Tutorial
  </a>

  <a
    href={`https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(item.skill)}`}
    target="_blank"
    rel="noreferrer"
  >
    📖 Documentation
  </a>

   <a
  href="https://www.w3schools.com/"
  target="_blank"
  rel="noreferrer"
>
  💻 Practice Resources
</a>

</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleComplete(item.day)}
                  >
                    {completedDays.includes(item.day)
                      ? "Completed"
                      : "Mark Complete"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}

export default LearningRoadmap;