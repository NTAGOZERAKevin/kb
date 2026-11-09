import { Navigate, useLocation } from 'react-router-dom';
import { PageLoader } from '../components/ui/PageLoader.jsx';
import { useAuth } from '../context/auth-context.js';

export function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader label="Preparing your dashboard" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
