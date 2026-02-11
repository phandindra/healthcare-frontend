// src/components/AddHoliday.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DoctorNavbar from "./DoctorNavbar";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddHoliday = () => {
  const [holidayData, setHolidayData] = useState({
    holidayDate: "",
    reason: ""
  });
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState({
    doctor: true,
    submit: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Get JWT token from session storage
  const getToken = () => {
    return sessionStorage.getItem("jwtToken");
  };

  // Fetch doctor information to get doctorId
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
      return response.data.doctorId;
    } catch (err) {
      console.error("Error fetching doctor info:", err);
      setError("Failed to load doctor information");
      return null;
    }
  };

  // Load doctor info on component mount
  useEffect(() => {
    const loadDoctorInfo = async () => {
      setLoading(prev => ({ ...prev, doctor: true }));
      try {
        await fetchDoctorInfo();
      } catch (err) {
        console.error("Error loading doctor info:", err);
      } finally {
        setLoading(prev => ({ ...prev, doctor: false }));
      }
    };

    loadDoctorInfo();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHolidayData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!holidayData.holidayDate) {
      alert("Please select a holiday date");
      return;
    }

    if (!holidayData.reason.trim()) {
      alert("Please enter a reason for the holiday");
      return;
    }

    setLoading(prev => ({ ...prev, submit: true }));
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      if (!doctorInfo || !doctorInfo.doctorId) {
        throw new Error("Doctor information not available");
      }

      const response = await axios.post(
        `${BASE_URL}/doctor/holiday/${doctorInfo.doctorId}`,
        holidayData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            accept: "*/*",
          },
        }
      );

      console.log("Holiday added successfully:", response.data);
      setSuccess(true);
      
      // Show success message for 2 seconds then navigate
      setTimeout(() => {
        navigate("/doctor");
      }, 2000);

    } catch (err) {
      console.error("Error adding holiday:", err);
      let errorMessage = "Failed to add holiday. Please try again.";
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = "Invalid data. Please check your input.";
        } else if (err.response.status === 401) {
          errorMessage = "Unauthorized. Please login again.";
          navigate("/login");
        } else if (err.response.status === 403) {
          errorMessage = "You don't have permission to add holidays.";
        } else if (err.response.status === 409) {
          errorMessage = "Holiday already exists for this date.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Handle cancel/back button
  const handleCancel = () => {
    navigate("/doctor");
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (loading.doctor) {
    return (
      <div className="min-vh-100 bg-light">
        <DoctorNavbar />
        <div style={{ paddingTop: "80px" }}></div>
        <div className="container py-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <DoctorNavbar />
      <div style={{ paddingTop: "80px" }}></div>

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h3 className="fw-bold" style={{ color: "#2c3e50" }}>
                    Add Holiday
                  </h3>
                </div>

                {success ? (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
                    </div>
                    <h4 className="text-success mb-3">Holiday Added Successfully!</h4>
                    <p className="text-muted">Redirecting to dashboard...</p>
                  </div>
                ) : (
                  <>
                    {/* Error Message */}
                    {error && (
                      <div className="alert alert-danger mb-4">
                        {error}
                      </div>
                    )}

                    {/* Holiday Form */}
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label htmlFor="holidayDate" className="form-label fw-semibold">
                          Holiday Date *
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="holidayDate"
                          name="holidayDate"
                          value={holidayData.holidayDate}
                          onChange={handleInputChange}
                          min={getTodayDate()}
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="reason" className="form-label fw-semibold">
                          Reason for Holiday *
                        </label>
                        <textarea
                          className="form-control"
                          id="reason"
                          name="reason"
                          rows="3"
                          value={holidayData.reason}
                          onChange={handleInputChange}
                          placeholder="Enter reason for taking holiday..."
                          required
                        ></textarea>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex justify-content-between mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleCancel}
                          disabled={loading.submit}
                        >
                          Back to Dashboard
                        </button>
                        
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading.submit}
                        >
                          {loading.submit ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Adding...
                            </>
                          ) : (
                            "Add Holiday"
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHoliday;