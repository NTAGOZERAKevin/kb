import { Navigate, useLocation } from 'react-router-dom';
import { PageLoader } from '../components/ui/PageLoader.jsx';
import { useAuth } from '../context/auth-context.js';
import { hasDashboardAccess } from '../utils/roles.js';

export function GuestRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (user) {
    const fallback = hasDashboardAccess(user) ? '/admin' : '/profile';
    return <Navigate to={location.state?.from?.pathname || fallback} replace />;
  }

  return children;
}
