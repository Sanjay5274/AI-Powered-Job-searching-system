import React from "react";
import DashboardLayout from "../components/DashboardLayout";

function Profile() {
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  return (
    <DashboardLayout title="Profile">
      <div className="profile-section">
        <h2>My Profile</h2>
        <p>View your account information.</p>

        <div className="result-card">
          <div className="user-avatar">U</div>

          <h3>{user.name || "User"}</h3>

          <p>
            <strong>Name:</strong> {user.name || "Not available"}
          </p>

          <p>
            <strong>Email:</strong> {user.email || "Not available"}
          </p>

          <p>
            <strong>Account:</strong> Active
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;