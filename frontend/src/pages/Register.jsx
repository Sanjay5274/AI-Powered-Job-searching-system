import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage("Registration successful! Please login.");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      setMessage(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-wrapper">

        {/* LEFT REGISTER SECTION */}

        <div className="register-left">

          <div className="register-brand">
            <div className="register-brand-icon">M</div>

            <div>
              <h2>Matchwize</h2>
              <span>AI Resume Analyzer</span>
            </div>
          </div>

          <div className="register-content">

            <div className="register-heading">

              <span className="register-tag">
                GET STARTED TODAY
              </span>

              <h1>Create Account</h1>

              <p>
                Join Matchwize and take the first
                step towards your dream career.
              </p>

            </div>

            <form onSubmit={handleRegister}>

              {/* NAME */}

              <div className="register-field">
                <label>Full Name</label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              {/* EMAIL */}

              <div className="register-field">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* PASSWORD */}

              <div className="register-field">
                <label>Password</label>

                <div className="register-password">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password (minimum 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    className="register-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="register-field">
                <label>Confirm Password</label>

                <div className="register-password">
                  <input
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="register-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* REGISTER BUTTON */}

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="register-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account →"
                )}
              </button>

              {/* MESSAGE */}

              {message && (
                <div
                  className={`register-message ${
                    message.startsWith("Registration successful")
                      ? "success"
                      : "error"
                  }`}
                  role="status"
                >
                  {message}
                </div>
              )}

            </form>

            <div className="register-divider">
              <span>OR</span>
            </div>

            <p className="register-login-text">
              Already have an account?
              <Link to="/"> Sign In</Link>
            </p>

          </div>

          <div className="register-footer">
            © 2026 Matchwize. All rights reserved.
          </div>

        </div>

        {/* RIGHT BRANDING SECTION */}

        <div className="register-right">

          <div className="register-glow glow-one"></div>
          <div className="register-glow glow-two"></div>

          <div className="register-branding-content">

            <div className="register-ai-badge">
              ✦ AI POWERED PLATFORM
            </div>

            <h1>
              Build Your Future
              <br />
              With <span>Matchwize.</span>
            </h1>

            <p>
              Discover your potential, analyze your resume
              and unlock exciting career opportunities
              with the power of Artificial Intelligence.
            </p>

            {/* AI ILLUSTRATION */}

            <div className="register-illustration">

              <div className="register-ai-circle">

                <div className="register-ai-face">
                  <span>●</span>
                  <span>●</span>
                  <div className="register-ai-smile"></div>
                </div>

              </div>

              <div className="register-floating-card register-resume-card">
                <span>📄</span>

                <div>
                  <strong>Smart Resume</strong>
                  <small>AI Analysis Ready</small>
                </div>

                <b>✓</b>
              </div>

              <div className="register-floating-card register-score-card">
                <small>Career Match</small>
                <strong>92%</strong>
                <span>Excellent Match</span>
              </div>

            </div>

            {/* FEATURES */}

            <div className="register-features">

              <div>
                <span>✓</span>
                Create Your Professional Profile
              </div>

              <div>
                <span>✓</span>
                Get AI Resume Insights
              </div>

              <div>
                <span>✓</span>
                Explore Better Job Opportunities
              </div>

            </div>

          </div>

          <div className="register-branding-footer">
            YOUR CAREER JOURNEY STARTS HERE
          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;