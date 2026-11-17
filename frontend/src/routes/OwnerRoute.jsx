import { Navigate } from 'react-router-dom';
import { PageLoader } from '../components/ui/PageLoader.jsx';
import { useAuth } from '../context/auth-context.js';
import { isOwner } from '../utils/roles.js';

export function OwnerRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader label="Checking your access" />;
  }

  if (!isOwner(user)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
