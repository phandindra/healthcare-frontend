// src/components/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DoctorNavbar from "./DoctorNavbar";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState({
    dashboard: true,
    cancel: false,
    complete: false
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get JWT token from session storage
  const getToken = () => {
    return sessionStorage.getItem("jwtToken");
  };

  // Get API instance with token
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

  // Fetch doctor information
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
      setDoctorInfo(response.data);
      return response.data.doctorId; // Return doctorId for appointments fetch
    } catch (err) {
      console.error("Error fetching doctor info:", err);
      setError("Failed to load doctor information");
      return null;
    }
  };

  // Fetch appointments for the doctor
  const fetchAppointments = async (doctorId) => {
    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/Appointments/doctor/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        }
      );

      console.log("Appointments response:", response.data);

      // Sort appointments by date (newest first) and then by time
      const sortedAppointments = response.data.sort((a, b) => {
        const dateCompare = new Date(b.appointmentDate) - new Date(a.appointmentDate);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

      setAppointments(sortedAppointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments");
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setLoading(prev => ({ ...prev, cancel: true }));
    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(
        `${BASE_URL}/Appointments/cancel/${appointmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        }
      );

      // Update appointment status in local state
      setAppointments(prevAppointments =>
        prevAppointments.map(appt =>
          appt.appointmentId === appointmentId
            ? { ...appt, status: "CANCELLED" }
            : appt
        )
      );

      alert("Appointment cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, cancel: false }));
    }
  };

  // Complete appointment
  const handleCompleteAppointment = async (appointmentId) => {
    if (!window.confirm("Mark this appointment as completed?")) {
      return;
    }

    setLoading(prev => ({ ...prev, complete: true }));
    try {
      const api = getApi();
      await api.put(`/doctor/complete/${appointmentId}`);

      // Update appointment status in local state
      setAppointments(prevAppointments =>
        prevAppointments.map(appt =>
          appt.appointmentId === appointmentId
            ? { ...appt, status: "COMPLETED" }
            : appt
        )
      );

      alert("Appointment marked as completed!");
    } catch (err) {
      console.error("Error completing appointment:", err);
      alert("Failed to complete appointment. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, complete: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(prev => ({ ...prev, dashboard: true }));
      try {
        // Fetch doctor info and get doctorId
        const doctorId = await fetchDoctorInfo();
        console.log("Doctor ID:", doctorId);
        
        // If we have a valid doctorId, fetch appointments
        if (doctorId) {
          await fetchAppointments(doctorId);
        } else {
          setError("Unable to fetch doctor ID");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(prev => ({ ...prev, dashboard: false }));
      }
    };

    loadData();
  }, []);

  const handleAddHoliday = () => {
    navigate("/doctor/holiday");
  };

  // Format time from "HH:MM:SS" to "HH:MM AM/PM"
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Format date from "YYYY-MM-DD" to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading.dashboard) {
    return (
      <div className="min-vh-100 bg-light">
        <DoctorNavbar />
        <div style={{ paddingTop: "80px" }}></div>
        <div className="container py-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light">
        <DoctorNavbar />
        <div style={{ paddingTop: "80px" }}></div>
        <div className="container py-4 text-center">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <DoctorNavbar />
      <div style={{ paddingTop: "80px" }}></div>

      {/* Content */}
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="mb-2">Doctor Dashboard</h3>
            <p className="text-muted mb-0">
              Welcome back, Dr. {doctorInfo?.name || ""}
            </p>
          </div>
          <button
            className="btn bg-info"
            onClick={handleAddHoliday}
          >
            <i className="bi bi-calendar-plus me-2"></i>
            Add Holiday
          </button>
        </div>

        {/* Doctor Info Block */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">
                  Specialization
                </h6>
                <h4 className="card-title fw-bold" style={{ color: "#48b575" }}>
                  {doctorInfo?.speciality || "Not specified"}
                </h4>
                <p className="card-text text-muted">
                  Dr. {doctorInfo?.name || "Loading..."}
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">
                  Total Appointments
                </h6>
                <h4 className="card-title fw-bold" style={{ color: "#48b575" }}>
                  {appointments.length}
                </h4>
                <p className="card-text text-muted">
                  {appointments.filter(a => a.status === "BOOKED").length} upcoming
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">
                  Consultation Fee
                </h6>
                <h4 className="card-title fw-bold" style={{ color: "#48b575" }}>
                  ₹{doctorInfo?.fees || "N/A"}
                </h4>
                <p className="card-text text-muted">
                  {doctorInfo?.startTime && doctorInfo?.endTime
                    ? `${doctorInfo.startTime.substring(0, 5)} - ${doctorInfo.endTime.substring(0, 5)}`
                    : "Timing not set"}
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">
                  Experience
                </h6>
                <h4 className="card-title fw-bold" style={{ color: "#48b575" }}>
                  {doctorInfo?.experience || "0"} years
                </h4>
                <p className="card-text text-muted">
                  {doctorInfo?.qualification || "Qualification not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Card */}
        <div className="shadow-sm border-0 mb-4 p-4 rounded-3"
             style={{ backgroundColor: "white" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                <i className="bi bi-calendar-week me-2"></i>
                All Appointments
              </h5>
              <small className="text-muted">
                View and manage all your appointments
              </small>
            </div>
          </div>

          {appointments.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Contact</th>
                    <th>Family History</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.appointmentId}>
                      <td className="fw-bold">#{appt.appointmentId}</td>
                      <td>
                        <div className="fw-semibold">{appt.patientName}</div>
                        <div className="text-muted small">
                          {appt.patientEmail}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-calendar3 text-primary me-2"></i>
                          {formatDate(appt.appointmentDate)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-clock text-primary me-2"></i>
                          {formatTime(appt.startTime)}
                        </div>
                      </td>
                      <td>{appt.patientPhone}</td>
                      <td>
                        <span className="text-muted">
                          {appt.familyHistory || "Not provided"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            appt.status === "BOOKED"
                              ? "bg-success"
                              : appt.status === "CANCELLED"
                              ? "bg-danger"
                              : appt.status === "COMPLETED"
                              ? "bg-info"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {appt.status === "BOOKED"
                            ? "Confirmed"
                            : appt.status === "CANCELLED"
                            ? "Cancelled"
                            : appt.status === "COMPLETED"
                            ? "Completed"
                            : appt.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {/* Show Complete button only for BOOKED appointments */}
                          {appt.status === "BOOKED" && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleCompleteAppointment(appt.appointmentId)}
                                disabled={loading.complete}
                              >
                                {loading.complete ? (
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                ) : (
                                  <i className="bi bi-check-circle me-1"></i>
                                )}
                                Complete
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleCancelAppointment(appt.appointmentId)}
                                disabled={loading.cancel}
                              >
                                {loading.cancel ? (
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                ) : (
                                  <i className="bi bi-x-circle me-1"></i>
                                )}
                                Cancel
                              </button>
                            </>
                          )}
                          {/* Show message for non-BOOKED appointments */}
                          {(appt.status === "CANCELLED" || appt.status === "COMPLETED") && (
                            <span className="text-muted small">No actions</span>
                          )}
                        </div>
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
              <p className="text-muted mt-3">No appointments found</p>
              <p className="text-muted">
                You don't have any appointments scheduled yet.
              </p>
            </div>
          )}
        </div>

        {/* Doctor Additional Info */}
        {doctorInfo && (
          <div className="row mt-4">
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Location</h6>
                  <p className="card-text">
                    {doctorInfo.location || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">
                    Working Hours
                  </h6>
                  <p className="card-text">
                    {doctorInfo.startTime && doctorInfo.endTime
                      ? `${doctorInfo.startTime.substring(0, 5)} - ${doctorInfo.endTime.substring(0, 5)}`
                      : "Not set"}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">
                    Contact Info
                  </h6>
                  <p className="card-text mb-1">
                    <i className="bi bi-envelope me-2"></i>
                    {doctorInfo.email || "Not specified"}
                  </p>
                  <p className="card-text mb-0">
                    <i className="bi bi-telephone me-2"></i>
                    {doctorInfo.phone || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;