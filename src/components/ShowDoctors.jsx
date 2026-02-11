import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ShowDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
     console.log("BASE_URL =", import.meta.env.VITE_API_BASE_URL);
      console.log("yo")
      console.log(import.meta.env.VITE_API_BASE_URL)

      const response = await axios.get(`${BASE_URL}/doctor/findAllDoctors`);
      console.log("yooo")
      console.log("API Response:", response.data);
      
      setDoctors(response.data);
      
      // Extract unique specializations and locations
      const uniqueSpecialities = [...new Set(response.data.map(doc => doc.speciality))];
      const uniqueLocations = [...new Set(response.data.map(doc => doc.location))];
      
      setSpecializations(uniqueSpecialities);
      setLocations(uniqueLocations);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleBookAppointment = (doctor) => {
    localStorage.setItem('selectedDoctorForBooking', JSON.stringify(doctor));
    navigate("/login");
  };

  const handleSpecialityFilter = (e) => {
    setSelectedSpeciality(e.target.value);
  };

  const handleLocationFilter = (e) => {
    setSelectedLocation(e.target.value);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const time = timeString.substring(0, 5); // Extract HH:MM
    return time;
  };

  // Filter doctors based on selections
  const filteredDoctors = doctors.filter(doctor => {
    if (selectedSpeciality && doctor.speciality !== selectedSpeciality) return false;
    if (selectedLocation && doctor.location !== selectedLocation) return false;
    return true;
  });

  return (
    <>
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

      <div className="container py-5" style={{ marginTop: "70px" }}>
        <h2 className="mb-4">Doctors List</h2>
        
        {/* Filter Section */}
        <div className="row mb-4">
          <div className="col-md-4">
            <label className="form-label">Specialization:</label>
            <select
              className="form-select"
              value={selectedSpeciality}
              onChange={handleSpecialityFilter}
            >
              <option value="">All</option>
              {specializations.map((spec, index) => (
                <option key={index} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Location:</label>
            <select
              className="form-select"
              value={selectedLocation}
              onChange={handleLocationFilter}
            >
              <option value="">All</option>
              {locations.map((loc, index) => (
                <option key={index} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedSpeciality("");
                setSelectedLocation("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="row g-4">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.doctorId} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-1">{doctor.doctorName}</h5>
                  <p className="text-muted mb-2">{doctor.speciality}</p>

                  <p className="mb-1">
                    <strong>Email:</strong> {doctor.email}
                  </p>
                  <p className="mb-1">
                    <strong>Location:</strong> {doctor.location}
                  </p>
                  <p className="mb-1">
                    <strong>Experience:</strong> {doctor.experience} years
                  </p>
                  <p className="mb-1">
                    <strong>Fee:</strong> ₹{doctor.fees}
                  </p>
                  <p className="mb-3">
                    <strong>Timing:</strong> {formatTime(doctor.startTime)} - {formatTime(doctor.endTime)}
                  </p>
                </div>
                <div className="card-footer bg-white border-0 pt-0">
                  <button
                    className="btn text-black  w-100 " style={{ backgroundColor: "#48b575" }}
                    onClick={() => handleBookAppointment(doctor)}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ShowDoctors;