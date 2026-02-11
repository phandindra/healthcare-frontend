import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Form,
  InputGroup,
  Alert,
  Spinner,
  Row,
  Col
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${BASE_URL}/patient/AllPatients`,
      );

      console.log("Patients API Response:", response.data);

      // Transform the data based on actual response structure
      const formattedPatients = Array.isArray(response.data)
        ? response.data.map((p) => ({
            id: p.patientId || p.id,
            name: p.patientName || p.name,
            email: p.email,
            gender:
              p.gender === "MALE"
                ? "Male"
                : p.gender === "FEMALE"
                  ? "Female"
                  : p.gender || "N/A",
            bloodGroup: p.bloodGroup || "N/A",
            familyHistory:
              p.familyHistory ||
              p.medicalHistory ||
              "No family history recorded",
            phone: p.phone || p.contactNumber || "N/A",
            age: p.age || "N/A",
          }))
        : [];

      setPatients(formattedPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError(error.response?.data?.message || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name?.toLowerCase().includes(search.toLowerCase()) ||
      patient.email?.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      {/* Navbar */}
      <AdminNavbar />

      <div style={{ paddingTop: "80px" }}></div>

      <div className="container py-4">
        {/* Page Header */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                Patient Management
              </h2>
              <p className="text-muted mb-0">
                View all registered patients
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
            </div>
          </Alert>
        )}

        {/* Stats and Search Card */}
        <Row className="mb-4">
          <Col md={6} lg={3}>
            <Card
              className="shadow-sm border-0 h-100"
              style={{ borderRadius: "16px" }}
            >
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>
                  Total Patients
                </h5>
                <h3 className="mb-0" style={{ color: "#48b575" }}>
                  {loading ? <Spinner size="sm" /> : patients.length}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={12} lg={9}>
            <Card
              className="shadow-sm border-0 h-100"
              style={{ borderRadius: "16px" }}
            >
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>
                  Search Patients
                </h5>
                <InputGroup>
                  <InputGroup.Text
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    Search
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by name, email, or phone number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearch("")}
                    >
                      Clear
                    </button>
                  )}
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Patients Table */}
        <Card className="shadow-sm border-0" style={{ borderRadius: "16px" }}>
          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
              Patients List
            </h5>
            <small className="text-muted">
              {filteredPatients.length} of {patients.length} patients shown
            </small>
          </Card.Header>
          <Card.Body className="p-4">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border"
                  style={{ color: "#48b575" }}
                ></div>
                <p className="mt-3 text-muted">Loading patients...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-5">
                <h5 className="text-muted mb-2">No Patients Found</h5>
                <p className="text-muted">
                  There are no patients registered yet.
                </p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-5">
                <p className="mt-3 text-muted">
                  No patients found matching "{search}"
                </p>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setSearch("")}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Patient Name</th>
                      <th>Email</th>
                      <th>Gender</th>
                      <th>Blood Group</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient, index) => (
                      <tr key={patient.id || index}>
                        <td>
                          <div className="fw-semibold">#{patient.id}</div>
                        </td>
                        <td>
                          <div className="fw-semibold">{patient.name}</div>
                        </td>
                        <td>
                          <div className="text-muted">{patient.email}</div>
                        </td>
                        <td>
                          <span
                            className={`badge ${patient.gender === "Male" ? "bg-primary" : patient.gender === "Female" ? "bg-secondary" : "bg-secondary"}`}
                          >
                            {patient.gender}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-danger">
                            {patient.bloodGroup}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default PatientList;