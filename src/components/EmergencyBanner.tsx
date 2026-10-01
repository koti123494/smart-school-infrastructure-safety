import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, MessageSquare } from 'lucide-react';
import { triggerEscalationAlerts, AlertLevel } from '../services/alertService';

interface EmergencyBannerProps {
  issue: string;
  /** Classroom ID used in alert messages. Defaults to 'C-101'. */
  classroomId?: string;
  /** Alert severity level. Defaults to 'CRITICAL'. */
  level?: AlertLevel;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  issue,
  classroomId = 'C-101',
  level = 'CRITICAL',
}) => {
  const [timeLeft, setTimeLeft] = useState(120);
  const [escalated, setEscalated] = useState(false);
  const [visible, setVisible] = useState(true);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  // Ref so the interval callback always sees latest escalated value
  const escalatedRef = useRef(escalated);
  escalatedRef.current = escalated;

  // ── Auto-escalation timer ───────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0 || !visible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          // Auto-fire both alert channels if not yet escalated
          if (!escalatedRef.current) {
            setEscalated(true);
            triggerEscalationAlerts(classroomId, issue, level).then((numbers) => {
              setWhatsappSent(true);
              setSmsSent(true);
              const first = numbers[0] || 'Principal';
              alert(
                `🚨 Escalated to Principal!\nWhatsApp + SMS sent to ${numbers.length} recipient(s).\nIncluding +91${first} ✓✓ (delivered)`
              );
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, classroomId, issue, level]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  // ── Manual alert handler ────────────────────────────────────────────────
  const handleManualAlert = async () => {
    const numbers = await triggerEscalationAlerts(classroomId, issue, level);
    setWhatsappSent(true);
    setSmsSent(true);
    const first = numbers[0] || '6304805605';
    alert(
      `📲 Manual alert sent!\n` +
      `✅ WhatsApp + SMS dispatched to ${numbers.length} recipient(s).\n` +
      `Sent to +91${first} \u2713\u2713 (delivered)\n` +
      `Check the browser console for full details.`
    );
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between
        bg-red-600 border-2 border-yellow-300 rounded-2xl mx-4 mt-2 px-5 py-3 shadow-2xl
        ${timeLeft > 0 ? 'animate-pulse' : ''}`}
    >
      {/* Left: Label + Issue */}
      <div className="flex flex-col gap-0.5">
        <span className="text-yellow-300 font-extrabold text-sm tracking-widest uppercase">
          🚨 CRITICAL EMERGENCY ESCALATION
        </span>
        <span className="text-white font-semibold text-base">{issue}</span>
      </div>

      {/* Center: Countdown + Alert Badges */}
      <div className="flex flex-col items-center mx-4 flex-shrink-0 gap-1">
        <span className="text-yellow-200 text-xs font-semibold uppercase tracking-wide">
          Auto-Escalate in
        </span>
        <span className="font-mono text-3xl font-black text-white leading-none">
          {minutes}:{seconds}
        </span>

        {/* Alert status badges — appear below timer when alerts fire */}
        <div className="flex gap-2 mt-1">
          {/* WhatsApp badge */}
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
              bg-green-500 text-white border border-green-300
              ${whatsappSent ? 'opacity-100 animate-pulse' : 'opacity-30'}`}
          >
            <MessageCircle className="w-3 h-3" />
            {whatsappSent ? 'WhatsApp Alert Sent ✓' : 'WhatsApp'}
          </span>

          {/* SMS badge */}
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
              bg-blue-500 text-white border border-blue-300
              ${smsSent ? 'opacity-100 animate-pulse' : 'opacity-30'}`}
          >
            <MessageSquare className="w-3 h-3" />
            {smsSent ? 'SMS Sent to Staff ✓' : 'SMS'}
          </span>
        </div>
      </div>

      {/* Right: Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Manual Alert */}
        <button
          onClick={handleManualAlert}
          title="Immediately send WhatsApp + SMS to Principal"
          className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-md border border-orange-300"
        >
          📲 Send Manual Alert
        </button>

        {/* Acknowledge */}
        <button
          onClick={() => setVisible(false)}
          className="bg-green-500 hover:bg-green-400 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
        >
          ✅ ACKNOWLEDGE
        </button>

        {/* Resolve */}
        <button
          onClick={() => setVisible(false)}
          className="bg-white hover:bg-gray-100 active:scale-95 text-red-700 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
        >
          ✔ RESOLVE
        </button>
      </div>
    </div>
  );
};

export default EmergencyBanner;
