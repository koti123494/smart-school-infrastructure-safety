import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  X,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  Clock,
  User,
  Radio,
  Sparkles,
  PhoneCall,
  Volume2,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  createSosAlert,
  playEmergencySiren,
  triggerVibration,
} from '../../services/sosService';
import { SosAlert } from '../../types';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertSent?: (alert: SosAlert) => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  onAlertSent,
}) => {
  const { currentUser, setActiveTab } = useApp();
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdAlert, setCreatedAlert] = useState<SosAlert | null>(null);

  const holdStartTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const HOLD_DURATION_MS = 3000;

  // Cleanup timers on modal close
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    holdStartTimeRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);
    setIsSuccess(false);
    setCreatedAlert(null);
  };

  const handleStartHold = () => {
    if (isSuccess) return;
    triggerVibration(100);
    setIsHolding(true);
    holdStartTimeRef.current = Date.now();

    const updateProgress = () => {
      if (!holdStartTimeRef.current) return;
      const elapsed = Date.now() - holdStartTimeRef.current;
      const percentage = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(percentage);

      if (percentage >= 100) {
        triggerEmergencyAlert();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handleEndHold = () => {
    if (isSuccess) return;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    holdStartTimeRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);
  };

  const triggerEmergencyAlert = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(100);

    // Play siren sound & vibrate
    playEmergencySiren();
    triggerVibration([300, 150, 300, 150, 400]);

    // Create fake alert data
    const alert = createSosAlert(currentUser?.name, currentUser?.phone);
    setCreatedAlert(alert);
    setIsSuccess(true);

    if (onAlertSent) {
      onAlertSent(alert);
    }
  };

  // Demo instant trigger for presentations
  const handleDemoInstantTrigger = () => {
    triggerEmergencyAlert();
  };

  const circleRadius = 24;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop with red emergency vignette */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSuccess ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-2 border-red-500/80 shadow-2xl shadow-red-600/30 overflow-hidden font-sans z-10"
          >
            {/* Top Red Alert Header Bar */}
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/25">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    Emergency SOS
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  </h3>
                  <p className="text-xs text-red-100 font-medium">QIS Campus Rapid Safety Protocol</p>
                </div>
              </div>

              {!isSuccess && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {!isSuccess ? (
                <div className="text-center space-y-6">
                  {/* Warning Icon Badge */}
                  <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/60 border-2 border-red-400/50 flex items-center justify-center shadow-lg shadow-red-500/20">
                    <span className="text-3xl animate-bounce">🆘</span>
                  </div>

                  {/* Confirmation Text */}
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                      Are you in emergency?
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                      This will alert security &amp; HOD with your location.
                    </p>
                  </div>

                  {/* Location & User Preview */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 text-left text-xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span><strong>Student:</strong> {currentUser?.name || 'Student (Current User)'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="truncate"><strong>GPS Location:</strong> QIS Block B, 2nd Floor (15.5057° N, 80.0499° E)</span>
                    </div>
                  </div>

                  {/* Hold Instruction */}
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    Press and hold the button for 3 seconds to confirm
                  </p>

                  {/* Action Buttons: Cancel and Hold 3 sec */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-1/3 py-3.5 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
                    >
                      Cancel
                    </button>

                    {/* Hold to Send Button with Circular Progress */}
                    <div className="relative w-full sm:w-2/3">
                      <button
                        type="button"
                        id="sos-hold-button"
                        onMouseDown={handleStartHold}
                        onMouseUp={handleEndHold}
                        onMouseLeave={handleEndHold}
                        onTouchStart={handleStartHold}
                        onTouchEnd={handleEndHold}
                        onTouchCancel={handleEndHold}
                        className={`w-full relative py-3.5 px-6 rounded-2xl text-white font-bold text-sm select-none transition-all duration-200 flex items-center justify-center gap-3 shadow-xl overflow-hidden ${
                          isHolding
                            ? 'bg-red-700 scale-[0.98] ring-4 ring-red-500/50 shadow-red-700/50'
                            : 'bg-[#DC2626] hover:bg-red-700 shadow-red-600/40 hover:scale-[1.02]'
                        }`}
                      >
                        {/* Circular Progress Indicator */}
                        <div className="relative flex-shrink-0 w-8 h-8">
                          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 56 56">
                            <circle
                              cx="28"
                              cy="28"
                              r={circleRadius}
                              stroke="currentColor"
                              strokeWidth="5"
                              fill="transparent"
                              className="text-red-900/40"
                            />
                            <circle
                              cx="28"
                              cy="28"
                              r={circleRadius}
                              stroke="currentColor"
                              strokeWidth="5"
                              fill="transparent"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              className="text-white transition-all duration-75"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold">
                            {Math.round(holdProgress)}%
                          </div>
                        </div>

                        <span>
                          {isHolding
                            ? `Holding... ${(3 - (holdProgress / 100) * 3).toFixed(1)}s`
                            : 'Yes, Send Alert (Hold 3 sec)'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Presentation Demo Instant Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      id="sos-demo-instant-btn"
                      onClick={handleDemoInstantTrigger}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold inline-flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Presentation Mode: Trigger Demo SOS Instantly
                    </button>
                  </div>
                </div>
              ) : (
                /* Success Animation View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-2"
                >
                  {/* Animated Success Badge */}
                  <div className="relative mx-auto w-24 h-24">
                    <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                    <div className="relative w-24 h-24 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30">
                      <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                      ✅ Alert Sent! Help is coming
                    </h4>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      Security &amp; HOD have received your emergency beacon.
                    </p>
                  </div>

                  {/* Dispatch Details Card */}
                  <div className="bg-red-50/70 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800/60 rounded-2xl p-4 text-left space-y-2.5">
                    <div className="flex items-center justify-between border-b border-red-200/60 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Dispatch Details
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white uppercase">
                        Active Alert
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Student</span>
                        <strong className="text-slate-900 dark:text-white">{createdAlert?.studentName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Time Sent</span>
                        <strong>{createdAlert?.time}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[11px]">Live Location</span>
                        <strong className="text-red-700 dark:text-red-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {createdAlert?.location}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.history.pushState(null, '', '/security');
                        setActiveTab('security');
                      }}
                      className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                    >
                      <span>Open Security Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto py-3 px-5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
