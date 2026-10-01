import { SosAlert } from '../types';

export const SOS_STORAGE_KEY = 'sosAlerts';

export const getSosAlerts = (): SosAlert[] => {
  try {
    const raw = localStorage.getItem(SOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read SOS alerts from localStorage', e);
    return [];
  }
};

export const saveSosAlerts = (alerts: SosAlert[]): void => {
  try {
    localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(alerts));
    window.dispatchEvent(new CustomEvent('sosAlertsUpdated', { detail: alerts }));
  } catch (e) {
    console.error('Failed to save SOS alerts to localStorage', e);
  }
};

export const createSosAlert = (studentName?: string, studentPhone?: string): SosAlert => {
  const alerts = getSosAlerts();
  const now = new Date();

  const newAlert: SosAlert = {
    id: `sos-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    studentName: studentName || 'Student (Demo User)',
    studentPhone: studentPhone || '+91 98765 43210',
    location: 'QIS Block B, 2nd Floor (GPS: 15.5057° N, 80.0499° E)',
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timestamp: Date.now(),
    status: 'Active',
    gps: '15.5057° N, 80.0499° E',
  };

  const updated = [newAlert, ...alerts];
  saveSosAlerts(updated);
  return newAlert;
};

export const markSosAlertResolved = (alertId: string): void => {
  const alerts = getSosAlerts();
  const updated = alerts.map((a) =>
    a.id === alertId
      ? {
          ...a,
          status: 'Resolved' as const,
          resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      : a
  );
  saveSosAlerts(updated);
};

export const clearAllSosAlerts = (): void => {
  saveSosAlerts([]);
};

/**
 * High-fidelity Emergency Siren Synthesizer using Web Audio API
 * Dual-oscillator modulated sweep for realistic campus alarm tone
 */
export const playEmergencySiren = (): void => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    const duration = 2.8;
    const cycles = 5;
    for (let i = 0; i < cycles; i++) {
      const start = now + (i * duration) / cycles;
      const half = duration / cycles / 2;
      osc1.frequency.setValueAtTime(650, start);
      osc1.frequency.exponentialRampToValueAtTime(980, start + half);
      osc1.frequency.exponentialRampToValueAtTime(650, start + half * 2);

      osc2.frequency.setValueAtTime(670, start);
      osc2.frequency.exponentialRampToValueAtTime(1010, start + half);
      osc2.frequency.exponentialRampToValueAtTime(670, start + half * 2);
    }

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.35, now + 0.08);
    gainNode.gain.setValueAtTime(0.35, now + duration - 0.25);
    gainNode.gain.linearRampToValueAtTime(0.001, now + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  } catch (err) {
    console.warn('Unable to play emergency siren audio', err);
  }
};

/**
 * Mobile device vibration helper
 */
export const triggerVibration = (pattern: number | number[] = 200): void => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore unsupported browser environments
  }
};
