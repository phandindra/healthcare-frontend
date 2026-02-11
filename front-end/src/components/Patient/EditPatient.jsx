import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PatientNavbar from "./PatientNavbar";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function EditPatient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    gender: "MALE",
    bloodGroup: "A_POSITIVE",
    familyHistory: "",
    profileImage: "" // Keep this field for API compatibility
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // AXIOS CONFIGURATION
  const API_BASE_URL = `${BASE_URL}`;

  // Get JWT token and patient ID from session storage
  const getToken = () => sessionStorage.getItem("jwtToken");
  const getPatientId = () => {
    return sessionStorage.getItem("patientId") || localStorage.getItem("patientId");
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

  // Fetch patient data for logged-in user
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    const userRole = sessionStorage.getItem("userRole");
    const token = getToken();

    if (!isAuthenticated || userRole !== "ROLE_PATIENT" || !token) {
      alert("Please login as patient to access this page");
      navigate("/login");
      return;
    }

    fetchPatientData();
  }, [navigate]);

  // Fetch current patient data
  const fetchPatientData = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const api = getApi();
      
      // Fetch patient data
      const response = await api.get("/patient/byUser");
      const patient = response.data;

      console.log("Fetched patient data:", patient);

      // Populate form with fetched data
      setFormData({
        patientName: patient.patientName || "",
        email: patient.email || "",
        gender: patient.gender || "MALE",
        bloodGroup: patient.bloodGroup || "A_POSITIVE",
        familyHistory: patient.familyHistory || "",
        profileImage: patient.profileImage || ""
      });

      // Store patient ID in session storage
      if (patient.patientId) {
        sessionStorage.setItem("patientId", patient.patientId);
        localStorage.setItem("patientId", patient.patientId);
        console.log("Stored patientId:", patient.patientId);
      }

    } catch (err) {
      console.error("Error fetching patient data:", err);
      
      if (err.response?.status === 401) {
        setMessage({
          type: "danger",
          text: "Session expired. Please login again.",
        });
        setTimeout(() => {
          sessionStorage.clear();
          localStorage.clear();
          navigate("/login");
        }, 2000);
      } else {
        setMessage({
          type: "danger",
          text: err.response?.data?.message || "Failed to load patient data. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (message.text) setMessage({ type: "", text: "" });
  };

  // Update patient profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const api = getApi();
      const patientId = getPatientId();
      
      if (!patientId) {
        setMessage({
          type: "danger",
          text: "Patient ID not found. Please login again.",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare update data according to API requirements
      const updateData = {
        patientName: formData.patientName,
        email: formData.email,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        familyHistory: formData.familyHistory,
        profileImage: formData.profileImage || "" // Send empty string if no image
      };

      console.log("Updating patient with ID:", patientId);
      console.log("Update data:", updateData);

      // Send PUT request to update profile
      const response = await api.put(`/patient/edit-profile/${patientId}`, updateData);

      console.log("Update response:", response.data);

      setMessage({ 
        type: "success", 
        text: response.data?.message || "Profile updated successfully!" 
      });
      
      // Navigate back to dashboard after successful update
      setTimeout(() => {
        navigate("/patient");
      }, 1500);
      
    } catch (err) {
      console.error("Error updating patient profile:", err);
      
      if (err.response?.status === 401) {
        setMessage({
          type: "danger",
          text: "Session expired. Please login again.",
        });
        setTimeout(() => {
          sessionStorage.clear();
          localStorage.clear();
          navigate("/login");
        }, 2000);
      } else if (err.response?.status === 400) {
        setMessage({
          type: "warning",
          text: err.response.data?.message || "Please check your input data.",
        });
      } else if (err.response?.status === 404) {
        setMessage({
          type: "danger",
          text: "Patient not found. Please login again.",
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage({
          type: "danger",
          text: err.response?.data?.message || "Failed to update profile. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    fetchPatientData();
    setMessage({ type: "", text: "" });
  };

  const formatBloodGroup = (bg) => {
    if (!bg) return "Not Specified";
    // Convert A_POSITIVE to A+, B_NEGATIVE to B-, etc.
    return bg
      .replace("_POSITIVE", "+")
      .replace("_NEGATIVE", "-")
      .replace("_", " ");
  };

  const parseBloodGroup = (displayBg) => {
    const map = {
      "A+": "A_POSITIVE",
      "A-": "A_NEGATIVE",
      "B+": "B_POSITIVE",
      "B-": "B_NEGATIVE",
      "O+": "O_POSITIVE",
      "O-": "O_NEGATIVE",
      "AB+": "AB_POSITIVE",
      "AB-": "AB_NEGATIVE",
    };
    return map[displayBg] || formData.bloodGroup;
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <PatientNavbar />
        <div style={{ paddingTop: "80px" }}></div>
        <div className="container py-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <PatientNavbar />
      <div style={{ paddingTop: "80px" }}></div>

      <div className="container py-4">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow border-0">
              <div className="card-header bg-white py-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h4 className="mb-0 text-success ">
                      <i className="bi bi-person-gear me-2"></i>
                      Edit Profile
                    </h4>
                    <p className="text-muted mb-0">Update your personal information</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    onClick={() => navigate("/patient")}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Dashboard
                  </button>
                </div>
              </div>

              {message.text && (
                <div className="m-4">
                  <div
                    className={`alert alert-${message.type} alert-dismissible fade show mb-0`}
                    role="alert"
                  >
                    <div className="d-flex align-items-center">
                      <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
                      <span className="flex-grow-1">{message.text}</span>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage({ type: "", text: "" })}
                        aria-label="Close"
                      ></button>
                    </div>
                  </div>
                </div>
              )}

              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Full Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="patientName"
                        value={formData.patientName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Email Address</label>
                      <input
                        type="email"
                        className="form-control form-control-lg bg-light"
                        value={formData.email}
                        disabled
                        readOnly
                      />
                      <small className="text-muted">Email cannot be modified</small>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Gender <span className="text-danger">*</span></label>
                      <select
                        className="form-select form-select-lg"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Blood Group</label>
                      <select
                        className="form-select form-select-lg"
                        name="bloodGroup"
                        value={formatBloodGroup(formData.bloodGroup)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bloodGroup: parseBloodGroup(e.target.value),
                          })
                        }
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                      <div className="mt-1">
                        <small className="text-primary">
                          <i className="bi bi-info-circle me-1"></i>
                          Current: <strong>{formatBloodGroup(formData.bloodGroup)}</strong>
                        </small>
                      </div>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">Family Medical History</label>
                      <textarea
                        className="form-control"
                        name="familyHistory"
                        value={formData.familyHistory || ""}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Enter any relevant family medical history (diabetes, heart conditions, etc.)"
                      />
                     
                    </div>
                  </div>

                  <div className="d-flex justify-content-between pt-4 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      <i className="bi bi-arrow-counterclockwise me-2"></i>
                      Reset Changes
                    </button>
                    <button
                      type="submit"
                      className="btn bg-info px-5"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Update Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPatient;