// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // ya aapka check

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
