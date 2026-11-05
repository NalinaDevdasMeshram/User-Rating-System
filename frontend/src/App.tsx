import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Stores from "./pages/stores/Stores";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import MyRatings from "./pages/stores/MyRatings";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === "STORE_OWNER") {
    return <Navigate to="/owner" replace />;
  }

  return <Navigate to="/stores" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/stores" element={<Stores />} />
          <Route path="/my-ratings" element={<MyRatings />} />
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Store owner only */}
        <Route element={<ProtectedRoute allowedRoles={["STORE_OWNER"]} />}>
          <Route path="/owner" element={<OwnerDashboard />} />
        </Route>

        <Route path="/" element={<HomeRedirect />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
