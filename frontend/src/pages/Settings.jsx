import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/apiClient";

function Settings() {
  const navigate = useNavigate();

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      setSuccess("Password changed successfully! Your account is updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "An error occurred while changing password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="settings-section">
        <h2>Account Settings</h2>
        <p>Manage your Matchwize account and security preferences.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* ACCOUNT INFORMATION */}
        <div className="result-card">
          <h3>Account Information</h3>
          <p>
            <strong>Name:</strong> {user.name || "User"}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "Not available"}
          </p>
          <p>
            <strong>Status:</strong> <span style={{ color: "#07864f", fontWeight: 600 }}>Active</span>
          </p>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="result-card">
          <h3>Security & Password</h3>
          <p>
            Update your account password. Choose a strong password with at least 8 characters.
          </p>

          <form onSubmit={handleChangePassword} style={{ marginTop: "18px" }}>
            <label htmlFor="currentPassword">Current Password *</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
              required
            />

            <label htmlFor="newPassword">New Password *</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 8 characters)"
              autoComplete="new-password"
              required
              minLength={8}
            />

            <label htmlFor="confirmPassword">Confirm New Password *</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              required
              minLength={8}
            />

            <div style={{ marginTop: "20px" }}>
              <button type="submit" disabled={loading}>
                {loading ? "Updating Password..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>

        {/* LOGOUT */}
        <div className="result-card">
          <h3>Logout</h3>
          <p>Sign out from your Matchwize session on this device.</p>

          <div style={{ marginTop: "14px" }}>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
