import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
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
    return Boolean(
      localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("user")
    );
  } catch {
    return false;
  }
}

function homeFor(role) {
  return role === "admin" ? "/dashboard" : "/user";
}

// role: "admin" atau "user" (halaman ini hanya untuk role tersebut)
function ProtectedRoute({ children, role }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  const userRole = getUser()?.role || "user";
  if (role && userRole !== role) {
    return <Navigate to={homeFor(userRole)} replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  if (!isLoggedIn()) return children;
  return <Navigate to={homeFor(getUser()?.role)} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
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