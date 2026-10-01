import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  UserX,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  X,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DemoLoginPageProps {
  onBackToLogin: () => void;
}

export const DemoLoginPage: React.FC<DemoLoginPageProps> = ({ onBackToLogin }) => {
  const { loginAs, setActiveTab } = useApp();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  // Forget modal state
  const [isForgetModalOpen, setIsForgetModalOpen] = useState(false);
  const [forgetNumber, setForgetNumber] = useState('');
  const [forgetError, setForgetError] = useState<string | null>(null);

  // Local Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const getRegisteredUsers = (): string[] => {
    try {
      const raw = localStorage.getItem('qis_registered_users');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  };

  const [registeredList, setRegisteredList] = useState<string[]>([]);

  useEffect(() => {
    setRegisteredList(getRegisteredUsers());
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(clean);
    if (errorMessage) setErrorMessage(null);
  };

  const handleCreateOrLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const clean = phoneNumber.trim();

    // Validation: Exactly 10 digits
    if (!clean || clean.length !== 10) {
      setErrorMessage('Enter 10 digit number');
      setShakeKey((prev) => prev + 1);
      showToast('Enter 10 digit number', 'error');
      return;
    }

    const registered = getRegisteredUsers();
    const exists = registered.includes(clean);

    if (exists) {
      // Exists: set qis_current_user = number -> navigate /dashboard -> toast "Welcome back +91{number} ✓"
      localStorage.setItem('qis_current_user', clean);
      const toastMsg = `Welcome back +91${clean} ✓`;
      try {
        sessionStorage.setItem('pending_toast', JSON.stringify({ message: toastMsg, type: 'success' }));
      } catch {
        // ignore
      }
      loginAs('admin');
      setActiveTab('dashboard');
      window.history.pushState(null, '', '/dashboard');
    } else {
      // NOT exists -> push to array -> set qis_current_user -> navigate /dashboard -> toast "Number created & Logged in ✓"
      const updated = [...registered, clean];
      localStorage.setItem('qis_registered_users', JSON.stringify(updated));
      localStorage.setItem('qis_current_user', clean);
      setRegisteredList(updated);
      const toastMsg = 'Number created & Logged in ✓';
      try {
        sessionStorage.setItem('pending_toast', JSON.stringify({ message: toastMsg, type: 'success' }));
      } catch {
        // ignore
      }
      loginAs('admin');
      setActiveTab('dashboard');
      window.history.pushState(null, '', '/dashboard');
    }
  };

  const openForgetModal = () => {
    setForgetNumber(phoneNumber.length === 10 ? phoneNumber : '');
    setForgetError(null);
    setIsForgetModalOpen(true);
  };

  const handleForgetSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const clean = forgetNumber.trim();
    if (!clean || clean.length !== 10) {
      setForgetError('Enter 10 digit number');
      showToast('Enter 10 digit number', 'error');
      return;
    }

    const registered = getRegisteredUsers();
    const exists = registered.includes(clean);

    if (exists) {
      // Remove from array
      const filtered = registered.filter((n) => n !== clean);
      localStorage.setItem('qis_registered_users', JSON.stringify(filtered));
      setRegisteredList(filtered);

      // If qis_current_user same, remove it
      if (localStorage.getItem('qis_current_user') === clean) {
        localStorage.removeItem('qis_current_user');
      }

      showToast('Number removed', 'success');
      setIsForgetModalOpen(false);

      if (phoneNumber === clean) {
        setPhoneNumber('');
      }
    } else {
      setForgetError('Number not found');
      showToast('Number not found', 'error');
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex min-h-screen items-center justify-center p-4 sm:p-7 bg-gradient-to-br from-blue-600 to-blue-900 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden"
    >
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/30'
                : 'bg-rose-600 text-white border-rose-400 shadow-rose-950/30'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center White Card with Animation: Fade-in + Scale */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl p-7 sm:p-10 shadow-2xl shadow-blue-950/40 max-w-md w-full border border-blue-100/80 relative z-10"
      >
        {/* Top Header Badge */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5 border border-blue-200/60 shadow-sm">
            <Sparkles className="w-7 h-7 text-blue-600" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Demo Access
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Enter 10 digit number for quick demo
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleCreateOrLogin} className="space-y-5">
          <div>
            <label
              htmlFor="demo-phone-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2"
            >
              Mobile Number
            </label>

            {/* Input: Fixed +91 | [ 10 digit number input ] */}
            <div
              key={shakeKey}
              className={`flex items-center rounded-2xl border-2 transition-all duration-200 overflow-hidden bg-slate-50/50 ${
                errorMessage
                  ? 'border-rose-500 ring-4 ring-rose-500/20 auth-error-shake'
                  : phoneNumber.length === 10
                  ? 'border-blue-500 ring-4 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20'
              }`}
            >
              {/* Fixed +91 Badge */}
              <div className="bg-blue-50/80 border-r border-slate-200 px-3.5 py-3.5 flex items-center gap-1.5 text-blue-900 font-bold text-sm select-none flex-shrink-0">
                <span className="text-base" role="img" aria-label="India flag">🇮🇳</span>
                <span className="font-mono">+91</span>
              </div>

              {/* 10 Digit Number Input */}
              <input
                id="demo-phone-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Enter 10 digit number"
                className="w-full bg-transparent px-3.5 py-3.5 text-base sm:text-lg font-mono font-semibold tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal focus:outline-none"
                autoFocus
              />

              {/* Status indicator */}
              <div className="pr-3.5 flex-shrink-0">
                {phoneNumber.length === 10 ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                ) : phoneNumber.length > 0 ? (
                  <span className="text-[11px] font-mono font-semibold text-slate-400">
                    {phoneNumber.length}/10
                  </span>
                ) : (
                  <Phone className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Inline Error Helper */}
            {errorMessage && (
              <p className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-600 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          {/* Two Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Button 1: "Create / Login" (blue solid) */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              id="demo-create-login-btn"
              className="w-full py-3.5 px-5 rounded-xl font-bold text-sm sm:text-base text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create / Login</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {/* Button 2: "Forget Number" (outline gray) */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              id="demo-forget-number-btn"
              onClick={openForgetModal}
              className="w-full py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserX className="w-4 h-4 text-slate-500" />
              <span>Forget Number</span>
            </motion.button>
          </div>
        </form>

        {/* Quick select registered on this device (optional helper) */}
        {registeredList.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Registered on this device
            </p>
            <div className="flex flex-wrap gap-2">
              {registeredList.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setPhoneNumber(num);
                    setErrorMessage(null);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all flex items-center gap-1.5 ${
                    phoneNumber === num
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span>👤</span>
                  <span>+91 {num}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Back to Email Login Link */}
        <div className="mt-7 pt-4 text-center border-t border-slate-100">
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Email Login</span>
          </button>
        </div>
      </motion.div>

      {/* Forget Number Small Modal */}
      {isForgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200"
          >
            {/* Close button */}
            <button
              onClick={() => setIsForgetModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Forget Number</h2>
                <p className="text-xs text-slate-500">Enter number to forget</p>
              </div>
            </div>

            <form onSubmit={handleForgetSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="forget-num-input"
                  className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
                >
                  Enter number to forget
                </label>

                <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50/50 overflow-hidden focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20">
                  <div className="bg-slate-100 px-3 py-2.5 text-slate-600 font-mono text-sm border-r border-slate-300 font-medium">
                    +91
                  </div>
                  <input
                    id="forget-num-input"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={forgetNumber}
                    onChange={(e) => {
                      setForgetNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setForgetError(null);
                    }}
                    placeholder="10 digit number"
                    className="w-full bg-transparent px-3 py-2.5 font-mono text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    autoFocus
                  />
                </div>

                {forgetError && (
                  <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{forgetError}</span>
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgetModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-forget-btn"
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-900/20 transition"
                >
                  Forget Number
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.main>
  );
};
