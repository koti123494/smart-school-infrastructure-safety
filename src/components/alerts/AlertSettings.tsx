import React, { useState, useEffect } from 'react';
import { Save, Pencil, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { getAlertNumbers, saveAlertNumbers, DEFAULT_ALERT_NUMBERS } from '../../services/alertService';

/** Validates a 10-digit Indian mobile number */
function isValidNumber(n: string): boolean {
  return /^[6-9]\d{9}$/.test(n.trim());
}

export const AlertSettings: React.FC = () => {
  const [numbers, setNumbers] = useState<string[]>(DEFAULT_ALERT_NUMBERS);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setNumbers(getAlertNumbers());
  }, []);

  const handleEdit = () => {
    setDraft([...numbers]);
    setEditing(true);
    setSaved(false);
  };

  const handleSave = () => {
    // Only save valid numbers
    const cleaned = draft.map((n) => n.trim());
    saveAlertNumbers(cleaned);
    setNumbers(cleaned);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft([]);
  };

  const updateDraft = (index: number, value: string) => {
    const next = [...draft];
    next[index] = value.replace(/\D/g, '').slice(0, 10); // digits only, max 10
    setDraft(next);
  };

  const allValid = draft.every(isValidNumber);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ background: 'linear-gradient(135deg,#25D366 0%,#128C7E 100%)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">🚨 Alert Recipients</h3>
            <p className="text-green-100 text-[11px]">WhatsApp + SMS escalation contacts</p>
          </div>
        </div>

        {/* Edit / Save / Cancel */}
        {!editing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition active:scale-95"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="text-white/70 hover:text-white text-xs px-2 py-1.5 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!allValid}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition active:scale-95
                ${allValid
                  ? 'bg-white text-green-700 hover:bg-green-50'
                  : 'bg-white/30 text-white/50 cursor-not-allowed'
                }`}
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        )}
      </div>

      {/* Save confirmation */}
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border-b border-green-100 px-5 py-2 text-green-700 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Numbers saved to localStorage ✓
        </div>
      )}

      {/* Number inputs */}
      <div className="px-5 py-4 space-y-3">
        {(editing ? draft : numbers).map((num, i) => {
          const valid = isValidNumber(num);
          return (
            <div key={i} className="flex items-center gap-2">
              {/* +91 prefix badge */}
              <span className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-2.5 py-2 rounded-lg flex-shrink-0">
                <Phone className="w-3 h-3" />
                +91
              </span>

              {editing ? (
                <div className="flex-1 relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={num}
                    onChange={(e) => updateDraft(i, e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`w-full text-sm font-mono px-3 py-2 rounded-lg border outline-none transition
                      ${num.length === 0
                        ? 'border-slate-300 focus:border-green-400'
                        : valid
                        ? 'border-green-400 bg-green-50/40 focus:border-green-500'
                        : 'border-red-400 bg-red-50/40 focus:border-red-500'
                      }`}
                  />
                  {num.length > 0 && (
                    <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold ${valid ? 'text-green-600' : 'text-red-500'}`}>
                      {valid ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <span className="text-sm font-mono font-semibold text-slate-800 tracking-wider">
                    {num}
                  </span>
                  <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Active
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Validation hint */}
        {editing && !allValid && (
          <p className="text-[11px] text-red-500 font-medium px-1">
            ⚠ All numbers must be valid 10-digit Indian mobile numbers (start with 6-9)
          </p>
        )}

        {/* Info footer */}
        <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 mt-2">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-700">When triggered:</strong> All numbers receive WhatsApp 🟢 + SMS 🔵 alerts simultaneously.
            Numbers are stored in <code className="bg-slate-200 px-1 rounded">localStorage</code> only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertSettings;
