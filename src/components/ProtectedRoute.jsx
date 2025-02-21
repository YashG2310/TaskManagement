import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = sessionStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
