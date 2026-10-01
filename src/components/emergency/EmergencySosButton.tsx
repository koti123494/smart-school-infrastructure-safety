import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EmergencySosModal } from './EmergencySosModal';
import { triggerVibration } from '../../services/sosService';
import { SosAlert } from '../../types';

interface EmergencySosButtonProps {
  className?: string;
  onAlertSent?: (alert: SosAlert) => void;
}

export const EmergencySosButton: React.FC<EmergencySosButtonProps> = ({
  className = '',
  onAlertSent,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    // Vibrate 200ms on mobile when SOS button is pressed (Requirement 8)
    triggerVibration(200);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        {/* Radiating Red Glow Pulse (Requirement 1) */}
        <span
          className="absolute -inset-1 rounded-2xl bg-red-600 opacity-75 blur-sm animate-pulse pointer-events-none"
          aria-hidden="true"
        />
        <span
          className="absolute -inset-2 rounded-2xl bg-red-500/40 animate-ping pointer-events-none"
          aria-hidden="true"
        />

        <motion.button
          id="student-sos-emergency-btn"
          type="button"
          onClick={handleClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-10 flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#DC2626] hover:bg-red-700 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-red-600/50 border-2 border-red-400/80 transition-colors focus:outline-none focus:ring-4 focus:ring-red-500/40 active:bg-red-800"
          aria-label="SOS Emergency Alert"
        >
          <span className="text-lg sm:text-xl filter drop-shadow animate-bounce">🆘</span>
          <span className="drop-shadow-sm font-black whitespace-nowrap">SOS Emergency</span>
        </motion.button>
      </div>

      {/* Confirmation & Dispatch Modal */}
      <EmergencySosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAlertSent={onAlertSent}
      />
    </>
  );
};
