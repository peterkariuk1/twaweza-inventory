import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowed }) => {
  const { user, role, loading } = useAuth();

  if (loading) return null; // or spinner

  // Not logged in → go to login page
  if (!user) return <Navigate to="/auth" />;

  // Role not allowed → deny
  if (allowed && !allowed.includes(role.toLowerCase())) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;
