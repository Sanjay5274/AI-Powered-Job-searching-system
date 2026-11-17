import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <DashboardLayout title="Settings">
      <div className="settings-section">
        <h2>Account Settings</h2>
        <p>Manage your Matchwize account.</p>

        <div className="result-card">
          <h3>Account Information</h3>
          <p>Your account is active.</p>
        </div>

        <div className="result-card">
          <h3>Security</h3>
          <p>Your account is protected with login authentication.</p>
        </div>

        <div className="result-card">
          <h3>Logout</h3>
          <p>Sign out from your Matchwize account.</p>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;