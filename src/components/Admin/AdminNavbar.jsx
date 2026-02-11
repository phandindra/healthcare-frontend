import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate("/admin");
  };

  const handleDoctorsClick = () => {
    navigate("/admin/doctorList");
  };

  const handlePatientsClick = () => {
    navigate("/admin/patientList");
  };

  const handleAddDoctorClick = () => {
    navigate("/admin/addDoctor");
  };

  const handleAllAppointmentClick = () => {
    navigate("/admin/appointments");
  };

  const handleLogout = () => {
    // Clear ALL storage items from both localStorage and sessionStorage
    const storageKeys = [
      'jwtToken', 'currentUser', 'isAuthenticated', 
      'userRole', 'adminToken', 'token', 'patientId', 'userId'
    ];
    
    storageKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear all localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Replace history entry with login page
    window.history.replaceState(null, "", "/login");
    
    // Navigate with replace to prevent going back
    navigate("/login", { replace: true });
    
    // Force reload to clear React state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark fixed-top shadow-sm"
      style={{ backgroundColor: "#48b575" }}
    >
      <div className="container">
        <button
          className="navbar-brand fw-bold fs-4 btn btn-link text-decoration-none p-0 border-0"
          onClick={handleDashboardClick}
          style={{ cursor: "pointer", color: "#ffffff" }}
        >
          DocLink Admin
        </button>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="adminNavbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <button
                className="nav-link btn btn-link text-decoration-none fw-medium"
                onClick={handleDashboardClick}
                style={{ color: "#ffffff" }}
              >
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link text-decoration-none fw-medium"
                onClick={handleDoctorsClick}
                style={{ color: "#ffffff" }}
              >
                Doctors
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link text-decoration-none fw-medium"
                onClick={handlePatientsClick}
                style={{ color: "#ffffff" }}
              >
                Patients
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link text-decoration-none fw-medium"
                onClick={handleAddDoctorClick}
                style={{ color: "#ffffff" }}
              >
                Add Doctor
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link text-decoration-none fw-medium"
                onClick={handleAllAppointmentClick}
                style={{ color: "#ffffff" }}
              >
               All Appointments
              </button>
            </li>
          </ul>

          <button
            className="btn btn-light rounded-pill px-4 ms-lg-2 fw-medium"
            onClick={handleLogout}
            style={{ color: "#48b575" }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;