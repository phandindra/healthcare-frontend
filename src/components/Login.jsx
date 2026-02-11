import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLoginError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setLoginError("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    setLoginError("");

    try {
      // Backend API call for login
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });
      console.log(response)

      console.log("Login Response:", response.data);

      // Parse response from backend
      const { token, role, userId, message, status } = response.data;

      if (status === "SUCCESS") {
        // Create user object from backend response
        const user = {
          id: userId,
          email: formData.email,
          role: role,
        };

        // Store authentication data in sessionStorage
        sessionStorage.setItem("jwtToken", token);
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("userRole", role);

        // Set axios default header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Navigate based on user role
        if (role === "ROLE_ADMIN") {
          navigate("/admin");
        } else if (role === "ROLE_PATIENT") {
          navigate("/patient");
        } else if (role === "ROLE_DOCTOR") {
          navigate("/doctor");
        } else {
          console.warn("Unknown role:", role);
          navigate("/");
        }
      } else {
        setLoginError(message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          setLoginError(
            "Invalid email or password. Please check your credentials.",
          );
        } else if (err.response.status === 400) {
          setLoginError("Bad request. Please check your input.");
        } else if (err.response.status === 500) {
          setLoginError("Server error. Please try again later.");
        } else {
          setLoginError(
            err.response.data?.message || "Login failed. Please try again.",
          );
        }
      } else if (err.request) {
        setLoginError(
          "Server Error !",
        );
      } else {
        setLoginError("An error occurred: " + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to fill test credentials
  const fillTestCredentials = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{ backgroundColor: "#48b575" }}
      >
        <div className="container">
          <a
            className="navbar-brand fw-bold fs-4"
            href="/"
            style={{ color: "#ffffff" }}
          >
            DocLink
          </a>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a
                  className="nav-link fw-medium"
                  href="/"
                  style={{ color: "#e8f5e9" }}
                >
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link fw-medium"
                  href="/login"
                  style={{ color: "#e8f5e9" }}
                >
                  Login
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link fw-medium"
                  href="/signup"
                  style={{ color: "#e8f5e9" }}
                >
                  Sign Up
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: "150px" }}></div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-5">
            <div className="mb-4 text-center">
              <h2 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                Login to DocLink
              </h2>
              <p className="text-muted mb-0">Sign in to access your account</p>
            </div>

            <div
              className="shadow-sm border-0 p-4 rounded-3"
              style={{ backgroundColor: "white" }}
            >
              {loginError && (
                <div className="alert alert-danger rounded-3 mb-4">
                  <div className="d-flex align-items-center">
                    <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>
                      ⚠️
                    </span>
                    <span>{loginError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="form-label fw-medium"
                    style={{ color: "#2c3e50" }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      padding: "10px",
                      border: "1px solid #e9ecef",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="form-label fw-medium"
                    style={{ color: "#2c3e50" }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{
                      padding: "10px",
                      border: "1px solid #e9ecef",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div className="d-grid mb-4">
                  <button
                    type="submit"
                    className="btn py-2 fw-medium"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: "#48b575",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "1.1rem",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Signing in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>

                <div className="text-center mb-3">
                  <small className="text-muted">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="fw-medium"
                      style={{ color: "#48b575" }}
                    >
                      Sign up
                    </Link>
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
