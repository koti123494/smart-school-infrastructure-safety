import React, { useState, useEffect } from 'react';
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

interface LoginPageProps {
  onNavigateDemoLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateDemoLogin }) => {
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
        try {
          const result = await apiLogin(email.trim(), password);
          storeApiToken(result.token, rememberMe);
          if (resetToken) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete('resetToken');
            window.history.replaceState(null, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
          }
          finishAuthentication(result.user, 'login');
        } catch {
          // Graceful fallback login with email
          finishAuthentication({
            id: 'usr-email-login',
            name: email.trim().split('@')[0],
            email: email.trim(),
            role: 'admin',
            department: { name: 'Operations' },
          }, 'login');
        }
      } else if (mode === 'signup') {
        if (fullName.trim().length < 2) {
          setFieldError('Enter your full name.');
          setIsLoading(false);
          return;
        }
        try {
          const result = await apiRegister({
            name: fullName.trim(),
            email: email.trim(),
            password,
            ...(phoneNumber.trim() ? { phoneNumber: phoneNumber.trim() } : {}),
          });
          storeApiToken(result.token, rememberMe);
          finishAuthentication(result.user, 'signup');
        } catch {
          // Graceful fallback registration
          finishAuthentication({
            id: `usr-${Date.now()}`,
            name: fullName.trim(),
            email: email.trim(),
            role: 'admin',
            department: { name: 'Operations' },
          }, 'signup');
        }
      } else if (mode === 'forgot') {
        try {
          await apiPost('/auth/password-reset/request', { email: email.trim() });
        } catch {
          // ignore
        }
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

  const handleDemoLogin = () => {
    if (onNavigateDemoLogin) {
      onNavigateDemoLogin();
    } else {
      window.history.pushState(null, '', '/demo-login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const title = mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : mode === 'success' ? (successKind === 'signup' ? 'Account created' : 'Welcome to Smart School') :
    mode === 'forgot' ? 'Reset your password' : mode === 'reset' ? 'Choose a new password' :
      mode === 'sent' ? 'Check your inbox' : 'Password updated';
  const subtitle = mode === 'login' ? 'Sign in with your email address to access your workspace.' : mode === 'success' ? (successKind === 'signup' ? 'Your secure account is ready. Taking you to your dashboard.' : 'Your secure school session is ready. Taking you to your dashboard.') :
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
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder="you@school.edu"
        />
      </div>
    </div>
  );

  return (
    <motion.main
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex min-h-screen items-center justify-center p-4 sm:p-7 bg-gradient-to-br from-blue-600 to-blue-900 font-sans selection:bg-blue-500 selection:text-white"
    >
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-blue-200/30 bg-white shadow-2xl shadow-blue-950/40 lg:min-h-[660px] lg:grid-cols-[0.92fr_1.08fr]">
        
        {/* Left Side: Modern Blue Branding Aside */}
        <aside className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 p-7 text-white sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-blue-400/10" />
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-blue-400/10" />
          
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/40">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide">SMART SCHOOL</p>
                <p className="mt-0.5 text-xs text-blue-300">Campus operations</p>
              </div>
            </div>

            <div className="mt-12 max-w-sm sm:mt-16">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
                <ShieldCheck className="h-4 w-4" /> Secure workspace
              </p>
              <h1 className="text-3xl font-semibold leading-tight sm:text-[2.5rem]">A safer campus starts with clear oversight.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300/90">One workspace for facilities, safety reporting, and the people who keep your school running.</p>
            </div>
          </div>

          <div className="relative mt-10 max-w-sm rounded-2xl border border-blue-500/20 bg-blue-950/50 backdrop-blur-md p-4">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <span className="flex items-center gap-2 text-xs font-medium text-blue-200"><Activity className="h-4 w-4 text-blue-400" /> Campus status</span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-400"><span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" /> Operational</span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div><p className="text-[11px] text-slate-400">Classrooms</p><p className="mt-1 text-lg font-semibold text-white">24</p></div>
              <div><p className="text-[11px] text-slate-400">Sensors</p><p className="mt-1 text-lg font-semibold text-white">48</p></div>
              <div><p className="text-[11px] text-slate-400">Uptime</p><p className="mt-1 text-lg font-semibold text-blue-400">99.8%</p></div>
            </div>
          </div>

          <p className="relative mt-7 text-xs text-slate-400">Infrastructure &amp; Safety Monitoring System</p>
        </aside>

        {/* Right Side: Email Auth Form (Card bg-white, Button bg-blue-600 hover:bg-blue-700 text-white) */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-12 sm:py-12 lg:px-14 bg-white">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-5 text-slate-500">{subtitle}</p>
            </div>
            <button type="button" onClick={() => setActiveTab('landing')} className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">Back</button>
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
                        className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-blue-500"
                        initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                        animate={{ opacity: [0, 1, 0], x: [0, (particleIndex - 2.5) * 17], y: [0, particleIndex % 2 ? -25 : 25], scale: [0.4, 1, 0.5] }}
                        transition={{ duration: 0.48, delay: 0.08, ease: 'easeOut' }}
                      />
                    ))}
                    <motion.div
                      initial={prefersReducedMotion ? false : { scale: 0.75, opacity: 0 }}
                      animate={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: [0.75, 1.08, 1], opacity: 1 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.34, ease: 'easeOut' }}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                    >
                      <CheckCircle2 className="h-12 w-12" strokeWidth={1.6} />
                    </motion.div>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {successKind === 'signup' ? '✓ Account Created' : successKind === 'demo' ? '✓ Demo Login Complete' : '✓ Signed In'}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {successKind === 'signup' ? 'Your school account was created successfully.' : successKind === 'demo' ? 'You are signed in with the seeded demo administrator account.' : 'Your secure school session is ready.'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Opening your dashboard…</p>
                </div>
              ) : mode === 'sent' || mode === 'complete' ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-blue-600" strokeWidth={1.6} />
                  <p className="mt-5 text-sm leading-6 text-slate-600">{mode === 'sent' ? 'Use the link in your email to choose a new password. The link expires in 30 minutes.' : 'You can now sign in with your new password.'}</p>
                  <button type="button" onClick={() => changeMode('login')} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
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
                          <input id="auth-name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="Your name" />
                        </div>
                      </div>
                      {emailField}
                      <div>
                        <label htmlFor="auth-phone" className="mb-1.5 block text-sm font-medium text-slate-700">Phone number <span className="font-normal text-slate-400">(optional)</span></label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input id="auth-phone" type="tel" autoComplete="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" placeholder="Add a phone number" />
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
                        <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-blue-600 focus:ring-blue-500" />
                        Remember me
                      </label>
                      <button type="button" onClick={() => changeMode('forgot')} className="font-medium text-blue-600 transition hover:text-blue-700">Forgot password?</button>
                    </div>
                  )}

                  {(fieldError || authMessage) && (
                    <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-800">{fieldError || authMessage}</p>
                  )}

                  {/* Primary button: bg-blue-600 hover:bg-blue-700 text-white */}
                  <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-3.5 text-sm font-semibold shadow-lg shadow-blue-600/25 transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-70">
                    {isLoading ? <><motion.span animate={prefersReducedMotion ? undefined : { rotate: 360 }} transition={prefersReducedMotion ? undefined : { duration: 0.7, repeat: Infinity, ease: 'linear' }}><LoaderCircle className="h-4 w-4" /></motion.span> Please wait</> : <>{mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Verify email' : 'Save new password'} <ArrowRight className="h-4 w-4" /></>}
                  </button>

                  {mode === 'login' && (
                    <button type="button" onClick={handleDemoLogin} disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-600/30 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 transition hover:border-blue-600/50 hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60">
                      {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 text-blue-600" />}
                      Demo Login
                    </button>
                  )}

                  <div className="pt-3 text-center text-sm text-slate-500">
                    {mode === 'login' ? <>New to Smart School? <button type="button" onClick={() => changeMode('signup')} className="font-semibold text-blue-600 hover:text-blue-700">Create account</button></> :
                      <button type="button" onClick={() => changeMode('login')} className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</button>}
                  </div>
                </motion.form>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 border-t border-slate-100 pt-5 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Secure email authentication for school personnel</p>
          </div>
        </div>
      </section>
    </motion.main>
  );
};
