import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EmergencyEscalationBanner: React.FC = () => {
  const { alerts, acknowledgeAlert, setSelectedIssueId, setActiveTab } = useApp();

  // Find most urgent active critical alert
  const criticalAlert = alerts.find(
    (a) => a.severity === 'critical' && a.status === 'active'
  );

  if (!criticalAlert) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-3 shadow-lg border-b border-red-800 animate-fadeIn">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm animate-pulse flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white text-red-700 text-xs font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                CRITICAL INCIDENT #{criticalAlert.alertCode}
              </span>
              <span className="inline-flex items-center gap-1 bg-red-900/60 text-xs px-2 py-0.5 rounded-full border border-red-400/30">
                <Clock className="w-3 h-3" />
                Escalation Level {criticalAlert.escalationLevel} of 3
                {criticalAlert.escalationTimerSeconds > 0 && (
                  <span className="font-mono font-semibold ml-1">
                    (Auto-escalates in {criticalAlert.escalationTimerSeconds}s)
                  </span>
                )}
              </span>
            </div>
            <p className="text-sm font-medium mt-0.5 text-red-50">
              <span className="font-semibold text-white">{criticalAlert.title}:</span> {criticalAlert.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          <button
            onClick={() => acknowledgeAlert(criticalAlert.id)}
            className="px-3 py-1.5 bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Acknowledge
          </button>
          <button
            onClick={() => {
              if (criticalAlert.problemId) {
                setSelectedIssueId(criticalAlert.problemId);
              } else {
                setActiveTab('alerts');
              }
            }}
            className="px-3 py-1.5 bg-red-800/80 hover:bg-red-900 text-white text-xs font-medium rounded-lg border border-red-400/40 transition-colors flex items-center gap-1"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
