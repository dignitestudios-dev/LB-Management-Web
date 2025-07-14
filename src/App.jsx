import { Navigate, Outlet, Route, Routes } from "react-router";
import "./App.css";
import LoginPage from "./pages/authentication/Login";
import { AppRoutes } from "./routes/app/AppRoutes";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import ForgetPassword from "./pages/authentication/ForgetPassword";
import VerifyOtp from "./pages/authentication/VerifyOtp";
import ResetPassword from "./pages/authentication/PasswordUpdate";
import { baseUrl } from "./axios";
function App() {
  // Protected route wrapper

  const ProtectedRoute = () => {
    const token = Cookies.get("token");
    if (token === null) return null; // Optional: or show a loader
    return token ? <Outlet /> : <Navigate to="/auth/login" />;
  };

 

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={Cookies.get("token") ? "app/dashboard" : "/auth/login"}
          />
        }
      />

      {/* Protected App Routes */}
      <Route path="app" element={<ProtectedRoute />}>
        {AppRoutes?.map((Link, i) => (
          <Route path={Link.url} key={i} element={Link.page} />
        ))}
      </Route>

      {/* Public Auth Routes */}
      <Route path="auth">
        <Route path="login" element={<LoginPage />} />
        <Route path="forget-password" element={<ForgetPassword />} />
        <Route path="verify-otp" element={<VerifyOtp />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>
    </Routes>
  );
}

export default App;
