import { Navigate, useLocation } from 'react-router-dom';
import { PageLoader } from '../components/ui/PageLoader.jsx';
import { useAuth } from '../context/auth-context.js';

export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
