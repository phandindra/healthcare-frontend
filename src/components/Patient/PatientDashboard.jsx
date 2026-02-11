import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PatientNavbar from "./PatientNavbar";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [groupedSlots, setGroupedSlots] = useState({});
  const [loading, setLoading] = useState({
    doctors: true,
    appointments: true,
    slots: false,
    booking: false,
    patientData: true,
  });
  const [error, setError] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [patientId, setPatientId] = useState(null);

  const API_BASE_URL = `${BASE_URL}`;

  const getToken = () => sessionStorage.getItem("jwtToken");

  const getApi = () => {
    const token = getToken();
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Fetch patient data - made public so EditPatient can call it
  const fetchPatientData = async () => {
    try {
      const api = getApi();
      const response = await api.get("/patient/byUser");
      const patientData = response.data;

      console.log("Fetched patient data:", patientData);

      // Store patientId in both localStorage and state
      if (patientData.patientId) {
        localStorage.setItem("patientId", patientData.patientId);
        sessionStorage.setItem("patientId", patientData.patientId);
        setPatientId(patientData.patientId);
      }

      // Set patient name - IMPORTANT: Always use the API response, not localStorage
      if (patientData.patientName) {
        setPatientName(patientData.patientName);
      } else if (patientData.email) {
        const nameFromEmail = patientData.email.split("@")[0];
        setPatientName(
          nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        );
      }

      return patientData.patientId;
    } catch (err) {
      console.error("Error fetching patient data:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      }
      return null;
    }
  };

  // Fetch patient data whenever component mounts or user returns from edit page
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    const userRole = sessionStorage.getItem("userRole");
    if (!isAuthenticated || userRole !== "ROLE_PATIENT") {
      navigate("/login");
      return;
    }

    // First fetch patient data, then fetch other data
    const initializeData = async () => {
      setLoading((prev) => ({ ...prev, patientData: true }));

      // Always fetch fresh patient data from API - don't rely on localStorage
      const fetchedPatientId = await fetchPatientData();
      if (!fetchedPatientId) {
        alert("Failed to load patient data. Please login again.");
        navigate("/login");
        return;
      }

      setLoading((prev) => ({ ...prev, patientData: false }));

      // Now fetch other data
      fetchDoctors();
      fetchPatientAppointments();
    };

    initializeData();
  }, [navigate]);

  // Also fetch patient data when component is focused (user returns from edit page)
  useEffect(() => {
    const handleFocus = () => {
      // Refresh patient data when page gets focus (user returns from edit page)
      fetchPatientData();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (selectedDoctor) fetchAvailableSlots(selectedDoctor.doctorId);
    else {
      setGroupedSlots({});
      setSelectedDate("");
      setSelectedSlot(null);
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    setLoading((prev) => ({ ...prev, doctors: true }));
    try {
      const api = getApi();
      const response = await api.get("/doctor/findAllDoctors");
      const mappedDoctors = response.data.map((doc) => ({
        doctorId: doc.doctorId,
        doctorName: doc.doctorName,
        specialization: doc.speciality,
        clinicAddress: doc.location,
        consultationFee: doc.fees,
        startTime: doc.startTime,
        endTime: doc.endTime,
      }));
      setDoctors(mappedDoctors);
      setSpecializations([
        ...new Set(response.data.map((doc) => doc.speciality)),
      ]);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else {
        setError("Failed to load doctors");
      }
    } finally {
      setLoading((prev) => ({ ...prev, doctors: false }));
    }
  };

  const fetchPatientAppointments = async () => {
    setLoading((prev) => ({ ...prev, appointments: true }));
    try {
      const currentPatientId =
        patientId ||
        localStorage.getItem("patientId") ||
        sessionStorage.getItem("patientId");
      if (currentPatientId) {
        const api = getApi();
        // Fetch appointments from the correct endpoint
        
        const response = await api.get(
          `/Appointments/patient/${currentPatientId}`,
        );
        console.log(response)

        // Transform the response data if needed
        const appointmentsData = response.data.map((appointment) => ({
          appointmentId: appointment.appointmentId,
          doctorName: appointment.doctor?.doctorName || appointment.doctorName,
          specialization:
            appointment.doctor?.speciality  || appointment.speciality ,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime || appointment.startTime,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          doctor: appointment.doctor || {
            doctorName: appointment.doctorName,
            specialization: appointment.specialization,
          },
        }));

        setAppointments(appointmentsData);
      } else {
        // If no patientId, try to fetch patient data first
        const fetchedPatientId = await fetchPatientData();
        if (fetchedPatientId) {
          const api = getApi();
          const response = await api.get(
            `/Appointments/patient/${fetchedPatientId}`,
          );

          // Transform the response data
          const appointmentsData = response.data.map((appointment) => ({
            appointmentId: appointment.appointmentId,
            doctorName:
              appointment.doctor?.doctorName || appointment.doctorName,
            specialization:
              appointment.doctor?.specialization || appointment.specialization,
            appointmentDate: appointment.appointmentDate,
            appointmentTime:
              appointment.appointmentTime || appointment.startTime,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            status: appointment.status,
            doctor: appointment.doctor || {
              doctorName: appointment.doctorName,
              specialization: appointment.specialization,
            },
          }));

          setAppointments(appointmentsData);
        }
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else if (err.response?.status === 404) {
        // No appointments found - set empty array
        setAppointments([]);
      } else {
        setError("Failed to load appointments");
      }
    } finally {
      setLoading((prev) => ({ ...prev, appointments: false }));
    }
  };

  // Helper function to check if a slot is in the past for today
  const isSlotInPast = (slotDate, slotStartTime) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    // If slot is not for today, it's not in the past
    if (slotDate !== today) {
      return false;
    }
    
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Parse slot start time
    const [slotHours, slotMinutes] = slotStartTime.split(':').map(Number);
    
    // Compare current time with slot time
    if (slotHours < currentHours) {
      return true;
    } else if (slotHours === currentHours && slotMinutes <= currentMinutes) {
      return true;
    }
    
    return false;
  };

  const fetchAvailableSlots = async (doctorId) => {
    setLoading((prev) => ({ ...prev, slots: true }));
    setGroupedSlots({});
    setSelectedDate("");
    setSelectedSlot(null);
    try {
      const api = getApi();
      const response = await api.get(
        `/patient/doctors/${doctorId}/available-slots`,
      );
      const data = response.data;
      if (data.availableSlots?.length) {
        const grouped = {};
        data.availableSlots.forEach((slot) => {
          const startTime = slot.startTime || "00:00:00";
          const endTime = slot.endTime || "00:00:00";
          const [hours, minutes] = startTime.split(":");
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12;
          const formattedSlot = {
            display: `${hour12}:${minutes} ${ampm}`,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            originalSlot: slot,
          };
          
          // Filter out past slots for today
          if (!isSlotInPast(slot.date, slot.startTime)) {
            if (!grouped[slot.date]) grouped[slot.date] = [];
            grouped[slot.date].push(formattedSlot);
          }
        });
        setGroupedSlots(grouped);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      }
      setGroupedSlots({});
    } finally {
      setLoading((prev) => ({ ...prev, slots: false }));
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      alert("Please select doctor, date & time slot");
      return;
    }

    setLoading((prev) => ({ ...prev, booking: true }));
    setError(null);
    setSuccessMessage("");

    try {
      // Get patientId from multiple possible sources
      let currentPatientId =
        patientId ||
        localStorage.getItem("patientId") ||
        sessionStorage.getItem("patientId");

      // If still no patientId, fetch it from API
      if (!currentPatientId) {
        currentPatientId = await fetchPatientData();
        if (!currentPatientId) {
          alert("Failed to get patient information. Please login again.");
          navigate("/login");
          return;
        }
      }

      // Create appointment data
      const appointmentData = {
        patientId: parseInt(currentPatientId),
        doctorId: selectedDoctor.doctorId,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      };

      console.log("Booking appointment with data:", appointmentData);
      console.log("Patient ID:", currentPatientId);
      console.log("Token:", getToken());

      // Make the booking request
      const token = getToken();
      if (!token) {
        alert("No authentication token found. Please login again.");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/patient/bookAppointment`,
        appointmentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        const successMsg = `Appointment booked successfully with Dr. ${selectedDoctor.doctorName} on ${formatDate(selectedDate)} at ${selectedSlot.display}`;
        setSuccessMessage(successMsg);
        alert(successMsg);

        // Refresh data
        fetchPatientAppointments();
        fetchAvailableSlots(selectedDoctor.doctorId);

        // Reset selection
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedSlot(null);
        setSelectedSpecialization("");
        setSearchLocation("");
      }
    } catch (err) {
      console.error("Full booking error:", err);
      console.error("Error response:", err.response);

      if (err.response) {
        if (err.response.status === 401) {
          alert("Session expired. Please login again.");
          sessionStorage.clear();
          localStorage.clear();
          navigate("/login");
        } else if (err.response.status === 400) {
          setError(
            `Bad request: ${err.response.data?.message || "Please check your input"}`,
          );
        } else if (err.response.status === 403) {
          setError("You don't have permission to book appointments.");
        } else if (err.response.status === 409) {
          setError("Time slot already booked. Please choose another slot.");
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(
            `Error: ${err.response.data?.message || "Please try again"}`,
          );
        }
      } else if (err.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading((prev) => ({ ...prev, booking: false }));
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const api = getApi();
        const response = await api.put(`/Appointments/cancel/${appointmentId}`);
        if (response.status === 200) {
          alert("Appointment cancelled successfully");
          fetchPatientAppointments();
        }
      } catch (err) {
        console.error("Error cancelling appointment:", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/login");
        } else {
          alert(
            `Failed to cancel appointment: ${err.response?.data?.message || err.message}`,
          );
        }
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes, seconds] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatAppointmentTime = (timeString) => {
    if (!timeString) return "N/A";
    const parts = timeString.split(":");
    if (parts.length < 2) return timeString;

    const hour = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      (!selectedSpecialization ||
        doc.specialization === selectedSpecialization) &&
      (!searchLocation.trim() ||
        doc.clinicAddress
          ?.toLowerCase()
          .includes(searchLocation.toLowerCase())),
  );

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <PatientNavbar />
      <div style={{ paddingTop: "80px" }}></div>

      <div className="container py-4">
        {loading.patientData && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading your profile...</p>
          </div>
        )}

        {!loading.patientData && (
          <>
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show mb-4"
                role="alert"
              >
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                ></button>
              </div>
            )}

            {successMessage && (
              <div
                className="alert alert-success alert-dismissible fade show mb-4"
                role="alert"
              >
                {successMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccessMessage("")}
                ></button>
              </div>
            )}

            {/* Welcome Banner */}
            <div
              className="shadow-sm border-0 mb-4 p-4 rounded-3"
              style={{
                backgroundColor: "white",
                borderLeft: "5px solid #0d6efd",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                    Welcome back, {patientName}! 👋
                  </h3>
                  <p className="text-muted mb-0">
                    Book appointments with trusted doctors today
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  {/* <button
                    className="btn btn-outline-primary btn-sm me-3"
                    onClick={() => navigate("/patient/edit")}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit Profile
                  </button> */}
                  <div className="text-end">
                    <small className="text-muted d-block">Today is</small>
                    <strong>
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary Alert */}
            {selectedDoctor && selectedDate && selectedSlot && (
              <div
                className="alert alert-info mb-4 border-0 shadow-sm"
                role="alert"
                style={{ backgroundColor: "#e7f1ff" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-1">Ready to Book</h6>
                    <p className="mb-0">
                      <i className="bi bi-person-circle me-2"></i>
                      <strong>Dr. {selectedDoctor.doctorName}</strong> •{" "}
                      {selectedDoctor.specialization}
                      <br />
                      <i className="bi bi-calendar-check me-2"></i>
                      {formatDate(selectedDate)} •{" "}
                      <i className="bi bi-clock me-2"></i>
                      {selectedSlot.display}
                    </p>
                  </div>
                  <div>
                    <button
                      className="btn btn-success px-4 rounded-pill"
                      onClick={handleBookAppointment}
                      disabled={loading.booking}
                    >
                      {loading.booking ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Confirm Booking
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-outline-secondary ms-2"
                      onClick={() => {
                        setSelectedDate("");
                        setSelectedSlot(null);
                      }}
                      disabled={loading.booking}
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Doctor Search Section */}
            <div
              className="shadow-sm border-0 mb-4 p-4 rounded-3"
              style={{ backgroundColor: "white" }}
            >
              <h5 className="fw-bold mb-4" style={{ color: "#2c3e50" }}>
                <i className="bi bi-search me-2"></i>
                Find & Book Doctor
              </h5>

              {/* Search Filters */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label
                    className="form-label fw-medium"
                    style={{ color: "#2c3e50" }}
                  >
                    <i className="bi bi-funnel me-1"></i>
                    Specialization
                  </label>
                  <select
                    className="form-select"
                    value={selectedSpecialization}
                    onChange={(e) => {
                      setSelectedSpecialization(e.target.value);
                      setSelectedDoctor(null);
                      setSelectedDate("");
                      setSelectedSlot(null);
                      setGroupedSlots({});
                    }}
                    disabled={loading.doctors}
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label
                    className="form-label fw-medium"
                    style={{ color: "#2c3e50" }}
                  >
                    <i className="bi bi-geo-alt me-1"></i>
                    Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter city or area"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    disabled={loading.doctors}
                  />
                </div>
              </div>

              {/* Doctors List */}
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                    <i className="bi bi-person-plus me-2"></i>
                    Available Doctors ({filteredDoctors.length})
                  </h6>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setSearchLocation("");
                      setSelectedSpecialization("");
                    }}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear Filters
                  </button>
                </div>

                {loading.doctors ? (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                    <p className="mt-3 text-muted">Loading doctors...</p>
                  </div>
                ) : filteredDoctors.length > 0 ? (
                  <div className="row g-4">
                    {filteredDoctors.map((doctor) => (
                      <div key={doctor.doctorId} className="col-12">
                        <div
                          className="border p-4 rounded-3"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="d-flex align-items-start">
                                {/* <div
                                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                  style={{ width: "50px", height: "50px" }}
                                >
                                  <i className="bi bi-person-fill"></i>
                                </div> */}
                                <div>
                                  <h6
                                    className="fw-bold mb-1"
                                    style={{ color: "#2c3e50" }}
                                  >
                                    {doctor.doctorName}
                                  </h6>
                                  <p className="mb-2 text-muted">
                                    <i className="bi bi-award me-1"></i>
                                    {doctor.specialization}
                                  </p>
                                  <p className="mb-1 small">
                                    <i className="bi bi-geo-alt text-primary me-1"></i>
                                    {doctor.clinicAddress}
                                  </p>
                                  <div className="d-flex flex-wrap gap-3 mt-2">
                                    <span className="badge bg-light text-dark">
                                      <i className="bi bi-clock me-1"></i>
                                      {formatTime(doctor.startTime)} -{" "}
                                      {formatTime(doctor.endTime)}
                                    </span>
                                    <span className="badge bg-light text-dark">
                                      <i className="bi bi-currency-rupee me-1"></i>
                                      ₹{doctor.consultationFee}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4 text-end">
                              <button
                                className={`btn ${selectedDoctor?.doctorId === doctor.doctorId ? "btn-success" : "btn-info"} rounded-pill px-4`}
                                onClick={() => {
                                  if (
                                    selectedDoctor?.doctorId ===
                                    doctor.doctorId
                                  ) {
                                    setSelectedDoctor(null);
                                    setSelectedDate("");
                                    setSelectedSlot(null);
                                  } else {
                                    setSelectedDoctor(doctor);
                                  }
                                }}
                                disabled={loading.slots || loading.booking}
                              >
                                {selectedDoctor?.doctorId ===
                                doctor.doctorId ? (
                                  <>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Selected
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-calendar-plus me-1"></i>
                                    Select
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Available Slots for Selected Doctor */}
                          {selectedDoctor?.doctorId === doctor.doctorId && (
                            <div className="mt-4 pt-4 border-top">
                              <h6 className="fw-bold mb-3">
                                <i className="bi bi-calendar-week me-2"></i>
                                Available Time Slots
                              </h6>

                              {loading.slots ? (
                                <div className="text-center py-3">
                                  <div
                                    className="spinner-border spinner-border-sm text-primary"
                                    role="status"
                                  ></div>
                                  <small className="ms-2">
                                    Loading available slots...
                                  </small>
                                </div>
                              ) : Object.keys(groupedSlots).length > 0 ? (
                                <div>
                                  {Object.keys(groupedSlots).map((date) => (
                                    <div key={date} className="mb-4">
                                      <div className="d-flex align-items-center mb-3">
                                        <div className="bg-primary text-white px-3 py-1 rounded-pill me-3">
                                          <strong>{formatDate(date)}</strong>
                                        </div>
                                        <small className="text-muted">
                                          {date}
                                        </small>
                                      </div>
                                      <div className="d-flex flex-wrap gap-2">
                                        {groupedSlots[date].map(
                                          (slot, index) => (
                                            <button
                                              key={index}
                                              className={`btn ${selectedDate === date && selectedSlot?.display === slot.display ? "btn-success" : "btn-outline-primary"} btn-sm rounded-pill`}
                                              onClick={() => {
                                                if (
                                                  selectedDate === date &&
                                                  selectedSlot?.display ===
                                                    slot.display
                                                ) {
                                                  setSelectedDate("");
                                                  setSelectedSlot(null);
                                                } else {
                                                  setSelectedDate(date);
                                                  setSelectedSlot(slot);
                                                }
                                              }}
                                              style={{ minWidth: "100px" }}
                                              disabled={loading.booking}
                                            >
                                              {slot.display}
                                              {selectedDate === date &&
                                                selectedSlot?.display ===
                                                  slot.display && (
                                                  <i className="bi bi-check ms-1"></i>
                                                )}
                                            </button>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <i
                                    className="bi bi-calendar-x text-muted"
                                    style={{ fontSize: "2rem" }}
                                  ></i>
                                  <p className="text-muted mt-2">
                                    No available slots for this doctor
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i
                      className="bi bi-search text-muted"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <p className="text-muted mt-3">
                      No doctors found matching your criteria
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Appointments Section */}
            <div
              className="shadow-sm border-0 mb-4 p-4 rounded-3"
              style={{ backgroundColor: "white" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                    <i className="bi bi-calendar-check me-2"></i>
                    Your Appointments
                  </h5>
                  <small className="text-muted">
                    View and manage your appointments
                  </small>
                </div>
                
              </div>

              {loading.appointments ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>
                  <p className="mt-3 text-muted">Loading appointments...</p>
                </div>
              ) : appointments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th>#</th>
                        <th>Doctor</th>
                        <th>Specialization</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment, index) => (
                        <tr key={appointment.appointmentId || index}>
                          <td className="fw-bold">
                            {appointment.appointmentId || `A${index + 1}`}
                          </td>
                          <td>
                            <strong>
                             {" "}
                              {appointment.doctorName ||
                                appointment.doctor?.doctorName ||
                                "N/A"}
                            </strong>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {appointment.doctor?.specialization ||
                                 appointment.doctor?.speciality ||
                                 appointment.specialization ||
                                "N/A"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-calendar3 text-primary me-2"></i>
                              {formatDate(appointment.appointmentDate) || "N/A"}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-clock text-primary me-2"></i>
                              {formatAppointmentTime(
                                appointment.appointmentTime ||
                                  appointment.startTime,
                              )}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                appointment.status === "CONFIRMED" ||
                                appointment.status === "BOOKED"
                                  ? "bg-success"
                                  : appointment.status === "COMPLETED"
                                    ? "bg-info"
                                    : appointment.status === "CANCELLED"
                                      ? "bg-danger"
                                      : appointment.status === "PENDING"
                                        ? "bg-warning"
                                        : "bg-secondary"
                              }`}
                            >
                              {appointment.status || "PENDING"}
                            </span>
                          </td>
                          <td>
                            {appointment.status === "BOOKED" ||
                            appointment.status === "CONFIRMED" ||
                            appointment.status === "PENDING" ? (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleCancelAppointment(
                                    appointment.appointmentId,
                                  )
                                }
                                disabled={loading.appointments}
                              >
                                <i className="bi bi-x-circle me-1"></i>
                                Cancel
                              </button>
                            ) : (
                              <span className="text-muted small">
                                No actions
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i
                    className="bi bi-calendar-x text-muted"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <p className="text-muted mt-3">
                    No appointments scheduled yet
                  </p>
                  <p className="text-muted">
                    Book your first appointment above!
                  </p>
                </div>
              )}
            </div>

            {/* Specializations Grid */}
            <div
              className="shadow-sm border-0 p-4 rounded-3"
              style={{ backgroundColor: "white" }}
            >
              <h5 className="fw-bold mb-4" style={{ color: "#2c3e50" }}>
                <i className="bi bi-heart-pulse me-2"></i>
                Browse by Specialization
              </h5>

              {loading.doctors ? (
                <div className="text-center py-3">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  ></div>
                </div>
              ) : specializations.length > 0 ? (
                <div className="row g-3">
                  {specializations.map((spec) => {
                    const doctorCount = doctors.filter(
                      (doc) => doc.specialization === spec,
                    ).length;
                    return (
                      <div key={spec} className="col-md-4 col-sm-6">
                        <div
                          className="p-3 rounded-3 border cursor-pointer h-100"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderColor: "#48b575",
                            cursor: "pointer",
                            transition: "all 0.3s",
                          }}
                          onClick={() => setSelectedSpecialization(spec)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-5px)";
                            e.currentTarget.style.boxShadow =
                              "0 5px 15px rgba(0,0,0,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6
                                className="fw-bold mb-1"
                                style={{ color: "#2c3e50" }}
                              >
                                {spec}
                              </h6>
                              <small className="text-muted">
                                {doctorCount} doctor
                                {doctorCount !== 1 ? "s" : ""} available
                              </small>
                            </div>
                            <i className="bi bi-arrow-right-circle text-primary"></i>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted">
                  No specializations available at the moment.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="text-center py-4 mt-4 text-muted small">
              <p className="mb-0">
                <i className="bi bi-shield-check me-1"></i>
                Your health is our priority. All appointments are secured and
                confidential.
              </p>
              <p className="mb-0">
                Need help? Contact support at support@healthcare.com
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;