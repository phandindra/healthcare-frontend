import { useState, useEffect } from "react";
import PatientNavbar from "./PatientNavbar";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FeedbackPage() {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch doctors from backend API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = `${BASE_URL}/doctor/findAllDoctors`;
        console.log("Fetching doctors from:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `HTTP error! status: ${response.status} - ${errorText}`,
          );
        }

        const data = await response.json();
        console.log("API response data:", data);

        // Map the API response to match expected format
        const formattedDoctors = Array.isArray(data) ? data : [];
        setDoctors(formattedDoctors);
      } catch (err) {
        console.error("Error fetching doctors:", err);

        if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError")
        ) {
          setError(
            "Network error: Unable to connect to the server. Please check if the backend is running.",
          );
        } else if (err.message.includes("CORS")) {
          setError(
            "CORS error: The server is blocking requests from this origin. Check server CORS configuration.",
          );
        } else {
          setError(`Failed to load doctors: ${err.message}`);
        }

        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctor) {
      alert("Please select a doctor");
      return;
    }

    try {
      // Find the selected doctor object
      const selectedDoc = doctors.find((doc) => {
        const docId = doc.doctorId || doc.id;
        return String(docId) === String(selectedDoctor);
      });

      const feedbackData = {
        doctorId: selectedDoctor,
        doctorName: selectedDoc
          ? selectedDoc.doctorName || selectedDoc.name
          : "Unknown",
        speciality: selectedDoc ? selectedDoc.speciality : "",
        rating: rating,
        comments: comments,
        submissionDate: new Date().toISOString(),
      };

      console.log("Feedback to be submitted:", feedbackData);

     

      alert("Feedback submitted successfully!");
      setRating(5);
      setComments("");
      setSelectedDoctor("");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <PatientNavbar />
      <div style={{ paddingTop: "80px" }}></div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="text-center mb-2 fw-semibold">
                  Doctor Feedback
                </h4>
                <p className="text-center text-muted mb-4">
                  Share your experience with a doctor
                </p>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading doctors...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <i
                      className="bi bi-exclamation-triangle text-warning"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <p className="mt-3 text-danger">{error}</p>
                    <p className="text-muted">
                      Please check your connection and try again.
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </button>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-4">
                    <i
                      className="bi bi-people text-muted"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <p className="mt-3 text-muted">
                      No doctors found in the system.
                    </p>
                    <p className="text-muted">
                      Please contact the administrator.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Doctor Selection */}
                    <div className="mb-4">
                      <label className="form-label fw-medium">
                        Select Doctor <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        required
                      >
                        <option value="">Choose a doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.doctorId} value={doctor.doctorId}>
                            {doctor.doctorName}
                          </option>
                        ))}
                      </select>
                      {selectedDoctor && (
                        <div className="mt-2 small text-muted">
                          <span className="fw-medium">Selected: </span>
                          {
                            doctors.find(
                              (d) =>
                                String(d.doctorId) === String(selectedDoctor),
                            )?.doctorName
                          }
                          {doctors.find(
                            (d) =>
                              String(d.doctorId) === String(selectedDoctor),
                          )?.speciality &&
                            ` (${doctors.find((d) => String(d.doctorId) === String(selectedDoctor))?.speciality})`}
                        </div>
                      )}
                      <small className="text-muted d-block mt-1">
                        Found {doctors.length} doctor(s) in the system
                      </small>
                    </div>

                    {/* Rating */}
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Rating <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        required
                      >
                        <option value="1">⭐ 1 - Poor</option>
                        <option value="2">⭐⭐ 2 - Fair</option>
                        <option value="3">⭐⭐⭐ 3 - Good</option>
                        <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                        <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                      </select>
                    </div>

                    {/* Comments */}
                    <div className="mb-4">
                      <label className="form-label fw-medium">
                        Comments (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Share your experience with this doctor..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                      />
                    </div>

                    {/* Submit */}
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">
                        Submit Feedback
                      </button>
                    </div>
                  </form>
                )}

                {/* Doctor List Summary */}
                {!loading && !error && doctors.length > 0 && (
                  <div className="mt-4 pt-4 border-top">
                    <h6 className="fw-medium mb-3">Available Doctors</h6>
                    <div className="small text-muted">
                      {doctors.slice(0, 5).map((doctor) => (
                        <div key={doctor.doctorId} className="mb-2">
                          <span className="fw-medium">{doctor.doctorName}</span>
                          {doctor.speciality && (
                            <span className="text-muted ms-2">
                              - {doctor.speciality}
                            </span>
                          )}
                          {doctor.location && (
                            <span className="text-muted ms-2">
                              ({doctor.location})
                            </span>
                          )}
                        </div>
                      ))}
                      {doctors.length > 5 && (
                        <div className="text-muted">
                          ... and {doctors.length - 5} more doctors
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
