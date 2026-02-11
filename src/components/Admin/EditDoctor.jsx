// src/components/admin/EditDoctor.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

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

  const [errors, setErrors] = useState({});

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

  // ✅ JWT Token
  const token = localStorage.getItem("jwtToken");

  // ✅ Convert time safely to HH:mm:ss
  const formatTime = (time) => {
    if (!time) return null;
    return time.length === 5 ? time + ":00" : time;
  };

  // ✅ Fetch doctor data
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/doctor/findAllDoctors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const doctors = Array.isArray(res.data) ? res.data : [];

        const foundDoctor = doctors.find(
          (doc) => String(doc.doctorId) === String(id),
        );

        if (!foundDoctor) {
          setApiError("Doctor not found");
          return;
        }

        setFormData({
          doctorName: foundDoctor.doctorName || "",
          email: foundDoctor.email || "",
          speciality: foundDoctor.speciality || "",
          location: foundDoctor.location || "",
          experience: foundDoctor.experience?.toString() || "",
          fees: foundDoctor.fees?.toString() || "",
          startTime: foundDoctor.startTime
            ? foundDoctor.startTime.substring(0, 5)
            : "",
          endTime: foundDoctor.endTime
            ? foundDoctor.endTime.substring(0, 5)
            : "",
        });
      } catch (err) {
        console.error("Fetch doctor error:", err);
        setApiError("Failed to load doctor details");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctorName.trim())
      newErrors.doctorName = "Doctor name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.speciality) newErrors.speciality = "Speciality is required";

    if (!formData.location.trim()) newErrors.location = "Location is required";

    if (!formData.experience || Number(formData.experience) < 0)
      newErrors.experience = "Valid experience is required";

    if (!formData.fees || Number(formData.fees) <= 0)
      newErrors.fees = "Valid fees is required";

    if (!formData.startTime) newErrors.startTime = "Start time is required";

    if (!formData.endTime) newErrors.endTime = "End time is required";

    if (formData.startTime && formData.endTime) {
      if (formatTime(formData.endTime) <= formatTime(formData.startTime)) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setApiError("");
    setApiSuccess("");

    const payload = {
      doctorId: Number(id),
      doctorName: formData.doctorName.trim(),
      email: formData.email.trim(),
      speciality: formData.speciality,
      location: formData.location.trim(),
      experience: Number(formData.experience),
      fees: Number(formData.fees),
      startTime: formatTime(formData.startTime),
      endTime: formatTime(formData.endTime),
    };

    console.log("FINAL PAYLOAD:", payload);

    try {
      const res = await axios.put(
        `${BASE_URL}/doctor/edit-profile`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.status === "SUCCESS" || res.data.status === "Success") {
        setApiSuccess("Doctor profile updated successfully!");
        setTimeout(() => navigate("/admin/doctorList"), 1000);
      } else {
        setApiError(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);

      if (err.response?.status === 403) {
        setApiError("Access denied (ROLE / JWT issue)");
      } else {
        setApiError(err.response?.data?.message || "Update failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading doctor details...</p>
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <AdminNavbar />
      <div style={{ paddingTop: "80px" }}></div>

      <div className="container py-4">
        <h2 className="fw-bold mb-3">Edit Doctor</h2>

        {apiSuccess && <Alert variant="success">{apiSuccess}</Alert>}
        {apiError && <Alert variant="danger">{apiError}</Alert>}

        <Card className="shadow-sm border-0">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <Form.Label>Doctor Name *</Form.Label>
                  <Form.Control
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    isInvalid={!!errors.doctorName}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Label>Speciality *</Form.Label>
                  <Form.Select
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleChange}
                    isInvalid={!!errors.speciality}
                  >
                    <option value="">Select Speciality</option>
                    {specialities.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    isInvalid={!!errors.location}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Label>Experience *</Form.Label>
                  <Form.Control
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleChange}
                    isInvalid={!!errors.experience}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Label>Fees *</Form.Label>
                  <Form.Control
                    name="fees"
                    type="number"
                    value={formData.fees}
                    onChange={handleChange}
                    isInvalid={!!errors.fees}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Label>Start Time *</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    isInvalid={!!errors.startTime}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Label>End Time *</Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    isInvalid={!!errors.endTime}
                  />
                </div>
              </div>

              <div className="mt-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Updating..." : "Update Doctor"}
                </Button>
                <Button
                  variant="secondary"
                  className="ms-2"
                  onClick={() => navigate("/admin/doctorList")}
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

export default EditDoctor;
