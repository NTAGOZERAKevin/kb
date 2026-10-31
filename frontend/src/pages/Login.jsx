import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { InputField } from '../components/ui/InputField.jsx';
import { useAuth } from '../context/auth-context.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

export default function Login() {
  useDocumentTitle('Sign In');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/profile';

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      const details = requestError.response?.data?.errors;
      if (details?.length) {
        setFieldErrors(
          Object.fromEntries(details.map((detail) => [detail.field, detail.message])),
        );
      }
      setError(getErrorMessage(requestError, 'We could not sign you in.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Return to your ritual."
      subtitle="Sign in to see your profile and keep your beauty essentials close."
      footer={
        <>
          New to Beauty Oil Market?{' '}
          <Link to="/register" className="font-bold text-forest underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <Alert>{error}</Alert>}

        <InputField
          id="login-email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          icon={Mail}
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          required
        />

        <InputField
          id="login-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          icon={Lock}
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="grid size-9 place-items-center rounded-full text-forest/40 transition hover:bg-forest/5 hover:text-forest"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  );
}
