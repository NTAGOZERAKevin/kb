import { useLocation } from 'react-router-dom';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { LoginForm } from '../components/auth/LoginForm.jsx';
import { useAuthModal } from '../context/auth-modal-context.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Login() {
  useDocumentTitle('Sign In');

  const location = useLocation();
  const { openSignup } = useAuthModal();

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your glow."
      subtitle="Pick up right where you left off — your cart, saved addresses and order history are waiting."
      footer={
        <>
          New to Sharon Glow Boutique?{' '}
          <button
            type="button"
            onClick={() => openSignup()}
            className="font-bold text-forest underline-offset-4 hover:underline"
          >
            Create an account
          </button>
        </>
      }
    >
      <LoginForm
        redirectTo={location.state?.from?.pathname}
        onSwitchToSignUp={() => openSignup()}
      />
    </AuthShell>
  );
}
