import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { InputField } from '../ui/InputField.jsx';
import { useAuth } from '../../context/auth-context.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
};

/**
 * Account creation form for the shared auth card, so signing up never
 * leaves the page the customer is already browsing.
 */
export function SignUpForm({ idPrefix = 'sign-up', redirectTo, onSuccess }) {
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
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      await register(form);
      onSuccess?.();
      navigate(typeof redirectTo === 'string' && redirectTo ? redirectTo : '/profile', {
        replace: true,
      });
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <Alert>{error}</Alert>}

      <InputField
        id={`${idPrefix}-name`}
        name="name"
        type="text"
        label="Full name"
        placeholder="Your name"
        autoComplete="name"
        icon={UserRound}
        value={form.name}
        onChange={handleChange}
        error={fieldErrors.name}
        autoFocus
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          icon={Mail}
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          required
        />

        <InputField
          id={`${idPrefix}-phone`}
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
        id={`${idPrefix}-password`}
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
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />

      <InputField
        id={`${idPrefix}-password-confirm`}
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

      <Button
        type="submit"
        size="lg"
        className="group w-full"
        isLoading={isSubmitting}
      >
        {isSubmitting ? 'Creating account...' : 'Create my account'}
        {!isSubmitting && (
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        )}
      </Button>
    </form>
  );
}
