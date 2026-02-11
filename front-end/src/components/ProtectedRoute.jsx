import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  // ✅ FIX 1: Check BOTH localStorage AND sessionStorage (for compatibility)
  const isAuthenticatedLocal =
    localStorage.getItem("isAuthenticated") === "true";
  const isAuthenticatedSession =
    sessionStorage.getItem("isAuthenticated") === "true";
  const isAuthenticated = isAuthenticatedLocal || isAuthenticatedSession;

  // ✅ FIX 2: Get user data from both storage locations
  let currentUser = null;

  // Try sessionStorage first (from your Login.js)
  const sessionUser = sessionStorage.getItem("currentUser");
  if (sessionUser) {
    try {
      currentUser = JSON.parse(sessionUser);
    } catch (e) {
      console.error("Error parsing session user:", e);
    }
  }

  // If not in sessionStorage, try localStorage
  if (!currentUser) {
    const localUser = localStorage.getItem("currentUser");
    if (localUser) {
      try {
        currentUser = JSON.parse(localUser);
      } catch (e) {
        console.error("Error parsing local user:", e);
      }
    }
  }

  // ✅ FIX 3: Also get role directly from storage (your Login stores it separately)
  const userRole =
    sessionStorage.getItem("userRole") ||
    localStorage.getItem("userRole") ||
    (currentUser ? currentUser.role : null);

  // Debug logging (remove in production)
  console.log("ProtectedRoute Debug:", {
    isAuthenticated,
    hasSessionAuth: sessionStorage.getItem("isAuthenticated"),
    hasLocalAuth: localStorage.getItem("isAuthenticated"),
    userRole,
    currentUser,
    sessionUser,
    requiredRole,
  });

  // Not authenticated
  if (!isAuthenticated || !userRole) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check user role
  if (requiredRole) {
    // ✅ FIX 4: Match the role format from your Login response
    // Your backend returns: "ROLE_PATIENT", "ROLE_ADMIN", "ROLE_DOCTOR"
    // Convert requiredRole to match this format
    const requiredRoleFormatted = requiredRole.toUpperCase();
    const userRoleUpper = userRole.toUpperCase();

    // Check if user has the required role
    const hasRequiredRole =
      userRoleUpper.includes(requiredRoleFormatted) ||
      userRoleUpper === requiredRoleFormatted;

    if (!hasRequiredRole) {
      console.log(
        `Role mismatch. User has: ${userRole}, Required: ${requiredRoleFormatted}`,
      );

      // Redirect to appropriate dashboard based on actual role
      if (userRoleUpper.includes("ADMIN")) {
        return <Navigate to="/admin" replace />;
      } else if (userRoleUpper.includes("DOCTOR")) {
        return <Navigate to="/doctor" replace />;
      } else if (userRoleUpper.includes("PATIENT")) {
        return <Navigate to="/patient" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  // User is authenticated and has correct role
  console.log("Access granted to:", window.location.pathname);
  return children;
};

export default ProtectedRoute;
