// src/components/admin/AddDoctor.jsx
import React, { useState } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddDoctor = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    qualification: "",
    speciality: "",
    location: "",
    fees: "",
    experience: "",
    startTime: "",
    endTime: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const specialities = [
    "Cardiologist",
    "Orthopedic",
    "Neurologist",
    "Gynecologist",
    "Pediatrician",
    "Dermatologist",
    "General Physician",
    "ENT Specialist",
    "Dentist",
    "Psychiatrist",
  ];

  // Function to get JWT token from session storage
  const getToken = () => {
    return sessionStorage.getItem("jwtToken");
  };

  // Function to get axios instance with JWT token
  const getApi = () => {
    const token = getToken();
    return axios.create({
      baseURL: `${BASE_URL}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.qualification.trim())
      newErrors.qualification = "Qualification is required";
    if (!formData.speciality) newErrors.speciality = "Speciality is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.fees || formData.fees <= 0)
      newErrors.fees = "Valid fees is required";
    if (!formData.experience || formData.experience < 0)
      newErrors.experience = "Valid experience is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if user is authenticated
    const token = getToken();
    if (!token) {
      setApiError("You are not authenticated. Please login first.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    setLoading(true);
    setApiError("");
    setApiSuccess("");

    const doctorData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      dob: formData.dob || null,
      qualification: formData.qualification.trim(),
      speciality: formData.speciality,
      location: formData.location.trim(),
      fees: parseFloat(formData.fees),
      experience: parseInt(formData.experience),
      startTime: formData.startTime ? formData.startTime + ":00" : null,
      endTime: formData.endTime ? formData.endTime + ":00" : null,
    };

    try {
      const api = getApi();
      const response = await api.post(
        "/doctor/AddDoctors",
        doctorData
      );

      if (response.data.status === "Success") {
        setApiSuccess("Doctor added successfully!");

        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          dob: "",
          qualification: "",
          speciality: "",
          location: "",
          fees: "",
          experience: "",
          startTime: "",
          endTime: "",
        });
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/admin/doctorList");
        }, 1000);
      } else {
        setApiError(response.data.message || "Failed to add doctor");
      }
    } catch (error) {
      if (error.response) {
        // Server responded with error
        const errorData = error.response.data;
        
        // Handle authentication errors
        if (error.response.status === 401 || error.response.status === 403) {
          setApiError("Authentication failed. Please login again.");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else if (
          errorData.status === "Failed" &&
          errorData.message.includes("Email already exists")
        ) {
          setApiError("Email already exists. Please use a different email.");
          setErrors((prev) => ({ ...prev, email: "Email already exists" }));
        } else {
          setApiError(
            errorData.message || "Failed to add doctor. Please try again.",
          );
        }
      } else if (error.request) {
        // Request made but no response
        setApiError("Network error. Please check your connection.");
      } else {
        // Other errors
        setApiError("An error occurred. Please try again.");
      }
      console.error("Error adding doctor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <AdminNavbar />

      <div style={{ paddingTop: "80px" }}></div>

      <div className="container py-4">
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                Add New Doctor
              </h2>
              <p className="text-muted mb-0">Fill in doctor details below</p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {apiSuccess && (
          <Alert variant="success" className="mb-3">
            {apiSuccess} Redirecting to doctor list...
          </Alert>
        )}
        {apiError && (
          <Alert variant="danger" className="mb-3">
            {apiError}
          </Alert>
        )}

        <Card className="shadow-sm border-0" style={{ borderRadius: "16px" }}>
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit} noValidate>
              <div className="row">
                {/* Personal Information */}
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
                      placeholder="Dr. Full Name"
                      disabled={loading}
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
                      Email *
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
                      placeholder="doctor@example.com"
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

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
                      placeholder="Enter password"
                      disabled={loading}
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
                      placeholder="9876543210"
                      disabled={loading}
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
                      Date of Birth
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      style={{
                        padding: "10px",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                      }}
                      disabled={loading}
                    />
                  </Form.Group>
                </div>

                {/* Professional Information */}
                <div className="col-md-6 mb-3">
                  <Form.Group>
                    <Form.Label
                      className="fw-medium"
                      style={{ color: "#2c3e50" }}
                    >
                      Speciality *
                    </Form.Label>
                    <Form.Select
                      name="speciality"
                      value={formData.speciality}
                      onChange={handleChange}
                      isInvalid={!!errors.speciality}
                      required
                      style={{
                        padding: "10px",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                      }}
                      disabled={loading}
                    >
                      <option value="">Select Speciality</option>
                      {specialities.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.speciality}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Group>
                    <Form.Label
                      className="fw-medium"
                      style={{ color: "#2c3e50" }}
                    >
                      Qualification *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      isInvalid={!!errors.qualification}
                      required
                      style={{
                        padding: "10px",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                      }}
                      placeholder="MBBS, MD, MS, etc."
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.qualification}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Group>
                    <Form.Label
                      className="fw-medium"
                      style={{ color: "#2c3e50" }}
                    >
                      Location *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      isInvalid={!!errors.location}
                      required
                      style={{
                        padding: "10px",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                      }}
                      placeholder="City, State"
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.location}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Group>
                    <Form.Label
                      className="fw-medium"
                      style={{ color: "#2c3e50" }}
                    >
                      Consultation Fee (₹) *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="fees"
                      value={formData.fees}
                      onChange={handleChange}
                      isInvalid={!!errors.fees}
                      required
                      min="0"
                      step="10"
                      style={{
                        padding: "10px",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                      }}
                      placeholder="500"
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.fees}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Group>
                    <Form.Label
                      className="fw-medium"
                      style={{ color: "#2c3e50" }}
                    >
                      Experience (Years) *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      isInvalid={!!errors.experience}
                      required
                      min="0"
                      style={{
                        padding: "10px",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                      }}
                      placeholder="5"
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.experience}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                {/* Availability */}
                <div className="col-md-6 mb-3">
                  <Form.Group>
                    <Form.Label
                      className="fw-medium"
                      style={{ color: "#2c3e50" }}
                    >
                      Start Time *
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      isInvalid={!!errors.startTime}
                      required
                      style={{
                        padding: "10px",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                      }}
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.startTime}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Group>
                    <Form.Label
                      className="fw-medium"
                      style={{ color: "#2c3e50" }}
                    >
                      End Time *
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      isInvalid={!!errors.endTime}
                      required
                      style={{
                        padding: "10px",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                      }}
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.endTime}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>

              <div className="d-flex gap-3 mt-4">
                <Button
                  type="submit"
                  className="rounded-pill px-4 fw-medium d-flex align-items-center"
                  style={{
                    backgroundColor: "#48b575",
                    color: "white",
                    border: "none",
                    minWidth: "120px",
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Adding...
                    </>
                  ) : (
                    "Add Doctor"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  className="rounded-pill px-4"
                  onClick={() => navigate("/admin/doctorList")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AddDoctor;