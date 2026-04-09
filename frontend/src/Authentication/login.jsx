import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CustomDropdown from '../Components/CustomDropdown';
import "./login.css";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const API_URL = "http://localhost:5000";

// Suppress Google OAuth console errors that don't affect functionality
const originalError = console.error;
console.error = function(...args) {
  const message = args[0]?.toString?.() || String(args[0]);
  if (message.includes('[GSI_LOGGER]') || 
      message.includes('Cross-Origin-Opener-Policy')) {
    return;
  }
  originalError.apply(console, args);
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [signUpData, setSignUpData] = useState({ username: "", email: "", password: "", role: "user" });
  const [signUpError, setSignUpError] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpSuccessMsg, setSignUpSuccessMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userEmail')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const particlesInit = useCallback(async engine => {
    await loadFull(engine);
  }, []);

  const particlesOptions = {
    background: {
        color: {
            value: "transparent",
        },
    },
    fpsLimit: 120,
    particles: {
        color: {
            value: "#ffffff",
        },
        links: {
            enable: false,
        },
        move: {
            direction: "none",
            enable: true,
            outModes: {
                default: "out",
            },
            random: true,
            speed: 0.3,
            straight: false,
        },
        number: {
            density: {
                enable: true,
                area: 800,
            },
            value: 250,
        },
        opacity: {
            value: { min: 0.1, max: 0.8 },
            animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.1,
                sync: false
            }
        },
        shape: {
            type: "circle",
        },
        size: {
            value: { min: 0.5, max: 2 },
        },
    },
    detectRetina: true,
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpLoading(true);
    setSignUpError("");
    setSignUpSuccessMsg("");

    try {
      const res = await axios.post(`${API_URL}/signup`, signUpData);
      if (res.data.status === "success") {
        setSignUpSuccessMsg("Account created! You can now sign in.");
        setTimeout(() => {
          setIsSignUpModalOpen(false);
          setSignUpSuccessMsg("");
          setSignUpData({ username: "", email: "", password: "", role: "user" });
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      setSignUpError(error.response?.data?.message || "Failed to create account.");
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      if (res.data.status === "success") {
        localStorage.setItem("userRole", res.data.role || "user");
        localStorage.setItem("userName", res.data.name || email);
        localStorage.setItem("userEmail", res.data.email || email);
        navigate("/dashboard");
      } else {
        setErrorMsg("Invalid login credentials.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page space-theme-page">
      {/* Space Background Components */}
      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className="particles-canvas" />

      <div className="login-container glass-panel">
        <div className="login-logo">
          <div className="login-logo-icon">DT</div>
          <span className="login-logo-text">TalentHub</span>
        </div>

        <div className="login-divider">
          <span>or</span>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setGoogleLoading(true);
              const decoded = jwtDecode(credentialResponse.credential);

              try {
                const res = await axios.post(`${API_URL}/google-login`, {
                  email: decoded.email,
                  name: decoded.name,
                }, {
                  headers: {
                    "Content-Type": "application/json",
                  }
                });

                if (res.data.status === "success") {
                  localStorage.setItem("userRole", res.data.role || "user");
                  localStorage.setItem("userName", res.data.name || decoded.name || '');
                  localStorage.setItem("userEmail", res.data.email || decoded.email || '');
                  navigate("/dashboard");
                }
              } catch (err) {
                console.error("Google login error:", err);
                setErrorMsg("Google login failed. Please check your connection and try again.");
              } finally {
                setGoogleLoading(false);
              }
            }}
            onError={() => {
              setErrorMsg("Google login failed. Please ensure your origin is authorized in Google Cloud Console.");
              console.error("Google Login Error");
            }}
          />
        </div>
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Please sign in to your account</p>
        </div>

        {errorMsg && (
          <div className="error-message">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? <span className="loading-spinner"></span> : "Sign In"}
          </button>

          <p className="signup-prompt">
            Don't have an account yet?{" "}
            <span className="signup-link" onClick={() => {
              setIsSignUpModalOpen(true);
              setErrorMsg("");
              setSignUpSuccessMsg("");
              setSignUpError("");
            }}>
              Sign up with email
            </span>
          </p>
        </form>
      </div>

      {isSignUpModalOpen && (
        <div className="login-modal-overlay" onClick={() => setIsSignUpModalOpen(false)}>
          <div className="login-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create an Account</h3>
              <button className="close-btn" onClick={() => setIsSignUpModalOpen(false)}>&times;</button>
            </div>

            {signUpSuccessMsg && <div className="success-message">{signUpSuccessMsg}</div>}
            {signUpError && <div className="error-message">{signUpError}</div>}

            <form onSubmit={handleSignUp}>
              <div className="form-group" style={{ zIndex: 10 }}>
                <label className="form-label">Role</label>
                <CustomDropdown
                  value={signUpData.role}
                  onChange={(val) => setSignUpData({ ...signUpData, role: val })}
                  options={[
                    { label: 'User', value: 'user' },
                    { label: 'Admin', value: 'admin' }
                  ]}
                  placeholder="Select Role"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Choose a username"
                  value={signUpData.username}
                  onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Create a password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-login" disabled={signUpLoading || signUpSuccessMsg}>
                {signUpLoading ? <span className="loading-spinner"></span> : "Sign Up"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;