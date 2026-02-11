import React, { useState, useEffect } from "react";
import { Table, Button, Card, Badge, Spinner, Alert, Container, Form } from "react-bootstrap";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // API Configuration with JWT Token
  const API_BASE_URL = `${BASE_URL}`;

  // Get JWT token from session storage
  const getToken = () => {
    return sessionStorage.getItem("jwtToken") || localStorage.getItem("jwtToken");
  };

  // Create authenticated axios instance
  const getApi = () => {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }
    return axios.create({
      baseURL: API_BASE_URL,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, statusFilter, appointments]);

  // Fetch appointments with JWT token
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = getApi();
      const response = await api.get("/Appointments/allAppointments");
      
      // Sort appointments by date (newest first)
      const sortedAppointments = response.data.sort((a, b) => {
        return new Date(b.appointmentDate) - new Date(a.appointmentDate);
      });
      
      setAppointments(sortedAppointments);
      setFilteredAppointments(sortedAppointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load appointments"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments
  const filterAppointments = () => {
    let filtered = [...appointments];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.patientName?.toLowerCase().includes(term) ||
        app.doctorName?.toLowerCase().includes(term) ||
        app.appointmentId?.toString().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  };

  

  const getStatusBadge = (status) => {
    switch (status) {
      case "BOOKED":
      case "CONFIRMED":
        return <Badge bg="primary">{status}</Badge>;
      case "COMPLETED":
        return <Badge bg="success">{status}</Badge>;
      case "CANCELLED":
        return <Badge bg="danger">{status}</Badge>;
      case "PENDING":
        return <Badge bg="warning" text="dark">{status}</Badge>;
      default:
        return <Badge bg="secondary">{status || "Pending"}</Badge>;
    }
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime) return "N/A";
    const start = startTime.substring(0, 5);
    if (!endTime) return start;
    const end = endTime.substring(0, 5);
    return `${start} - ${end}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <AdminNavbar />
      <div style={{ paddingTop: "80px" }}></div>

      <Container className="py-4">
        {/* Header */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="fw-bold mb-2">ALL Appointments </h2>
              <p className="text-muted mb-0">
                Manage all patient appointments in the system
              </p>
            </div>
           
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="danger"
            className="mb-4"
            onClose={() => setError(null)}
            dismissible
          >
            <div className="d-flex justify-content-between align-items-center">
              <span>{error}</span>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={fetchAppointments}
                className="ms-3"
              >
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Filters */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">Filters</h5>
              <div className="text-muted small">
                Showing {filteredAppointments.length} of {appointments.length} appointments
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by patient, doctor, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
              </div>
              
              <div className="col-md-4 mb-3">
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Status</option>
                    <option value="BOOKED">Booked</option>
                    
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    
                  </Form.Select>
                </Form.Group>
              </div>
              
              <div className="col-md-2 mb-3 d-flex align-items-end">
               
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Appointments Table */}
        <Card className="shadow-sm">
          <Card.Header className="bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">All Appointments</h5>
              <div className="d-flex gap-2">
                <Badge bg="primary">Booked: {
                  appointments.filter(a => a.status === "BOOKED" || a.status === "CONFIRMED").length
                }</Badge>
                <Badge bg="success">Completed: {
                  appointments.filter(a => a.status === "COMPLETED").length
                }</Badge>
                <Badge bg="danger">Cancelled: {
                  appointments.filter(a => a.status === "CANCELLED").length
                }</Badge>
              </div>
            </div>
          </Card.Header>
          
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-3">No appointments found</p>
                <Button variant="outline-primary" onClick={fetchAppointments}>
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      {/* <th className="text-center">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.appointmentId}>
                        <td className="fw-semibold">#{appointment.appointmentId}</td>
                        <td className="fw-semibold">{appointment.patientName || "N/A"}</td>
                        <td className="fw-semibold">{appointment.doctorName || "N/A"}</td>
                        <td>
                          <div className="fw-semibold">{formatDate(appointment.appointmentDate)}</div>
                        </td>
                        <td className="text-muted">
                          {formatTime(appointment.startTime, appointment.endTime)}
                        </td>
                        <td>{getStatusBadge(appointment.status)}</td>
                       
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Appointments;