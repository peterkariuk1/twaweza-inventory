import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowed }) => {
  const { user, role, loading } = useAuth();

  // Show nothing (or spinner) while loading auth state
  if (loading) return null;

  //If not logged in → go to login
  if (!user) return <Navigate to="/auth" replace />;

  // If role not allowed → go to Forbidden page
  if (allowed && !allowed.includes(role?.toLowerCase())) {
    return <Navigate to="/forbidden" replace />;
  }

  // Otherwise render the protected page
  return children;
};

export default ProtectedRoute;
