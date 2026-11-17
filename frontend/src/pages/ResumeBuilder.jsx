import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/apiClient";
import { useNavigate } from "react-router-dom";

function ResumeBuilder() {
  const navigate = useNavigate();

  let storedUser = {};
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    storedUser = {};
  }

  // Active section tab in editor
  const [activeTab, setActiveTab] = useState("personal");

  // Resume Document State
  const [personalInfo, setPersonalInfo] = useState({
    name: storedUser.name || "Alex Developer",
    headline: storedUser.headline || "Full Stack Software Engineer",
    email: storedUser.email || "alex.developer@example.com",
    phone: storedUser.phone || "+1 (555) 234-5678",
    location: storedUser.location || "San Francisco, CA",
    website: "https://github.com/alexdev",
  });

  const [summary, setSummary] = useState(
    storedUser.bio ||
      "Results-oriented Software Engineer with 4+ years of hands-on experience building high-performance web applications and AI-driven platforms. Proficient in React, Node.js, Python, and scalable cloud architectures."
  );

  const [experiences, setExperiences] = useState([
    {
      id: 1,
      title: "Senior Full Stack Engineer",
      company: "TechNova Solutions",
      location: "San Francisco, CA",
      startDate: "2023",
      endDate: "Present",
      description:
        "• Led frontend architecture for microservices platform serving 150k+ daily active users.\n• Improved API response times by 35% through Redis caching and query indexing.\n• Mentored junior developers and instituted automated CI/CD deployment pipelines.",
    },
    {
      id: 2,
      title: "Software Engineer",
      company: "DataStream Analytics",
      location: "San Jose, CA",
      startDate: "2021",
      endDate: "2023",
      description:
        "• Developed core customer dashboards using React, TypeScript, and Express.\n• Integrated third-party analytics and payment APIs with 99.9% uptime compliance.",
    },
  ]);

  const [education, setEducation] = useState([
    {
      id: 1,
      degree: "B.S. in Computer Science",
      institution: "University of California, Berkeley",
      gradYear: "2021",
      gpa: "3.8 / 4.0",
    },
  ]);

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "Matchwize AI Resume Screener",
      techStack: "React, Node.js, Python, Flask, MongoDB",
      link: "https://matchwize.dev",
      description:
        "Engineered an automated ATS parsing and skill gap recommendation engine with real-time scoring and job compatibility matching.",
    },
  ]);

  const [skillsText, setSkillsText] = useState(
    "React, JavaScript, TypeScript, Node.js, Python, Flask, MongoDB, Docker, Git, REST APIs, HTML5, CSS3, SQL"
  );

  const [certifications, setCertifications] = useState([
    {
      id: 1,
      name: "AWS Certified Developer – Associate",
      issuer: "Amazon Web Services",
      year: "2023",
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToProfile = async () => {
    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const skillsArray = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: `${personalInfo.name.replace(/\s+/g, "_")}_Resume`,
        personalInfo,
        summary,
        experiences,
        education,
        projects,
        skills: skillsArray,
        certifications,
      };

      const response = await apiFetch("/api/resumes/save-built", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save built resume");
      }

      setSuccessMsg("Resume saved to your profile and added to My Resumes!");
    } catch (err) {
      setErrorMsg(err.message || "An error occurred while saving resume");
    } finally {
      setSaving(false);
    }
  };

  // Helper experience add/remove
  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now(),
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "Present",
        description: "",
      },
    ]);
  };

  const removeExperience = (id) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  // Helper education add/remove
  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: Date.now(),
        degree: "",
        institution: "",
        gradYear: "",
        gpa: "",
      },
    ]);
  };

  const removeEducation = (id) => {
    setEducation(education.filter((e) => e.id !== id));
  };

  // Helper project add/remove
  const addProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now(),
        title: "",
        techStack: "",
        link: "",
        description: "",
      },
    ]);
  };

  const removeProject = (id) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const parsedSkills = skillsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <DashboardLayout title="Resume Builder">
      <div className="resume-builder-section">
        <div className="section-heading">
          <div>
            <h2>ATS Resume Builder</h2>
            <p>
              Build a clean, parser-friendly resume designed to rank high in Applicant Tracking Systems.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePrint}
              style={{ padding: "10px 18px", fontSize: "13px" }}
            >
              🖨️ Print / Export PDF
            </button>

            <button
              type="button"
              className="job-apply-btn"
              onClick={handleSaveToProfile}
              disabled={saving}
              style={{ padding: "10px 18px", fontSize: "13px" }}
            >
              {saving ? "Saving..." : "💾 Save to My Resumes"}
            </button>
          </div>
        </div>

        {errorMsg && <div className="error-message" style={{ marginBottom: "16px" }}>{errorMsg}</div>}
        {successMsg && <div className="success-message" style={{ marginBottom: "16px" }}>{successMsg}</div>}

        <div className="builder-layout">
          {/* LEFT: EDITOR CONTROLS */}
          <div className="builder-editor-card">
            <h3 style={{ fontSize: "16px", color: "var(--navy)", marginBottom: "14px" }}>
              Edit Resume Content
            </h3>

            {/* TAB SELECTOR */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                marginBottom: "20px",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "10px",
              }}
            >
              {["personal", "summary", "experience", "education", "projects", "skills"].map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: activeTab === tab ? "var(--purple)" : "#ede8f5",
                      color: activeTab === tab ? "#fff" : "var(--text)",
                      padding: "7px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* TAB 1: PERSONAL INFO */}
            {activeTab === "personal" && (
              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                />

                <label>Professional Headline</label>
                <input
                  type="text"
                  value={personalInfo.headline}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, headline: e.target.value })}
                />

                <label>Email Address</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                />

                <label>Phone Number</label>
                <input
                  type="text"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                />

                <label>Location (City, State/Country)</label>
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                />

                <label>Website / Portfolio / LinkedIn</label>
                <input
                  type="text"
                  value={personalInfo.website}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                />
              </div>
            )}

            {/* TAB 2: SUMMARY */}
            {activeTab === "summary" && (
              <div>
                <label>Professional Summary</label>
                <textarea
                  rows={6}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summarize your background, core areas of expertise, and accomplishments..."
                />
                <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", display: "block" }}>
                  Tip: Keep your summary to 3-4 punchy sentences highlighting your main tech stack and career impact.
                </span>
              </div>
            )}

            {/* TAB 3: WORK EXPERIENCE */}
            {activeTab === "experience" && (
              <div>
                {experiences.map((exp, idx) => (
                  <div
                    key={exp.id}
                    style={{
                      background: "#f9f8fc",
                      border: "1px solid #ded8ed",
                      borderRadius: "10px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>Position #{idx + 1}</strong>
                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        style={{
                          background: "#fff0f0",
                          color: "#d94c59",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <label>Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      placeholder="e.g. Senior Software Engineer"
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].title = e.target.value;
                        setExperiences(updated);
                      }}
                    />

                    <label>Company Name</label>
                    <input
                      type="text"
                      value={exp.company}
                      placeholder="e.g. Acme Corp"
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].company = e.target.value;
                        setExperiences(updated);
                      }}
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label>Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          placeholder="e.g. 2022"
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[idx].startDate = e.target.value;
                            setExperiences(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label>End Date</label>
                        <input
                          type="text"
                          value={exp.endDate}
                          placeholder="e.g. Present"
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[idx].endDate = e.target.value;
                            setExperiences(updated);
                          }}
                        />
                      </div>
                    </div>

                    <label>Bullet Points / Achievements</label>
                    <textarea
                      rows={4}
                      value={exp.description}
                      placeholder="• Describe key responsibility or achievement&#10;• Use metrics (e.g. +25% performance)"
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].description = e.target.value;
                        setExperiences(updated);
                      }}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addExperience}
                  className="btn-secondary"
                  style={{ width: "100%", padding: "10px", marginTop: "8px" }}
                >
                  + Add Experience Entry
                </button>
              </div>
            )}

            {/* TAB 4: EDUCATION */}
            {activeTab === "education" && (
              <div>
                {education.map((edu, idx) => (
                  <div
                    key={edu.id}
                    style={{
                      background: "#f9f8fc",
                      border: "1px solid #ded8ed",
                      borderRadius: "10px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>Degree #{idx + 1}</strong>
                      <button
                        type="button"
                        onClick={() => removeEducation(edu.id)}
                        style={{
                          background: "#fff0f0",
                          color: "#d94c59",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <label>Degree / Major</label>
                    <input
                      type="text"
                      value={edu.degree}
                      placeholder="e.g. B.S. in Computer Science"
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].degree = e.target.value;
                        setEducation(updated);
                      }}
                    />

                    <label>Institution / University</label>
                    <input
                      type="text"
                      value={edu.institution}
                      placeholder="e.g. Stanford University"
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].institution = e.target.value;
                        setEducation(updated);
                      }}
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label>Graduation Year</label>
                        <input
                          type="text"
                          value={edu.gradYear}
                          placeholder="e.g. 2022"
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].gradYear = e.target.value;
                            setEducation(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label>GPA / Honors (Optional)</label>
                        <input
                          type="text"
                          value={edu.gpa}
                          placeholder="e.g. 3.9 GPA"
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].gpa = e.target.value;
                            setEducation(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addEducation}
                  className="btn-secondary"
                  style={{ width: "100%", padding: "10px", marginTop: "8px" }}
                >
                  + Add Education Entry
                </button>
              </div>
            )}

            {/* TAB 5: PROJECTS */}
            {activeTab === "projects" && (
              <div>
                {projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    style={{
                      background: "#f9f8fc",
                      border: "1px solid #ded8ed",
                      borderRadius: "10px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>Project #{idx + 1}</strong>
                      <button
                        type="button"
                        onClick={() => removeProject(proj.id)}
                        style={{
                          background: "#fff0f0",
                          color: "#d94c59",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <label>Project Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      placeholder="e.g. Real-Time Chat Engine"
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].title = e.target.value;
                        setProjects(updated);
                      }}
                    />

                    <label>Technologies Used</label>
                    <input
                      type="text"
                      value={proj.techStack}
                      placeholder="e.g. React, WebSockets, Redis"
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].techStack = e.target.value;
                        setProjects(updated);
                      }}
                    />

                    <label>Project Link / Repository</label>
                    <input
                      type="text"
                      value={proj.link}
                      placeholder="e.g. https://github.com/user/project"
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].link = e.target.value;
                        setProjects(updated);
                      }}
                    />

                    <label>Project Description</label>
                    <textarea
                      rows={3}
                      value={proj.description}
                      placeholder="Brief overview of features, scale, and performance..."
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].description = e.target.value;
                        setProjects(updated);
                      }}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addProject}
                  className="btn-secondary"
                  style={{ width: "100%", padding: "10px", marginTop: "8px" }}
                >
                  + Add Project Entry
                </button>
              </div>
            )}

            {/* TAB 6: SKILLS */}
            {activeTab === "skills" && (
              <div>
                <label>Technical Skills (Comma separated)</label>
                <textarea
                  rows={5}
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="React, JavaScript, Python, SQL, Docker, AWS, Git..."
                />
                <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", display: "block" }}>
                  Separate individual skills with commas. These will be formatted into an ATS keyword bank.
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE ATS PREVIEW PAPER */}
          <div className="builder-paper">
            {/* RESUME HEADER */}
            <div className="resume-preview-header">
              <h1 className="resume-preview-name">{personalInfo.name || "Your Full Name"}</h1>
              {personalInfo.headline && (
                <div className="resume-preview-headline">{personalInfo.headline}</div>
              )}
              <div className="resume-preview-contact">
                {personalInfo.email && <span>✉ {personalInfo.email}</span>}
                {personalInfo.phone && <span>☎ {personalInfo.phone}</span>}
                {personalInfo.location && <span>📍 {personalInfo.location}</span>}
                {personalInfo.website && <span>🔗 {personalInfo.website}</span>}
              </div>
            </div>

            {/* SUMMARY */}
            {summary && (
              <div className="resume-preview-section">
                <div className="resume-preview-section-title">Professional Summary</div>
                <p style={{ fontSize: "12px", color: "#334155", lineHeight: 1.5 }}>{summary}</p>
              </div>
            )}

            {/* SKILLS */}
            {parsedSkills.length > 0 && (
              <div className="resume-preview-section">
                <div className="resume-preview-section-title">Technical Skills</div>
                <p style={{ fontSize: "12px", color: "#334155", lineHeight: 1.6 }}>
                  <strong>Core Competencies: </strong>
                  {parsedSkills.join(" • ")}
                </p>
              </div>
            )}

            {/* EXPERIENCE */}
            {experiences.length > 0 && (
              <div className="resume-preview-section">
                <div className="resume-preview-section-title">Work Experience</div>
                {experiences.map((exp) => (
                  <div key={exp.id} className="resume-preview-item">
                    <div className="resume-preview-item-header">
                      <span>{exp.title || "Job Title"}</span>
                      <span>
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <div className="resume-preview-item-sub">
                      <span>{exp.company || "Company Name"}</span>
                      <span>{exp.location}</span>
                    </div>
                    {exp.description && (
                      <p style={{ fontSize: "12px", color: "#334155", whiteSpace: "pre-line", margin: "4px 0" }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* PROJECTS */}
            {projects.length > 0 && (
              <div className="resume-preview-section">
                <div className="resume-preview-section-title">Technical Projects</div>
                {projects.map((proj) => (
                  <div key={proj.id} className="resume-preview-item">
                    <div className="resume-preview-item-header">
                      <span>
                        {proj.title || "Project Name"}
                        {proj.techStack && (
                          <span style={{ fontWeight: 400, color: "#64748b", fontSize: "11px", marginLeft: "8px" }}>
                            | {proj.techStack}
                          </span>
                        )}
                      </span>
                      {proj.link && (
                        <span style={{ fontSize: "11px", color: "#475569" }}>{proj.link}</span>
                      )}
                    </div>
                    {proj.description && (
                      <p style={{ fontSize: "12px", color: "#334155", marginTop: "3px" }}>
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* EDUCATION */}
            {education.length > 0 && (
              <div className="resume-preview-section">
                <div className="resume-preview-section-title">Education</div>
                {education.map((edu) => (
                  <div key={edu.id} className="resume-preview-item">
                    <div className="resume-preview-item-header">
                      <span>{edu.degree || "Degree"}</span>
                      <span>{edu.gradYear}</span>
                    </div>
                    <div className="resume-preview-item-sub">
                      <span>{edu.institution || "University / College"}</span>
                      {edu.gpa && <span>{edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CERTIFICATIONS */}
            {certifications.length > 0 && (
              <div className="resume-preview-section">
                <div className="resume-preview-section-title">Certifications</div>
                {certifications.map((cert) => (
                  <div key={cert.id} style={{ fontSize: "12px", color: "#334155", marginBottom: "4px" }}>
                    <strong>{cert.name}</strong> – {cert.issuer} ({cert.year})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ResumeBuilder;
