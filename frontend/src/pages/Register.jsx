import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { InputField } from '../components/ui/InputField.jsx';
import { useAuth } from '../context/auth-context.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getErrorMessage } from '../utils/getErrorMessage.js';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
};

export default function Register() {
  useDocumentTitle('Create Account');

  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await register(form);
      navigate('/profile', { replace: true });
    } catch (requestError) {
      const details = requestError.response?.data?.errors;
      if (details?.length) {
        setFieldErrors(
          Object.fromEntries(details.map((detail) => [detail.field, detail.message])),
        );
      }
      setError(getErrorMessage(requestError, 'We could not create your account.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Join the ritual"
      title="Create your account."
      subtitle="A little more ease, a little more glow. Start by telling us who you are."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-forest underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <Alert>{error}</Alert>}

        <InputField
          id="register-name"
          name="name"
          type="text"
          label="Full name"
          placeholder="Your name"
          autoComplete="name"
          icon={UserRound}
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            id="register-email"
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
            id="register-phone"
            name="phone"
            type="tel"
            label="Phone number"
            placeholder="+250 78..."
            autoComplete="tel"
            icon={Phone}
            value={form.phone}
            onChange={handleChange}
            error={fieldErrors.phone}
            hint="Optional"
          />
        </div>

        <InputField
          id="register-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          icon={Lock}
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          hint="8+ characters with uppercase, lowercase, and a number"
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

        <InputField
          id="register-password-confirm"
          name="passwordConfirm"
          type={showPassword ? 'text' : 'password'}
          label="Confirm password"
          placeholder="Enter it once more"
          autoComplete="new-password"
          icon={Lock}
          value={form.passwordConfirm}
          onChange={handleChange}
          error={fieldErrors.passwordConfirm}
          required
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create my account'}
        </Button>
      </form>
    </AuthShell>
  );
}
