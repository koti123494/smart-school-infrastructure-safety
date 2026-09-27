import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  Droplets,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bell,
  Smartphone,
  Mail,
  MessageSquare,
  Radio,
  Siren,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SafetyAlert } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const AlertCenter: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    resolveAlert,
    triggerEmergencySimulation,
    setSelectedIssueId,
    setActiveTab,
  } = useApp();

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [selectedAlertForChannels, setSelectedAlertForChannels] = useState<SafetyAlert | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    return true;
  });

  const getAlertIcon = (title: string, severity: string) => {
    if (title.toLowerCase().includes('smoke') || title.toLowerCase().includes('fire')) {
      return <Flame className="w-5 h-5 text-rose-600 animate-bounce" />;
    }
    if (title.toLowerCase().includes('water') || title.toLowerCase().includes('leak')) {
      return <Droplets className="w-5 h-5 text-blue-600" />;
    }
    if (title.toLowerCase().includes('electrical') || title.toLowerCase().includes('power')) {
      return <Zap className="w-5 h-5 text-amber-600" />;
    }
    return <AlertTriangle className="w-5 h-5 text-rose-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Safety Alert Center &amp; Incident Escalation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
              Real-Time Security Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated ingestion from IoT environmental sensors and manual human incident reports.
          </p>
        </div>

        {/* Live Simulation Buttons for SIH Presentation */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => triggerEmergencySimulation('smoke')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Inject Smoke Alert</span>
          </button>
          <button
            onClick={() => triggerEmergencySimulation('water')}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Inject Water Leak</span>
          </button>
        </div>
      </div>

      {/* 3-Level Escalation Architecture Showcase (Requirement 15) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Siren className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Automated 3-Tier Alert Escalation Protocol
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforcing zero safety neglect via multi-tier notifications &amp; countdown timers
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-blue-400" /> Web Push
            </span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Mobile Push
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Alert
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-rose-400" /> SMS Dispatch
            </span>
          </div>
        </div>

        {/* 3 Escalation Levels Grid (Requirement 15) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Level 1 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 relative space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                LEVEL 1
              </span>
              <span className="text-[10px] text-slate-400">Immediate</span>
            </div>
            <h3 className="text-sm font-bold text-white">School Administrator</h3>
            <p className="text-xs text-slate-300">
              Safety issue detected. Real-time web notification &amp; mobile buzzer dispatched immediately to Dr. Arvind Sharma.
            </p>
            <div className="text-[11px] text-blue-400 font-semibold pt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Acknowledge SLA: 2 Minutes</span>
            </div>
          </div>

          {/* Level 2 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-amber-500/40 relative space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                LEVEL 2
              </span>
              <span className="text-[10px] text-amber-300 font-mono">&gt; 2 mins unack</span>
            </div>
            <h3 className="text-sm font-bold text-white">Maintenance Supervisor</h3>
            <p className="text-xs text-slate-300">
              If unacknowledged within 2 minutes: High-priority SMS &amp; direct mobile phone escalation to Vikram Singh &amp; Electrical Leads.
            </p>
            <div className="text-[11px] text-amber-400 font-semibold pt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Automated Field Dispatch</span>
            </div>
          </div>

          {/* Level 3 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-rose-500/40 relative space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                LEVEL 3
              </span>
              <span className="text-[10px] text-rose-300 font-mono">Unresolved</span>
            </div>
            <h3 className="text-sm font-bold text-white">School Board &amp; Emergency</h3>
            <p className="text-xs text-slate-300">
              If critical hazard remains unresolved: Emergency Contact Siren (+91 8592 284 100), District Fire &amp; Principal notified.
            </p>
            <div className="text-[11px] text-rose-400 font-semibold pt-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Emergency Services Hotline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Alerts Feed (Requirement 14) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Incident Feed</h2>
            <p className="text-xs text-slate-500">Live safety alarms from IoT nodes and human reporting</p>
          </div>

          {/* Severity Filters */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-xl capitalize transition ${
                  filterSeverity === sev
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alert Cards List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">All alerts clear</p>
              <p className="text-xs text-slate-500">Zero unacknowledged hazards on campus</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  alert.severity === 'critical'
                    ? alert.status === 'active'
                      ? 'border-rose-300 bg-rose-50/50 glow-red'
                      : 'border-slate-200 bg-slate-50'
                    : alert.severity === 'warning'
                    ? 'border-amber-200 bg-amber-50/40'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl ${
                      alert.severity === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : alert.severity === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {getAlertIcon(alert.title, alert.severity)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {alert.alertCode}
                      </span>
                      <StatusBadge status={alert.severity} size="sm" />
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        Source: {alert.source}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>

                    <p className="text-xs text-slate-600 max-w-2xl">{alert.message}</p>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {alert.location}
                    </p>

                    {/* Escalation Level & Countdown */}
                    {alert.severity === 'critical' && alert.status === 'active' && (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 text-xs font-semibold mt-1">
                        <span>Escalation Level {alert.escalationLevel} of 3</span>
                        {alert.escalationTimerSeconds > 0 && (
                          <span className="font-mono bg-rose-200/80 px-1.5 py-0.2 rounded text-[11px]">
                            Auto-escalating in {alert.escalationTimerSeconds}s
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions (Requirement 14: View Location, Acknowledge) */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-auto flex-shrink-0">
                  <button
                    onClick={() => setSelectedAlertForChannels(alert)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
                    title="View multi-channel notification status"
                  >
                    Channels
                  </button>

                  <button
                    onClick={() => setActiveTab('campus-map')}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View Location</span>
                  </button>

                  {!alert.isAcknowledged ? (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  ) : alert.status !== 'resolved' ? (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve Alert</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Multi-Channel Notification Dispatch Modal */}
      {selectedAlertForChannels && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-lg w-full space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Notification Dispatch Matrix
                </h3>
                <p className="text-slate-500">{selectedAlertForChannels.title}</p>
              </div>
              <button
                onClick={() => setSelectedAlertForChannels(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <div>
                    <strong className="block text-slate-800">Browser Web Push</strong>
                    <span className="text-[10px] text-slate-500">Delivered to 14 active Admin consoles</span>
                  </div>
                </div>
                <span className="text-emerald-700 font-bold">SENT (0.2s)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <div>
                    <strong className="block text-slate-800">Mobile Push Notification</strong>
                    <span className="text-[10px] text-slate-500">Firebase Cloud Messaging to 6 staff devices</span>
                  </div>
                </div>
                <span className="text-emerald-700 font-bold">DELIVERED</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <div>
                    <strong className="block text-slate-800">Automated Email Alert</strong>
                    <span className="text-[10px] text-slate-500">To principal@qisschool.edu &amp; admin team</span>
                  </div>
                </div>
                <span className="text-emerald-700 font-bold">DISPATCHED</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-rose-600" />
                  <div>
                    <strong className="block text-slate-800">SMS Gateway Alert</strong>
                    <span className="text-[10px] text-slate-500">Sent via Twilio/Fast2SMS to Security Chief</span>
                  </div>
                </div>
                <span className="text-emerald-700 font-bold">CONFIRMED</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAlertForChannels(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
