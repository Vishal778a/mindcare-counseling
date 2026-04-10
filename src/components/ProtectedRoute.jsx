import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isAdmin, isPatient, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/patient/dashboard" replace />;
  }

  if (requiredRole === 'patient' && !isPatient) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
