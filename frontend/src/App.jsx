import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import JobMatching from "./pages/JobMatching";
import SkillGap from "./pages/SkillGap";
import AnalysisHistory from "./pages/AnalysisHistory";
import MyResumes from "./pages/MyResumes";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AnalysisPage from "./pages/AnalysisPage";
import ATSChecker from "./pages/ATSChecker.jsx";
import LearningRoadmap from "./pages/LearningRoadmap.jsx";
import CourseRecommendations from "./pages/CourseRecommendations.jsx";
import InterviewPreparation from "./pages/InterviewPreparation.jsx";
import JobPortal from "./pages/JobPortal.jsx";
import MyApplications from "./pages/MyApplications.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadResume />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-matching"
          element={
            <ProtectedRoute>
              <JobMatching />
            </ProtectedRoute>
          }
        />
        <Route
  path="/skill-gap"
  element={
    <ProtectedRoute>
      <SkillGap />
    </ProtectedRoute>
  }
/>

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AnalysisHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-resumes"
          element={
            <ProtectedRoute>
              <MyResumes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analysis/:resumeId"
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
  path="/ats-checker"
  element={
    <ProtectedRoute>
      <ATSChecker />
    </ProtectedRoute>
  }
/>
<Route
  path="/learning-roadmap"
  element={
    <ProtectedRoute>
      <LearningRoadmap />
    </ProtectedRoute>
  }
/>
<Route
  path="/courses"
  element={
    <ProtectedRoute>
      <CourseRecommendations />
    </ProtectedRoute>
  }
/>
<Route
  path="/interview"
  element={
    <ProtectedRoute>
      <InterviewPreparation />
    </ProtectedRoute>
  }
/>
<Route
  path="/jobs"
  element={
    <ProtectedRoute>
      <JobPortal />
    </ProtectedRoute>
  }
/>
<Route
  path="/applications"
  element={
    <ProtectedRoute>
      <MyApplications />
    </ProtectedRoute>
  }
/>

        {/* Other URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;