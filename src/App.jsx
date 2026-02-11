import Login from "./components/Login";
import LandingPage from "./components/LandingPage";
import { Route, Routes } from "react-router";
import ShowDoctors from "./components/ShowDoctors";
import Registration from "./components/Registration";
import AdminDashboard from "./components/Admin/AdminDashboard";
import DoctorList from "./components/Admin/DoctorList";
import PatientList from "./components/Admin/PatientList";
import AddDoctor from "./components/Admin/AddDoctor";
import EditPatient from "./components/Patient/EditPatient";
import Feedback from "react-bootstrap/esm/Feedback";
import FeedbackPage from "./components/Patient/FeedbackPage";
import DoctorEditProfile from "./components/Doctor/DoctorEditProfile";
import PatientDashboard from "./components/Patient/PatientDashboard";
import DoctorDashboard from "./components/Doctor/DoctorDashboard";
import EditDoctor from "./components/Admin/EditDoctor";
import Appointments from "./components/Admin/Appointments ";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorPage from "./components/ErrorPage";
import AddHoliday from "./components/Doctor/AddHoliday";

function App() {
  return (
    <>
      <Routes>
        <Route index element=<LandingPage /> />
        <Route path="/login" element=<Login /> />
        <Route path="/doctors" element=<ShowDoctors /> />
        <Route path="/signup" element=<Registration /> />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctorList"
          element={
            <ProtectedRoute requiredRole="admin">
              <DoctorList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patientList"
          element={
            <ProtectedRoute requiredRole="admin">
              <PatientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addDoctor"
          element={
            <ProtectedRoute requiredRole="admin">
              <AddDoctor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/editDoctor/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <EditDoctor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute requiredRole="admin">
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient"
          element={
            <ProtectedRoute requiredRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/EditPatient"
          element={
            <ProtectedRoute requiredRole="patient">
              <EditPatient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/FeedbackPage"
          element={
            <ProtectedRoute requiredRole="patient">
              <FeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/doctorEdit"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorEditProfile />
            </ProtectedRoute>
          }
        />
        
          <Route
            path="/doctor/holiday"
            element={
              <ProtectedRoute requiredRole="doctor">
                <AddHoliday />
              </ProtectedRoute>
            }
          />

        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

export default App;
