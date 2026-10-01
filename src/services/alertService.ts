/**
 * alertService.ts — QIS School Safety Alert System
 *
 * Currently uses console.log for simulation.
 * Numbers are read from localStorage key "qis_alert_numbers".
 *
 * TODO (Production):
 *   - WhatsApp: Replace console.log with Twilio WhatsApp API
 *     POST https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json
 *     Body: { From: 'whatsapp:+14155238886', To: 'whatsapp:+91{number}', Body: message }
 *
 *   - SMS: Replace console.log with Twilio SMS or AWS SNS
 *     POST https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json
 *     Body: { From: '+1XXXXXXXXXX', To: '+91{number}', Body: message }
 *
 *   - Store alert log in DB via backend: POST /api/alerts/log
 */

export type AlertLevel = 'CRITICAL' | 'WARNING';

/** Default recipient numbers — stored in localStorage under "qis_alert_numbers" */
export const DEFAULT_ALERT_NUMBERS = ['6304805605', '9999999999', '8888888888'];

const STORAGE_KEY = 'qis_alert_numbers';

/** Base dashboard URL */
const DASHBOARD_URL = typeof window !== 'undefined' ? `${window.location.origin}/live` : 'http://localhost:5173/live';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the current list of recipient phone numbers from localStorage. */
export function getAlertNumbers(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ALERT_NUMBERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ALERT_NUMBERS;
  } catch {
    return DEFAULT_ALERT_NUMBERS;
  }
}

/** Persists the recipient list to localStorage. */
export function saveAlertNumbers(numbers: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(numbers));
}

// ---------------------------------------------------------------------------
// 1. WhatsApp Alert
// ---------------------------------------------------------------------------

/**
 * Sends a WhatsApp alert to all configured recipients for a classroom incident.
 *
 * @param classroomId - e.g. "C-101"
 * @param issue       - Human-readable issue description
 * @param level       - 'CRITICAL' | 'WARNING'
 *
 * TODO: Replace body with Twilio / WhatsApp Cloud API call.
 */
export async function sendWhatsAppAlert(
  classroomId: string,
  issue: string,
  level: AlertLevel
): Promise<void> {
  const numbers = getAlertNumbers();
  const message =
    `🚨 QIS ONGOLE ALERT: ${issue} in ${classroomId}. ` +
    `Level: ${level}. Action needed in 2 mins. ` +
    `View: ${DASHBOARD_URL}/${classroomId}`;

  // ── Simulated send ──────────────────────────────────────────────────────
  numbers.forEach((n) => {
    console.log(
      `%c[WHATSAPP SENT to +91${n}] 🚨 QIS CRITICAL ALERT: ${issue} at ${classroomId} - Evacuate Now!`,
      'color:#25D366;font-weight:bold;font-size:12px'
    );
  });
  console.log(`%c[WHATSAPP] Message: ${message}`, 'color:#25D366');
  // ── End simulation ──────────────────────────────────────────────────────

  /*
  // TODO: Uncomment and configure for production (Twilio example):
  //
  // import twilio from 'twilio';
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await Promise.all(numbers.map(n =>
  //   client.messages.create({
  //     from: 'whatsapp:+14155238886',
  //     to:   `whatsapp:+91${n}`,
  //     body: message,
  //   })
  // ));
  */
}

// ---------------------------------------------------------------------------
// 2. SMS Alert
// ---------------------------------------------------------------------------

/**
 * Sends an SMS alert to all configured recipients for a classroom incident.
 *
 * @param classroomId - e.g. "C-101"
 * @param issue       - Human-readable issue description
 * @param level       - 'CRITICAL' | 'WARNING'
 *
 * TODO: Replace body with Twilio SMS / AWS SNS call.
 */
export async function sendSMSAlert(
  classroomId: string,
  issue: string,
  level: AlertLevel
): Promise<void> {
  const numbers = getAlertNumbers();
  const message = `QIS Alert: ${issue} at ${classroomId}. Level: ${level}. Check dashboard.`;

  // ── Simulated send ──────────────────────────────────────────────────────
  numbers.forEach((n) => {
    console.log(
      `%c[SMS SENT to +91${n}]: ${message}`,
      'color:#3b82f6;font-weight:bold;font-size:12px'
    );
  });
  // ── End simulation ──────────────────────────────────────────────────────

  /*
  // TODO: Uncomment and configure for production (Twilio example):
  //
  // import twilio from 'twilio';
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await Promise.all(numbers.map(n =>
  //   client.messages.create({
  //     from: process.env.TWILIO_PHONE_NUMBER,
  //     to:   `+91${n}`,
  //     body: message,
  //   })
  // ));
  */
}

// ---------------------------------------------------------------------------
// 3. Combined escalation — call both channels at once
// ---------------------------------------------------------------------------

/**
 * Triggers both WhatsApp + SMS alerts in parallel to all stored numbers.
 * Called automatically when a CRITICAL alert is not acknowledged in 2 minutes,
 * or manually via the "Send Manual Alert" button in EmergencyBanner.
 *
 * @returns The list of numbers that were notified.
 */
export async function triggerEscalationAlerts(
  classroomId: string,
  issue: string,
  level: AlertLevel
): Promise<string[]> {
  const numbers = getAlertNumbers();
  console.log(
    `%c[ALERT ESCALATION] Triggering all channels for ${classroomId} — ${level} — ${numbers.length} recipients`,
    'color:red;font-weight:bold;font-size:13px'
  );

  await Promise.all([
    sendWhatsAppAlert(classroomId, issue, level),
    sendSMSAlert(classroomId, issue, level),
  ]);

  console.log(
    `%c[ALERT ESCALATION] All channels notified. Recipients: ${numbers.map(n => `+91${n}`).join(', ')}`,
    'color:red;font-weight:bold'
  );

  return numbers;
}
