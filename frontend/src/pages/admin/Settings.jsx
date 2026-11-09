import { useState } from 'react';
import { Check, Languages, Lock, Moon, Palette, ShieldCheck, Sun, UserRound } from 'lucide-react';
import { Alert } from '../../components/ui/Alert.jsx';
import { InputField } from '../../components/ui/InputField.jsx';
import { Reveal } from '../../components/ui/Reveal.jsx';
import { useAuth } from '../../context/auth-context.js';
import { useLanguage } from '../../context/language-context.js';
import { useTheme } from '../../context/theme-context.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { LANGUAGES } from '../../i18n/translations.js';
import { authService } from '../../services/auth.service.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
};

export default function AdminSettings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  useDocumentTitle(t('settings.title'));

  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setNotice('');

    try {
      await authService.changePassword(passwordForm);
      setPasswordForm(emptyPasswordForm);
      setNotice(t('settings.passwordUpdated'));
    } catch (requestError) {
      setError(getErrorMessage(requestError, t('settings.passwordError')));
    } finally {
      setIsSaving(false);
    }
  }

  const themeOptions = [
    { value: 'light', label: t('settings.light'), icon: Sun },
    { value: 'dark', label: t('settings.dark'), icon: Moon },
  ];

  return (
    <div className="space-y-6">
      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">
          {t('settings.eyebrow')}
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium text-forest">
          {t('settings.title')}
        </h1>
        <p className="mt-2 text-sm text-ink/50">{t('settings.subtitle')}</p>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal className="rounded-[1.75rem] border border-forest/10 bg-card p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gold/15 text-clay">
              <Palette className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-medium text-forest">
                {t('settings.appearance')}
              </h2>
              <p className="text-xs text-ink/45">{t('settings.appearanceHint')}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {themeOptions.map(({ value, label, icon: Icon }) => {
              const isActive = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                    isActive
                      ? 'border-gold bg-gold/10 text-forest'
                      : 'border-forest/15 bg-card text-ink/55 hover:border-forest/35 hover:text-forest'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </span>
                  {isActive && <Check className="size-4 text-clay" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal className="rounded-[1.75rem] border border-forest/10 bg-card p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gold/15 text-clay">
              <Languages className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-medium text-forest">
                {t('settings.language')}
              </h2>
              <p className="text-xs text-ink/45">{t('settings.languageHint')}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {LANGUAGES.map((option) => {
              const isActive = language === option.code;
              const translatedLabel = t(`settings.${option.code === 'en' ? 'english' : option.code === 'fr' ? 'french' : 'kiswahili'}`);

              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setLanguage(option.code)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition ${
                    isActive
                      ? 'border-gold bg-gold/10 text-forest'
                      : 'border-forest/15 bg-card text-ink/55 hover:border-forest/35 hover:text-forest'
                  }`}
                  aria-pressed={isActive}
                >
                  <span>
                    {option.nativeLabel}
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
                      {translatedLabel}
                    </span>
                  </span>
                  {isActive && <Check className="size-4 text-clay" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </Reveal>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal className="rounded-[1.75rem] border border-forest/10 bg-card p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gold/15 text-clay">
              <Lock className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-medium text-forest">
                {t('settings.security')}
              </h2>
              <p className="text-xs text-ink/45">{t('settings.securityHint')}</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
            {notice && <Alert type="success">{notice}</Alert>}
            {error && <Alert>{error}</Alert>}

            <InputField
              id="current-password"
              name="currentPassword"
              type="password"
              label={t('settings.currentPassword')}
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="new-password"
                name="newPassword"
                type="password"
                label={t('settings.newPassword')}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                required
              />
              <InputField
                id="confirm-password"
                name="newPasswordConfirm"
                type="password"
                label={t('settings.confirmPassword')}
                value={passwordForm.newPasswordConfirm}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ivory transition hover:bg-forest-light disabled:opacity-60"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              {isSaving ? t('settings.updating') : t('settings.updatePassword')}
            </button>
          </form>
        </Reveal>

        <Reveal className="rounded-[1.75rem] border border-forest/10 bg-card p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gold/15 text-clay">
              <UserRound className="size-4" aria-hidden="true" />
            </span>
            <h2 className="font-display text-2xl font-medium text-forest">
              {t('settings.account')}
            </h2>
          </div>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
                {t('settings.name')}
              </dt>
              <dd className="mt-1 font-semibold text-forest">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
                {t('settings.email')}
              </dt>
              <dd className="mt-1 break-all font-semibold text-forest">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
                {t('settings.role')}
              </dt>
              <dd className="mt-1 font-semibold capitalize text-forest">
                {t('nav.administrator')}
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </div>
  );
}
