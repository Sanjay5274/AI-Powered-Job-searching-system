import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/apiClient";

function Profile() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    headline: "",
    location: "",
    bio: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const syncFormWithUser = (userData) => {
    setFormData({
      name: userData.name || "",
      phone: userData.phone || "",
      headline: userData.headline || "",
      location: userData.location || "",
      bio: userData.bio || "",
    });
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/auth/me");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile");
      }

      const fetchedUser = data.user || {};
      setUser(fetchedUser);
      syncFormWithUser(fetchedUser);

      // Keep localStorage in sync with live backend data
      localStorage.setItem("user", JSON.stringify(fetchedUser));
    } catch (err) {
      setError(err.message || "Failed to load profile from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleStartEdit = () => {
    syncFormWithUser(user);
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    syncFormWithUser(user);
    setError("");
    setIsEditing(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await apiFetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          headline: formData.headline.trim(),
          location: formData.location.trim(),
          bio: formData.bio.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      const updatedUser = data.user || {};
      setUser(updatedUser);
      syncFormWithUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "An error occurred while saving profile");
    } finally {
      setSaving(false);
    }
  };

  const initialLetter = (user.name && user.name.trim().length > 0)
    ? user.name.trim()[0].toUpperCase()
    : "U";

  return (
    <DashboardLayout title="Profile">
      <div className="profile-section">
        <h2>My Profile</h2>
        <p>View and manage your account information.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="result-card">
          <div className="user-avatar">{initialLetter}</div>

          <h3>{user.name || "User"}</h3>
          {user.headline && (
            <p style={{ color: "var(--purple)", fontWeight: 600, marginTop: "-4px", marginBottom: "14px" }}>
              {user.headline}
            </p>
          )}

          {!isEditing ? (
            <div className="profile-details-view">
              <p>
                <strong>Name:</strong> {user.name || "Not available"}
              </p>

              <p>
                <strong>Email:</strong> {user.email || "Not available"}
              </p>

              <p>
                <strong>Phone:</strong> {user.phone || "Not specified"}
              </p>

              <p>
                <strong>Location:</strong> {user.location || "Not specified"}
              </p>

              <p>
                <strong>Bio:</strong> {user.bio || "No bio added yet."}
              </p>

              <p>
                <strong>Account:</strong> Active
              </p>

              <div style={{ marginTop: "22px" }}>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  disabled={loading}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ marginTop: "16px" }}>
              <label htmlFor="profile-name">Full Name *</label>
              <input
                id="profile-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
                maxLength={100}
              />

              <label htmlFor="profile-headline">Professional Headline</label>
              <input
                id="profile-headline"
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. AI Specialist | Full-Stack Engineer"
                maxLength={150}
              />

              <label htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                value={user.email || ""}
                disabled
                style={{ opacity: 0.7, cursor: "not-allowed" }}
              />
              <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "-4px" }}>
                Email address is linked to your login and cannot be edited.
              </span>

              <label htmlFor="profile-phone">Phone Number</label>
              <input
                id="profile-phone"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +1 234 567 8900"
                maxLength={20}
              />

              <label htmlFor="profile-location">Location</label>
              <input
                id="profile-location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. New York, NY"
                maxLength={100}
              />

              <label htmlFor="profile-bio">Bio</label>
              <textarea
                id="profile-bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Briefly describe your career background, target roles, or key skills..."
                maxLength={500}
              />
              <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "-4px" }}>
                Maximum 500 characters ({formData.bio.length}/500).
              </span>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="submit" disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
