import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "./CourseRecommendations.css";

function CourseRecommendations() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          throw new Error(data.message || "Unable to fetch resumes");
        }

        setResumes(Array.isArray(data) ? data : data.resumes || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchResumes();
  }, []);

  const handleRecommend = async (e) => {
    e.preventDefault();
    setError("");
    setCourses([]);

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
            resumeId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to analyze skills");
      }

      const missingSkills =
        data.skillGapResult?.missing_skills || [];

      if (missingSkills.length === 0) {
        setError("No missing skills found. Your resume matches this role!");
        return;
      }

      const courseData = missingSkills.map((skill, index) => ({
        id: index + 1,
        skill,
        title: `${skill} Complete Learning Course`,
        description:`Learn ${skill} from basics to practical application.`,
        level: "Beginner to Intermediate",
        duration: "Self-paced",
        links: [
          {
            name: "YouTube Tutorials",
            url:` https://www.youtube.com/results?search_query=${encodeURIComponent(skill + " full course")}`,
          },
          {
            name: "W3Schools",
            url: `https://www.w3schools.com/`,
          },
          {
            name: "Google Search",
            url: `https://www.google.com/search?q=${encodeURIComponent(skill + " online course")}`,
          },
        ],
      }));

      setCourses(courseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Course Recommendations">
      <div className="courses-container">

        <h2>Recommended Courses</h2>

        <p>
          Find courses based on your resume skills and target job role.
        </p>

        <div className="courses-card">
          <h3>Get Personalized Course Recommendations</h3>

          <form onSubmit={handleRecommend}>

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

            <label>Target Job Role</label>

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
              {loading ? "Finding Courses..." : "Recommend Courses"}
            </button>

          </form>

          {error && <p className="courses-error">{error}</p>}
        </div>

        {courses.length > 0 && (
          <div className="courses-results">

            <h3>Courses Recommended for You</h3>

            <p>
              Based on the skills missing for your selected job role.
            </p>

            <div className="courses-grid">

              {courses.map((course) => (
                <div className="course-item" key={course.id}>

                  <span className="course-icon">📚</span>

                  <h3>{course.title}</h3>

                  <p>{course.description}</p>

                  <div className="course-info">
                    <span>🎯 {course.skill}</span>
                    <span>📊 {course.level}</span>
                    <span>⏱️ {course.duration}</span>
                  </div>

                  <h4>Learning Resources</h4>

                  {course.links.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.name} ↗️
                    </a>
                  ))}

                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default CourseRecommendations;