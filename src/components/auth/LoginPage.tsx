import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Activity,
  UserRound,
  Phone,
  ArrowLeft,
  LoaderCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiLogin, apiPost, apiRegister, storeApiToken } from '../../data/api';

type AuthMode = 'login' | 'signup' | 'forgot' | 'sent' | 'reset' | 'complete' | 'success';
type SuccessKind = 'login' | 'signup' | 'demo';

const DEMO_ACCOUNT = { email: 'admin@demo.school', password: 'schoolDemoPass123' };

export const LoginPage: React.FC = () => {
  const { loginWithApiUser, setActiveTab } = useApp();
  const prefersReducedMotion = useReducedMotion();
  const [resetToken] = useState(() => new URLSearchParams(window.location.search).get('resetToken') ?? '');
  const [mode, setMode] = useState<AuthMode>(() => new URLSearchParams(window.location.search).has('resetToken') ? 'reset' : 'login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successKind, setSuccessKind] = useState<SuccessKind>('login');
  const [errorAnimationKey, setErrorAnimationKey] = useState(0);

  const finishAuthentication = (user: Parameters<typeof loginWithApiUser>[0], kind: SuccessKind) => {
    setSuccessKind(kind);
    setMode('success');
    window.setTimeout(() => {
      loginWithApiUser(user);
      if (kind === 'signup') setActiveTab('dashboard');
    }, prefersReducedMotion ? 100 : 620);
  };

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setAuthMessage(null);
    setFieldError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    setFieldError(null);

    if (mode !== 'reset' && !email.trim()) {
      setFieldError('Enter your email address.');
      return;
    }
    if (mode !== 'reset' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError('Enter a valid email address, such as name@school.edu.');
      return;
    }
    if ((mode === 'signup' || mode === 'reset') && password.length < 8) {
      setFieldError('Use a password with at least 8 characters.');
      return;
    }
    if ((mode === 'signup' || mode === 'reset') && password !== confirmPassword) {
      setFieldError('The passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const result = await apiLogin(email.trim(), password);
        storeApiToken(result.token, rememberMe);
        if (resetToken) {
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.delete('resetToken');
          window.history.replaceState(null, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
        }
        finishAuthentication(result.user, 'login');
      } else if (mode === 'signup') {
        if (fullName.trim().length < 2) {
          setFieldError('Enter your full name.');
          return;
        }
        const result = await apiRegister({
          name: fullName.trim(),
          email: email.trim(),
          password,
          ...(phoneNumber.trim() ? { phoneNumber: phoneNumber.trim() } : {}),
        });
        storeApiToken(result.token, rememberMe);
        finishAuthentication(result.user, 'signup');
      } else if (mode === 'forgot') {
        await apiPost('/auth/password-reset/request', { email: email.trim() });
        changeMode('sent');
      } else if (mode === 'reset') {
        if (!resetToken) {
          setAuthMessage('This reset link is missing or invalid. Request a new password reset link.');
          return;
        }
        await apiPost('/auth/password-reset/complete', { token: resetToken, password });
        changeMode('complete');
      }
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      setErrorAnimationKey((current) => current + 1);
      if (status) {
        setAuthMessage(status === 401
          ? 'The email or password is incorrect. Check your details and try again.'
          : (error as Error).message);
        return;
      }
      storeApiToken(null);
      setAuthMessage('We could not reach the authentication service. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setAuthMessage(null);
    setFieldError(null);
    try {
      const result = await apiLogin(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
      storeApiToken(result.token, rememberMe);
      finishAuthentication(result.user, 'demo');
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      setErrorAnimationKey((current) => current + 1);
      setAuthMessage(status === 401 ? 'The seeded demo account is unavailable.' : status ? (error as Error).message : 'We could not reach the authentication service. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : mode === 'success' ? (successKind === 'signup' ? 'Account created' : 'Welcome to Smart School') :
    mode === 'forgot' ? 'Reset your password' : mode === 'reset' ? 'Choose a new password' :
      mode === 'sent' ? 'Check your inbox' : 'Password updated';
  const subtitle = mode === 'login' ? 'Sign in to your school operations workspace.' : mode === 'success' ? (successKind === 'signup' ? 'Your secure account is ready. Taking you to your dashboard.' : 'Your secure school session is ready. Taking you to your dashboard.') :
    mode === 'signup' ? 'Set up secure access to your school workspace.' :
      mode === 'forgot' ? 'Enter your account email to verify registration.' :
        mode === 'reset' ? 'Create a new password for your account.' :
          mode === 'sent' ? 'A password reset link was sent to your registered email.' :
            'Your password has been changed successfully.';

  const passwordFields = (confirmLabel: string) => (
    <>
      <div>
        <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="auth-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="auth-input w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none"
            placeholder="At least 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {confirmLabel && (
        <div>
          <label htmlFor="auth-confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">{confirmLabel}</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="auth-confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="auth-input w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none"
              placeholder="Re-enter your password"
            />
          </div>
        </div>
      )}
    </>
  );

  const emailField = (
    <div>
      <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="auth-input w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none"
          placeholder="you@school.edu"
        />
      </div>
    </div>
  );

  return (
    <main className="auth-page flex min-h-screen items-center justify-center p-4 sm:p-7">
      <section className="auth-card-enter grid w-full max-w-5xl overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_28px_80px_-32px_rgba(18,40,67,0.35)] lg:min-h-[660px] lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative flex flex-col justify-between overflow-hidden bg-[#172c45] p-7 text-white sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0bd59] text-[#172c45]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide">SMART SCHOOL</p>
                <p className="mt-0.5 text-xs text-slate-300">Campus operations</p>
              </div>
            </div>
            <div className="mt-12 max-w-sm sm:mt-16">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#f0bd59]">
                <ShieldCheck className="h-4 w-4" /> Secure workspace
              </p>
              <h1 className="text-3xl font-semibold leading-tight sm:text-[2.5rem]">A safer campus starts with clear oversight.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-200/80">One workspace for facilities, safety reporting, and the people who keep your school running.</p>
            </div>
          </div>
          <div className="relative mt-10 max-w-sm rounded-xl border border-white/10 bg-[#102238]/80 p-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-200"><Activity className="h-4 w-4 text-[#82c5e8]" /> Campus status</span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#f0bd59]"><span className="h-1.5 w-1.5 rounded-full bg-[#f0bd59]" /> Operational</span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div><p className="text-[11px] text-slate-400">Classrooms</p><p className="mt-1 text-lg font-semibold">24</p></div>
              <div><p className="text-[11px] text-slate-400">Sensors</p><p className="mt-1 text-lg font-semibold">48</p></div>
              <div><p className="text-[11px] text-slate-400">Uptime</p><p className="mt-1 text-lg font-semibold">99.8%</p></div>
            </div>
          </div>
          <p className="relative mt-7 text-xs text-slate-400">Infrastructure &amp; Safety Monitoring System</p>
        </aside>

        <div className="flex flex-col justify-center px-6 py-8 sm:px-12 sm:py-12 lg:px-14">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-5 text-slate-500">{subtitle}</p>
            </div>
            <button type="button" onClick={() => setActiveTab('landing')} className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">Back</button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -5 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut' }}
          >
            {mode === 'success' ? (
              <div className="py-8 text-center" role="status" aria-live="polite">
                <div className="relative mx-auto h-16 w-16">
                  {!prefersReducedMotion && [0, 1, 2, 3, 4, 5].map((particleIndex) => (
                    <motion.span
                      key={particleIndex}
                      className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-emerald-400"
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                      animate={{ opacity: [0, 1, 0], x: [0, (particleIndex - 2.5) * 17], y: [0, particleIndex % 2 ? -25 : 25], scale: [0.4, 1, 0.5] }}
                      transition={{ duration: 0.48, delay: 0.08, ease: 'easeOut' }}
                    />
                  ))}
                  <motion.div
                    initial={prefersReducedMotion ? false : { scale: 0.75, opacity: 0 }}
                    animate={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: [0.75, 1.08, 1], opacity: 1 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.34, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                  >
                    <CheckCircle2 className="h-12 w-12" strokeWidth={1.6} />
                  </motion.div>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {successKind === 'signup' ? '✓ Account Created' : successKind === 'demo' ? '✓ Demo Login Complete' : '✓ Signed In'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {successKind === 'signup' ? 'Your school account was created successfully.' : successKind === 'demo' ? 'You are signed in with the existing seeded demo administrator account.' : 'Your secure school session is ready.'}
                </p>
                <p className="mt-1 text-xs text-slate-400">Opening your dashboard…</p>
              </div>
            ) : mode === 'sent' || mode === 'complete' ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" strokeWidth={1.6} />
                <p className="mt-5 text-sm leading-6 text-slate-600">{mode === 'sent' ? 'Use the link in your email to choose a new password. The link expires in 30 minutes.' : 'You can now sign in with your new password.'}</p>
                <button type="button" onClick={() => changeMode('login')} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#176d5d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#125849]">
                  {mode === 'sent' ? 'Return to sign in' : 'Continue to sign in'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <motion.form
                key={`${mode}-${errorAnimationKey}`}
                noValidate
                onSubmit={handleSubmit}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                animate={authMessage || fieldError
                  ? prefersReducedMotion ? { x: 0, opacity: 1, y: 0 } : { x: [0, -5, 4, -2, 0], opacity: 1, y: 0 }
                  : { x: 0, opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
                className="space-y-4"
              >
                {mode === 'signup' && (
                  <>
                    <div>
                      <label htmlFor="auth-name" className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input id="auth-name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="auth-input w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none" placeholder="Your name" />
                      </div>
                    </div>
                    {emailField}
                    <div>
                      <label htmlFor="auth-phone" className="mb-1.5 block text-sm font-medium text-slate-700">Phone number <span className="font-normal text-slate-400">(optional)</span></label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input id="auth-phone" type="tel" autoComplete="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className="auth-input w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none" placeholder="Add a phone number" />
                      </div>
                    </div>
                    {passwordFields('Confirm password')}
                  </>
                )}
                {mode === 'login' && <>{emailField}{passwordFields('')}</>}
                {mode === 'forgot' && emailField}
                {mode === 'reset' && <>{passwordFields('Confirm new password')}</>}

                {mode === 'login' && (
                  <div className="flex items-center justify-between pt-1 text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-slate-600">
                      <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#2367a4] focus:ring-[#2367a4]" />
                      Remember me
                    </label>
                    <button type="button" onClick={() => changeMode('forgot')} className="font-medium text-[#2367a4] transition hover:text-[#194f82]">Forgot password?</button>
                  </div>
                )}

                {(fieldError || authMessage) && (
                  <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-800">{fieldError || authMessage}</p>
                )}

                <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2367a4] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(35,103,164,0.8)] transition hover:bg-[#194f82] disabled:cursor-wait disabled:opacity-70">
                  {isLoading ? <><motion.span animate={prefersReducedMotion ? undefined : { rotate: 360 }} transition={prefersReducedMotion ? undefined : { duration: 0.7, repeat: Infinity, ease: 'linear' }}><LoaderCircle className="h-4 w-4" /></motion.span> Please wait</> : <>{mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Verify email' : 'Save new password'} <ArrowRight className="h-4 w-4" /></>}
                </button>

                {mode === 'login' && (
                  <button type="button" onClick={handleDemoLogin} disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2367a4]/25 bg-[#edf5fb] px-4 py-3 text-sm font-semibold text-[#2367a4] transition hover:border-[#2367a4]/50 hover:bg-[#e3eff8] disabled:cursor-wait disabled:opacity-60">
                    {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    Demo Login
                  </button>
                )}

                <div className="pt-3 text-center text-sm text-slate-500">
                  {mode === 'login' ? <>New to Smart School? <button type="button" onClick={() => changeMode('signup')} className="font-semibold text-[#2367a4] hover:text-[#194f82]">Create account</button></> :
                    <button type="button" onClick={() => changeMode('login')} className="inline-flex items-center gap-1.5 font-medium text-[#2367a4] hover:text-[#194f82]"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</button>}
                </div>
              </motion.form>
            )}
          </motion.div>
          </AnimatePresence>

          <div className="mt-8 border-t border-slate-100 pt-5 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck className="h-3.5 w-3.5" /> Secure access for school personnel</p>
          </div>
        </div>
      </section>
    </main>
  );
};
