import React, { useState, useEffect } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DoctorNavbar from './DoctorNavbar';
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DoctorEditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    doctorName: "",
    email: "",
    speciality: "",
    location: "",
    experience: "",
    fees: "",
    startTime: "",
    endTime: "",
  });

  const [doctorId, setDoctorId] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState({
    fetch: true,
    submit: false
  });

  // Get JWT token from session storage
  const getToken = () => {
    return sessionStorage.getItem("jwtToken");
  };

  // Fetch doctor information from backend
  const fetchDoctorInfo = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${BASE_URL}/doctor/by-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      });
      
      const doctorData = response.data;
      setDoctorId(doctorData.doctorId);
      
      // Format time to HH:MM (remove seconds if present)
      const formatTime = (time) => {
        if (!time) return "";
        // If time is in HH:MM:SS format, extract HH:MM
        if (time.includes(':')) {
          const parts = time.split(':');
          return `${parts[0]}:${parts[1]}`; // Keep only hours and minutes
        }
        return time;
      };
      
      // Map backend data to form fields
      setFormData({
        doctorName: doctorData.name || "",
        email: doctorData.email || "",
        speciality: doctorData.speciality || "",
        location: doctorData.location || "",
        experience: doctorData.experience?.toString() || "",
        fees: doctorData.fees?.toString() || "",
        startTime: formatTime(doctorData.startTime) || "",
        endTime: formatTime(doctorData.endTime) || "",
      });
      
      return doctorData;
    } catch (err) {
      console.error("Error fetching doctor info:", err);
      setErrors({ fetch: "Failed to load doctor information" });
      return null;
    }
  };

  // Load doctor data on component mount
  useEffect(() => {
    const loadDoctorData = async () => {
      setLoading(prev => ({ ...prev, fetch: true }));
      try {
        await fetchDoctorInfo();
      } catch (err) {
        console.error("Error loading doctor data:", err);
      } finally {
        setLoading(prev => ({ ...prev, fetch: false }));
      }
    };

    loadDoctorData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateTime = (time) => {
    // Validate HH:MM format
    if (!time.trim()) return false;
    
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) return false;
    
    // Check if minutes are valid (00-59)
    const [hours, minutes] = time.split(':').map(Number);
    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;
    
    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctorName.trim()) newErrors.doctorName = "Doctor name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.speciality.trim()) newErrors.speciality = "Speciality is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    
    // Validate fees
    if (!formData.fees.trim()) {
      newErrors.fees = "Fees is required";
    } else if (isNaN(parseFloat(formData.fees)) || parseFloat(formData.fees) <= 0) {
      newErrors.fees = "Fees must be a positive number";
    }
    
    // Validate experience
    if (!formData.experience.trim()) {
      newErrors.experience = "Experience is required";
    } else if (!/^\d+$/.test(formData.experience)) {
      newErrors.experience = "Experience must be a whole number";
    }
    
    // Validate start time (HH:MM format)
    if (!formData.startTime.trim()) {
      newErrors.startTime = "Start time is required";
    } else if (!validateTime(formData.startTime)) {
      newErrors.startTime = "Start time must be in HH:MM format (24-hour, e.g., 09:00, 14:30)";
    }
    
    // Validate end time (HH:MM format)
    if (!formData.endTime.trim()) {
      newErrors.endTime = "End time is required";
    } else if (!validateTime(formData.endTime)) {
      newErrors.endTime = "End time must be in HH:MM format (24-hour, e.g., 17:00, 21:30)";
    } else if (validateTime(formData.startTime) && validateTime(formData.endTime)) {
      // Convert times to minutes for comparison
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      
      if (endTotalMinutes <= startTotalMinutes) {
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

    setLoading(prev => ({ ...prev, submit: true }));
    setSuccess("");

    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      // Format time to include seconds for backend (HH:MM:00)
      const formatTimeForBackend = (time) => {
        return time + ":00";
      };

      // Prepare data for backend
      const updateData = {
        doctorId: doctorId,
        doctorName: formData.doctorName,
        email: formData.email,
        speciality: formData.speciality,
        location: formData.location,
        experience: parseInt(formData.experience, 10),
        fees: parseFloat(formData.fees),
        startTime: formatTimeForBackend(formData.startTime),
        endTime: formatTimeForBackend(formData.endTime)
      };

      const response = await axios.put(
        `${BASE_URL}/doctor/edit-profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            accept: "*/*",
          },
        }
      );

      setSuccess(response.data.message || "Profile updated successfullyy!");
      
      // Refresh doctor data after successful update
      await fetchDoctorInfo();
    setTimeout(() => {
    navigate("/doctor");
    }, 1000);
      

    } catch (err) {
      console.error("Error updating profile:", err);
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = "Invalid data. Please check your input.";
        } else if (err.response.status === 401) {
          errorMessage = "Unauthorized. Please login again.";
          navigate("/login");
        } else if (err.response.status === 403) {
          errorMessage = "You don't have permission to update profile.";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleCancel = () => {
    navigate("/doctor");
  };

  if (loading.fetch) {
    return (
      <div className="min-vh-100 bg-light">
        <DoctorNavbar />
        <div style={{ paddingTop: "80px" }}></div>
        <Container className="py-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading profile...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <DoctorNavbar />
      <div style={{ paddingTop: "80px" }}></div>
      
      <Container className="py-4">
        <div className="mb-4">
          <h2>Edit Doctor Profile</h2>
          <p className="text-muted">Update your professional information</p>
        </div>

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {errors.fetch && (
          <Alert variant="danger" dismissible onClose={() => setErrors({})}>
            {errors.fetch}
          </Alert>
        )}

        {errors.submit && (
          <Alert variant="danger" dismissible onClose={() => setErrors({})}>
            {errors.submit}
          </Alert>
        )}

        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <h5 className="mb-3 border-bottom pb-2">
                    Personal Information
                  </h5>

                  <Form.Group className="mb-3">
                    <Form.Label>Doctor Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="doctorName"
                      value={formData.doctorName}
                      onChange={handleChange}
                      isInvalid={!!errors.doctorName}
                      placeholder="Enter your full name"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.doctorName}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      placeholder="Enter your email"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Speciality *</Form.Label>
                    <Form.Control
                      type="text"
                      name="speciality"
                      value={formData.speciality}
                      onChange={handleChange}
                      isInvalid={!!errors.speciality}
                      placeholder="e.g., Cardiology, Dermatology"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.speciality}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Location *</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      isInvalid={!!errors.location}
                      placeholder="Enter clinic/hospital location"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.location}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                {/* Right Column */}
                <div className="col-md-6">
                  <h5 className="mb-3 border-bottom pb-2">Professional Information</h5>

                  <Form.Group className="mb-3">
                    <Form.Label>Experience (years) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      isInvalid={!!errors.experience}
                      placeholder="Enter years of experience"
                      min="0"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.experience}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Consultation Fee (₹) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="fees"
                      value={formData.fees}
                      onChange={handleChange}
                      isInvalid={!!errors.fees}
                      placeholder="Enter consultation fee"
                      min="0"
                      step="0.01"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.fees}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Start Time *</Form.Label>
                    <Form.Control
                      type="text"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      isInvalid={!!errors.startTime}
                      placeholder="HH:MM (e.g., 09:00)"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.startTime}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      24-hour format, hours: 00-23, minutes: 00-59
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>End Time *</Form.Label>
                    <Form.Control
                      type="text"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      isInvalid={!!errors.endTime}
                      placeholder="HH:MM (e.g., 17:00)"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.endTime}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      24-hour format, must be after start time
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                <Button variant="outline-secondary" onClick={handleCancel}>
                  Cancel
                </Button>

                <Button variant="primary" type="submit" disabled={loading.submit}>
                  {loading.submit ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default DoctorEditProfile;