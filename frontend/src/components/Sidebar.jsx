 import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="sidebar">

      <div className="brand">
        <span className="brand-icon">↗️</span>
        Match<span>wize</span>
      </div>

      <p className="menu-heading">MAIN MENU</p>

      <nav className="sidebar-menu">

        <NavLink to="/dashboard">
          <span>▦</span> Dashboard
        </NavLink>

        <NavLink to="/upload">
          <span>⇧</span> Upload & Analyze
        </NavLink>

        <NavLink to="/job-matching">
          <span>🎯</span> Job Matching
        </NavLink>

        <NavLink to="/skill-gap">
          <span>🧠</span> Skill Gap Analysis
        </NavLink>

        <NavLink to="/ats-checker">
          <span>📋</span> ATS Checker
        </NavLink>

        <NavLink to="/learning-roadmap">
          <span>🗺️</span> Learning Roadmap
        </NavLink>

        <NavLink to="/courses">
          <span>📚</span> Course Recommendations
        </NavLink>

        <NavLink to="/jobs">
          <span>💼</span> Job Portal
        </NavLink>

        <NavLink to="/applications">
          <span>📨</span> My Applications
        </NavLink>

        <NavLink to="/interview">
          <span>🎤</span> Interview Preparation
        </NavLink>

        <NavLink to="/resume-builder">
          <span>📄</span> Resume Builder
        </NavLink>

        <NavLink to="/resume-comparison">
          <span>⚖️</span> Resume Comparison
        </NavLink>

        <NavLink to="/history">
          <span>◷</span> Analysis History
        </NavLink>

        <NavLink to="/my-resumes">
          <span>▣</span> My Resumes
        </NavLink>

        <NavLink to="/analytics">
          <span>▥</span> Analytics
        </NavLink>

      </nav>

      <div className="sidebar-bottom">

        <NavLink to="/profile">
          ♙ Profile
        </NavLink>

        <NavLink to="/settings">
          ⚙️ Settings
        </NavLink>
    
    <button onClick={handleLogout}>
          ⇥ Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;