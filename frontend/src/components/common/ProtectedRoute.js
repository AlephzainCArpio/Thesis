import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles, element }) => {
  const { currentUser, loading } = useAuth();

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    console.log("No authenticated user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("Current user role:", currentUser?.role); // Safe check for currentUser
  console.log("Allowed roles:", allowedRoles);

  // Check if user has permission for this route
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    console.log("Role not allowed, redirecting");

    // Redirect to appropriate dashboard based on role
    if (currentUser?.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (currentUser?.role === 'PROVIDER') {
      return <Navigate to="/provider" replace />;
    } else {
      return <Navigate to="/user" replace />;
    }
  }

  // Clone the element and add Outlet for nested routes
  return React.cloneElement(element, {}, <Outlet />);
};

export default ProtectedRoute;
