import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../utils/apiClient";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await apiFetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Login successful!");

      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-wrapper">

        {/* LEFT LOGIN SECTION */}
        <div className="login-left">

          <div className="login-brand">
            <div className="brand-icon">M</div>
            <div>
              <h2>Matchwize</h2>
              <span>AI Resume Analyzer</span>
            </div>
          </div>

          <div className="login-content">

            <div className="login-heading">
              <span className="welcome-tag">
                WELCOME BACK
              </span>

              <h1>Welcome Back!</h1>

              <p>
                Sign in to continue your journey
                towards your dream career.
              </p>
            </div>

            <form onSubmit={handleLogin}>

              <div className="login-field">
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

              <div className="login-field">
                <div className="password-label">
                  <label>Password</label>
                </div>

                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-label">
                  <input type="checkbox" />
                  Remember me
                </label>

                <span className="forgot-text">
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>

              {message && (
                <div
                  className={`login-message ${
                    message === "Login successful!"
                      ? "success"
                      : "error"
                  }`}
                  role="status"
                >
                  {message}
                </div>
              )}

            </form>

            <div className="login-divider">
              <span>OR</span>
            </div>

            <p className="register-text">
              Don't have an account?
              <Link to="/register"> Create Account</Link>
            </p>

          </div>

          <div className="login-footer">
            © 2026 Matchwize. All rights reserved.
          </div>

        </div>

        {/* RIGHT BRANDING SECTION */}
        <div className="login-right">

          <div className="right-glow glow-one"></div>
          <div className="right-glow glow-two"></div>

          <div className="branding-content">

            <div className="ai-badge">
              ✦ AI POWERED PLATFORM
            </div>

            <h1>
              Your Dream Job
              <br />
              Starts With
              <br />
              <span>Matchwize.</span>
            </h1>

            <p>
              Analyze your resume, discover your strengths
              and find the right career opportunities
              with intelligent AI technology.
            </p>

            <div className="ai-illustration">
              <div className="ai-circle">
                <div className="ai-face">
                  <span>●</span>
                  <span>●</span>
                  <div className="ai-smile"></div>
                </div>
              </div>

              <div className="floating-card resume-card">
                <span>📄</span>
                <div>
                  <strong>Resume Analysis</strong>
                  <small>AI powered insights</small>
                </div>
                <b>✓</b>
              </div>

              <div className="floating-card score-card">
                <small>Match Score</small>
                <strong>92%</strong>
                <span>Excellent Match</span>
              </div>
            </div>

            <div className="branding-features">
              <div>
                <span>✓</span> Smart Resume Analysis
              </div>
              <div>
                <span>✓</span> AI-Powered Job Matching
              </div>
              <div>
                <span>✓</span> Personalized Career Insights
              </div>
            </div>

          </div>

          <div className="branding-bottom">
            INTELLIGENCE FOR YOUR NEXT CAREER MOVE
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;