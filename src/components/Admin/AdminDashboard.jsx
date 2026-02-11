import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    doctors: 0, 
    patients: 0,
    activeDoctors: 0,
    activePatients: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch statistics from APIs
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Fetch total doctors
      const doctorsResponse = await axios.get(`${BASE_URL}/doctor/findAllDoctors`);
      const totalDoctors = doctorsResponse.data.length;
      
      // Fetch total patients
      const patientsResponse = await axios.get(`${BASE_URL}/patient/AllPatients`);
      const totalPatients = patientsResponse.data.length;

      // For now, we'll use the same numbers for active counts
      // If you have APIs for active counts, replace these
      const activeDoctors = totalDoctors;
      const activePatients = totalPatients;

      setStats({
        doctors: totalDoctors,
        patients: totalPatients,
        activeDoctors: activeDoctors,
        activePatients: activePatients
      });
      
      setError(null);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("patientId");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userRole");
    navigate("/login");
  };

  // Navigate to appointments page
  const handleViewAppointments = () => {
    navigate("/admin/appointments");
  };

  return (
    <div
      className="min-vh-100"
      style={{
        backgroundColor: "#ecf0f1",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Navbar */}
      <AdminNavbar />

      <div style={{ paddingTop: "80px" }}></div>

      {/* Main Content */}
      <Container className="py-5">
        {/* Show dashboard only on home route */}
        {window.location.pathname === "/admin" ? (
          <>
            <div className="mb-4">
              <h2 className="mb-3 fw-bold" style={{ color: "#2c3e50" }}>
                Admin Dashboard
              </h2>
              <p className="text-muted mb-0">
                Welcome to DocLink admin panel. Manage doctors and patients efficiently.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger mb-4" role="alert">
                {error}
                <button 
                  className="btn btn-sm btn-outline-danger ms-3" 
                  onClick={fetchStatistics}
                >
                  Retry
                </button>
              </div>
            )}

            <Row>
              <Col md={6} className="mb-4">
                <Card
                  className="shadow-sm h-100 border-0"
                  style={{ borderRadius: "16px" }}
                >
                  <Card.Body className="text-center p-4">
                    {loading ? (
                      <div className="py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading...</p>
                      </div>
                    ) : (
                      <>
                        <h1 className="fw-bold mb-2" style={{ color: "#48b575" }}>
                          {stats.doctors}
                        </h1>
                        <p className="text-muted mb-3 fs-5">Total Doctors</p>
                        <button
                          onClick={() => navigate("/admin/doctorList")}
                          className="btn rounded-pill px-4"
                          style={{
                            backgroundColor: "#48b575",
                            color: "white",
                            border: "none",
                            fontWeight: "600",
                          }}
                        >
                          View Doctors
                        </button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-4">
                <Card
                  className="shadow-sm h-100 border-0"
                  style={{ borderRadius: "16px" }}
                >
                  <Card.Body className="text-center p-4">
                    {loading ? (
                      <div className="py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading...</p>
                      </div>
                    ) : (
                      <>
                        <h1 className="fw-bold mb-2" style={{ color: "#48b575" }}>
                          {stats.patients}
                        </h1>
                        <p className="text-muted mb-3 fs-5">Total Patients</p>
                        <button
                          onClick={() => navigate("/admin/patientList")}
                          className="btn rounded-pill px-4"
                          style={{
                            backgroundColor: "#48b575",
                            color: "white",
                            border: "none",
                            fontWeight: "600",
                          }}
                        >
                          View Patients
                        </button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Quick Actions */}
            <Card
              className="shadow-sm mb-4 border-0"
              style={{ borderRadius: "16px" }}
            >
              <Card.Body className="p-4">
                <h5 className="mb-4 fw-bold" style={{ color: "#2c3e50" }}>
                  Quick Actions
                </h5>
                <div className="d-flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/admin/addDoctor")}
                    className="btn rounded-pill px-4 fw-medium"
                    style={{
                      backgroundColor: "#48b575",
                      color: "white",
                      border: "none",
                      padding: "10px 24px",
                    }}
                  >
                    Add New Doctor
                  </button>
                  <button
                    onClick={() => navigate("/admin/doctorList")}
                    className="btn rounded-pill px-4 fw-medium"
                    style={{
                      border: "2px solid #48b575",
                      color: "#48b575",
                      backgroundColor: "transparent",
                      padding: "10px 24px",
                    }}
                  >
                    Manage Doctors
                  </button>
                  <button
                    onClick={() => navigate("/admin/patientList")}
                    className="btn rounded-pill px-4 fw-medium"
                    style={{
                      border: "2px solid #48b575",
                      color: "#48b575",
                      backgroundColor: "transparent",
                      padding: "10px 24px",
                    }}
                  >
                    Manage Patients
                  </button>
                  <button
                    onClick={handleViewAppointments}
                    className="btn rounded-pill px-4 fw-medium"
                    style={{
                      border: "2px solid #48b575",
                      color: "#48b575",
                      backgroundColor: "transparent",
                      padding: "10px 24px",
                    }}
                  >
                    All Appointments
                  </button>
                </div>
              </Card.Body>
            </Card>

            {/* System Overview - Removed Today's Appointments card */}
            <Card
              className="shadow-sm border-0"
              style={{ borderRadius: "16px" }}
            >
              <Card.Body className="p-4">
                <h5 className="mb-4 fw-bold" style={{ color: "#2c3e50" }}>
                  System Overview
                </h5>
                <Row className="text-center">
                  <Col md={6} className="mb-3">
                    <div
                      className="p-4 rounded"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e9ecef",
                      }}
                    >
                      {loading ? (
                        <div>
                          <div className="spinner-border spinner-border-sm text-primary mb-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <h6 className="text-muted mb-2">Active Doctors</h6>
                        </div>
                      ) : (
                        <>
                          <h6 className="text-muted mb-2">Active Doctors</h6>
                          <h3 className="fw-bold mb-0" style={{ color: "#48b575" }}>
                            {stats.activeDoctors}
                          </h3>
                        </>
                      )}
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div
                      className="p-4 rounded"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e9ecef",
                      }}
                    >
                      {loading ? (
                        <div>
                          <div className="spinner-border spinner-border-sm text-primary mb-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <h6 className="text-muted mb-2">Active Patients</h6>
                        </div>
                      ) : (
                        <>
                          <h6 className="text-muted mb-2">Active Patients</h6>
                          <h3 className="fw-bold mb-0" style={{ color: "#48b575" }}>
                            {stats.activePatients}
                          </h3>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </>
        ) : null}
      </Container>

      {/* Footer */}
      <footer
        className="py-4 mt-5"
        style={{ backgroundColor: "#34495e", color: "#ecf0f1" }}
      >
        <div className="container text-center">
          <small style={{ color: "#95a5a6" }}>
            © 2026 DocLink Admin Panel. All rights reserved.
          </small>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;