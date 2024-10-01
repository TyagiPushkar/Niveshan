// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));

  // Check if user is authenticated
  const isAuthenticated = userDetails && userDetails.EmpId && userDetails.Role;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
