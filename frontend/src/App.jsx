import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import "./App.css";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function isLoggedIn() {
  try {
    return Boolean(localStorage.getItem("token") && localStorage.getItem("user"));
  } catch {
    return false;
  }
}

// admin -> /dashboard, selain itu (masyarakat) -> /masyarakat
function homeFor(role) {
  return role === "admin" ? "/dashboard" : "/masyarakat";
}

function ProtectedRoute({ children, allow }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  const role = getUser()?.role;
  const isAdmin = role === "admin";
  const allowed = allow === "admin" ? isAdmin : !isAdmin;

  return allowed ? children : <Navigate to={homeFor(role)} replace />;
}

function PublicRoute({ children }) {
  if (!isLoggedIn()) return children;
  return <Navigate to={homeFor(getUser()?.role)} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allow="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/masyarakat"
          element={
            <ProtectedRoute allow="masyarakat">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;