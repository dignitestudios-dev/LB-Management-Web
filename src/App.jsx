import { Navigate, Outlet, Route, Routes } from "react-router";
import "./App.css";
import LoginPage from "./pages/authentication/Login";
import { AppRoutes } from "./routes/app/AppRoutes";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");
    setIsAuthenticated(!!token); // shorthand for setting true/false
  }, []);

  // Protected route wrapper
  const ProtectedRoute = () => {
    if (isAuthenticated === null) return null; // Optional: or show a loader
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" />;
  };

  return (
    <Routes>
      {/* Redirect /app/ to dashboard or login */}
      <Route
        path="app"
        element={
          isAuthenticated === null ? null : (
            <Navigate to={isAuthenticated ? "app/dashboard" : "/auth/login"} />
          )
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
      </Route>
    </Routes>
  );
}

export default App;
