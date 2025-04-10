import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles, element }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on role
    if (currentUser.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.role === 'PROVIDER') {
      return <Navigate to="/provider" replace />;
    } else {
      return <Navigate to="/user" replace />;
    }
  }

  return React.cloneElement(element, {}, <Outlet />);
};

export default ProtectedRoute;