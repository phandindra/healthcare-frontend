import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    familyHistory: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState("");

  const bloodGroupMap = {
    "A+": "A_POSITIVE",
    "A-": "A_NEGATIVE",
    "B+": "B_POSITIVE",
    "B-": "B_NEGATIVE",
    "O+": "O_POSITIVE",
    "O-": "O_NEGATIVE",
    "AB+": "AB_POSITIVE",
    "AB-": "AB_NEGATIVE",
  };

  const genderMap = {
    Male: "MALE",
    Female: "FEMALE",
    Other: "OTHER",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    // Clear backend error when user starts typing
    if (backendError) {
      setBackendError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      // Validate that dob is not in the future
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = "Date of birth cannot be in the future";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const backendData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone,
        gender: genderMap[formData.gender] || "",
        dob: formData.dob || null,
        bloodGroup: formData.bloodGroup
          ? bloodGroupMap[formData.bloodGroup]
          : null,
        familyHistory: formData.familyHistory?.trim() || null,
      };

      console.log("Sending to backend:", JSON.stringify(backendData, null, 2));

      const response = await axios.post(
        `${BASE_URL}/patient/addPatient`,
        backendData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      console.log("Response data:", response.data);

      if (response.status === 200) {
        setSuccessMessage("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(response.data?.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error details:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

        if (error.response.status === 400) {
          // Handle validation errors from backend
          if (error.response.data.errors) {
            const backendErrors = {};
            error.response.data.errors.forEach((err) => {
              backendErrors[err.field] = err.message;
            });
            setErrors(backendErrors);
          } else if (error.response.data.message) {
            setBackendError(error.response.data.message);
          }
        } else if (error.response.status === 409) {
          // Email already exists
          setBackendError(
            "This email is already registered. Please use a different email or login instead."
          );
        } else {
          setBackendError(
            error.response.data?.message ||
              `Registration failed (Status: ${error.response.status})`
          );
        }
      } else if (error.request) {
        setBackendError("No response from server. Please check your internet connection and try again.");
      } else {
        setBackendError("Registration failed. Please try again.");
      }
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

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

      <div style={{ paddingTop: "80px" }}></div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="mb-4 text-center">
              <h2 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                Patient Registration
              </h2>
              <p className="text-muted mb-0">
                Create your DocLink Patient account
              </p>
            </div>

            <Card
              className="shadow-sm border-0"
              style={{ borderRadius: "16px" }}
            >
              <Card.Body className="p-4">
                {successMessage && (
                  <Alert variant="success" className="rounded-3 mb-4" dismissible>
                    <Alert.Heading>Success!</Alert.Heading>
                    {successMessage}
                  </Alert>
                )}

                {backendError && (
                  <Alert variant="danger" className="rounded-3 mb-4" dismissible onClose={() => setBackendError("")}>
                    <Alert.Heading>Registration Error</Alert.Heading>
                    <p>{backendError}</p>
                    {backendError.includes("already registered") && (
                      <div className="mt-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => navigate("/login")}
                        >
                          Go to Login
                        </Button>
                      </div>
                    )}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
                      Basic Information
                    </h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <Form.Group>
                          <Form.Label
                            className="fw-medium"
                            style={{ color: "#2c3e50" }}
                          >
                            Full Name *
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            isInvalid={!!errors.name}
                            required
                            style={{
                              padding: "10px",
                              border: "1px solid #e9ecef",
                              borderRadius: "8px",
                            }}
                            placeholder="Enter your full name"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Group>
                          <Form.Label
                            className="fw-medium"
                            style={{ color: "#2c3e50" }}
                          >
                            Email Address *
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                            required
                            style={{
                              padding: "10px",
                              border: "1px solid #e9ecef",
                              borderRadius: "8px",
                            }}
                            placeholder="Enter your email"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <Form.Group>
                          <Form.Label
                            className="fw-medium"
                            style={{ color: "#2c3e50" }}
                          >
                            Phone Number *
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            isInvalid={!!errors.phone}
                            required
                            style={{
                              padding: "10px",
                              border: "1px solid #e9ecef",
                              borderRadius: "8px",
                            }}
                            placeholder="Enter 10-digit phone number"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.phone}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Group>
                          <Form.Label
                            className="fw-medium"
                            style={{ color: "#2c3e50" }}
                          >
                            Gender *
                          </Form.Label>
                          <Form.Select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            isInvalid={!!errors.gender}
                            required
                            style={{
                              padding: "10px",
                              border: "1px solid #e9ecef",
                              borderRadius: "8px",
                            }}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.gender}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
                      Security
                    </h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <Form.Group>
                          <Form.Label
                            className="fw-medium"
                            style={{ color: "#2c3e50" }}
                          >
                            Password *
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                            required
                            style={{
                              padding: "10px",
                              border: "1px solid #e9ecef",
                              borderRadius: "8px",
                            }}
                            placeholder="Enter password (min. 6 characters)"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Group>
                          <Form.Label
                            className="fw-medium"
                            style={{ color: "#2c3e50" }}
                          >
                            Confirm Password *
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            isInvalid={!!errors.confirmPassword}
                            required
                            style={{
                              padding: "10px",
                              border: "1px solid #e9ecef",
                              borderRadius: "8px",
                            }}
                            placeholder="Confirm your password"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
                      Additional Information
                    </h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <Form.Group>
                          <Form.Label
                            className="fw-medium"
                            style={{ color: "#2c3e50" }}
                          >
                            Date of Birth *
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            isInvalid={!!errors.dob}
                            required
                            style={{
                              padding: "10px",
                              border: "1px solid #e9ecef",
                              borderRadius: "8px",
                            }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.dob}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            Required for medical records
                          </Form.Text>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Group>
                          <Form.Label
                            className="fw-medium"
                            style={{ color: "#2c3e50" }}
                          >
                            Blood Group
                          </Form.Label>
                          <Form.Select
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                            style={{
                              padding: "10px",
                              border: "1px solid #e9ecef",
                              borderRadius: "8px",
                            }}
                          >
                            <option value="">Select Blood Group</option>
                            {bloodGroups.map((group) => (
                              <option key={group} value={group}>
                                {group}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label
                        className="fw-medium"
                        style={{ color: "#2c3e50" }}
                      >
                        Family Medical History
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="familyHistory"
                        value={formData.familyHistory}
                        onChange={handleChange}
                        style={{
                          padding: "10px",
                          border: "1px solid #e9ecef",
                          borderRadius: "8px",
                        }}
                        placeholder="Enter family medical history (if any)"
                      />
                    </Form.Group>
                  </div>

                  <div className="d-grid mb-3">
                    <Button
                      type="submit"
                      className="rounded-pill py-2 fw-medium"
                      disabled={isSubmitting}
                      style={{
                        backgroundColor: "#48b575",
                        color: "white",
                        border: "none",
                        fontSize: "1.1rem",
                        opacity: isSubmitting ? 0.7 : 1,
                      }}
                    >
                      {isSubmitting ? "Registering..." : "Register as Patient"}
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-muted mb-2">
                      Already have an account?{" "}
                      <a
                        href="/login"
                        className="fw-medium"
                        style={{ color: "#48b575" }}
                      >
                        Sign in here
                      </a>
                    </p>
                    <small className="text-muted">
                      By registering, you agree to our Terms of Service and
                      Privacy Policy
                    </small>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      <footer
        className="py-4 mt-5"
        style={{ backgroundColor: "#34495e", color: "#ecf0f1" }}
      >
        <div className="container text-center">
          <small style={{ color: "#95a5a6" }}>
            © 2026 DocLink Healthcare. All rights reserved.
          </small>
        </div>
      </footer>
    </div>
  );
};

export default Registration;