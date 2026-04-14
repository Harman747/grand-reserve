import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/SupabaseAuthContext";
import LoginPage           from "./pages/AuthPortal";
import CustomerHome        from "./pages/CustomerHub";
import RoomBooking         from "./pages/RoomBooking";
import TableBooking        from "./pages/TableBooking";
import ManagementDashboard from "./pages/ManagementDashboard";
import "./styles/global.css";

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)   return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "MANAGEMENT" ? "/management" : "/home"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<RootRedirect />} />
          <Route path="/login"     element={<LoginPage />} />

          <Route path="/home" element={
            <PrivateRoute role="CUSTOMER"><CustomerHome /></PrivateRoute>
          } />
          <Route path="/book-room" element={
            <PrivateRoute role="CUSTOMER"><RoomBooking /></PrivateRoute>
          } />
          <Route path="/book-table" element={
            <PrivateRoute role="CUSTOMER"><TableBooking /></PrivateRoute>
          } />
          <Route path="/management" element={
            <PrivateRoute role="MANAGEMENT"><ManagementDashboard /></PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
