import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Phone,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sparkles,
  Search,
  Filter,
  Trash2,
  PhoneCall,
  RotateCcw,
  ExternalLink,
  Navigation,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  getSosAlerts,
  markSosAlertResolved,
  createSosAlert,
  clearAllSosAlerts,
  triggerVibration,
} from '../../services/sosService';
import { SosAlert } from '../../types';

export const SecurityDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCallModal, setActiveCallModal] = useState<SosAlert | null>(null);

  // Sync SOS alerts from localStorage
  const refreshAlerts = () => {
    setAlerts(getSosAlerts());
  };

  useEffect(() => {
    refreshAlerts();

    // Listen to real-time custom events from other components
    const handleUpdate = () => {
      refreshAlerts();
    };

    window.addEventListener('sosAlertsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('sosAlertsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleResolve = (alertId: string) => {
    triggerVibration(100);
    markSosAlertResolved(alertId);
    refreshAlerts();
  };

  const handleCreateDemoAlert = () => {
    triggerVibration([150, 100, 150]);
    createSosAlert('Kavya Sharma (Student B.Tech CSE)', '+91 98765 43210');
    refreshAlerts();
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all SOS alert history?')) {
      clearAllSosAlerts();
      refreshAlerts();
    }
  };

  const activeCount = alerts.filter((a) => a.status === 'Active').length;
  const resolvedCount = alerts.filter((a) => a.status === 'Resolved').length;

  const filteredAlerts = alerts
    .filter((a) => {
      if (filter === 'active') return a.status === 'Active';
      if (filter === 'resolved') return a.status === 'Resolved';
      return true;
    })
    .filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.studentName.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.time.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glowing background */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Security Command &amp; SOS Center
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    LIVE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Real-time QIS Campus Emergency Dispatch, Location Tracking &amp; Student Safety Coordination
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons: Trigger Demo Alert & Presentation Tools */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="security-demo-alert-btn"
              onClick={handleCreateDemoAlert}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/25 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Trigger Demo SOS Alert</span>
            </button>

            {alerts.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                title="Clear all alerts"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">Active SOS Alerts</span>
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-red-700 dark:text-red-400 mt-1">
              {activeCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved Incidents</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {resolvedCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Avg Security Response</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 mt-1">
              2.4 min
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Campus Patrol Status</span>
            <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              On Duty (Block A-D)
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>All Alerts</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
              {alerts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              filter === 'active'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>Active</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              filter === 'resolved'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Resolved</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
              {resolvedCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student or location..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* SOS Alerts Real-Time List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              No Emergency Alerts Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {filter === 'active'
                ? 'All campus sectors report nominal status. No active SOS triggers at this moment.'
                : 'No alerts match your filter criteria. You can generate a demo SOS alert for testing.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateDemoAlert}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Presentation Demo Alert</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAlerts.map((alert) => {
              const isActive = alert.status === 'Active';
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`relative rounded-3xl border-2 transition-all overflow-hidden ${
                    isActive
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 shadow-xl shadow-red-600/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm opacity-90'
                  }`}
                >
                  {/* Active Indicator Top Stripe */}
                  {isActive && (
                    <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-pulse" />
                  )}

                  <div className="p-5 sm:p-6 flex flex-col lg:flex-row gap-6 items-stretch justify-between">
                    {/* Left: Incident Details */}
                    <div className="flex-1 space-y-4">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-red-600 text-white shadow-sm shadow-red-600/40 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                🚨 ACTIVE EMERGENCY
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                RESOLVED
                              </>
                            )}
                          </span>

                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            ID: {alert.id.slice(0, 16)}
                          </span>
                        </div>

                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {alert.time}
                        </span>
                      </div>

                      {/* Student & Incident Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* Student Details */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Student / User
                          </span>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                {alert.studentName}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                {alert.studentPhone || '+91 98765 43210'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Location Details */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Incident Location
                          </span>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                {alert.location}
                              </p>
                              <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-0.5 flex items-center gap-1">
                                <Compass className="w-3 h-3" />
                                GPS Coords: {alert.gps || '15.5057° N, 80.0499° E'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Resolution Timestamp if resolved */}
                      {alert.resolvedAt && (
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Marked resolved at {alert.resolvedAt} by Security Officer
                        </div>
                      )}

                      {/* Action Buttons: Mark as Resolved & Call Student */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {isActive ? (
                          <button
                            type="button"
                            onClick={() => handleResolve(alert.id)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/25 active:scale-95"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark as Resolved</span>
                          </button>
                        ) : (
                          <span className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Incident Closed
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setActiveCallModal(alert)}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/25 active:scale-95"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call Student</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Map Placeholder Image Showing Location (Requirement 4) */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white aspect-[16/10] sm:aspect-[16/9] shadow-inner flex flex-col justify-between p-3 select-none">
                        {/* Stylized Campus Map SVG Blueprint */}
                        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 240 140" fill="none">
                          {/* Campus Roads & Boundaries */}
                          <rect x="10" y="10" width="220" height="120" rx="8" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                          <path d="M 10 70 L 230 70" stroke="#334155" strokeWidth="6" />
                          <path d="M 120 10 L 120 130" stroke="#334155" strokeWidth="6" />
                          
                          {/* Block A */}
                          <rect x="25" y="25" width="45" height="35" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                          <text x="47" y="45" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">BLOCK A</text>

                          {/* Block B (Emergency Location) */}
                          <rect x="140" y="25" width="55" height="35" rx="4" fill="#3f1d24" stroke="#ef4444" strokeWidth="1.5" />
                          <text x="167" y="45" fill="#fca5a5" fontSize="8" textAnchor="middle" fontWeight="bold">BLOCK B</text>

                          {/* Block C */}
                          <rect x="25" y="85" width="45" height="35" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                          <text x="47" y="105" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">BLOCK C</text>

                          {/* Block D */}
                          <rect x="140" y="85" width="55" height="35" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                          <text x="167" y="105" fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">BLOCK D</text>

                          {/* Emergency Pulsing Radar Rings on Block B */}
                          <circle cx="167" cy="42" r="14" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                          <circle cx="167" cy="42" r="6" fill="#dc2626" />
                        </svg>

                        {/* Top Label */}
                        <div className="relative flex items-center justify-between text-[10px] font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white border border-white/20 flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-red-400" />
                            CAMPUS GPS RADAR
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-white font-mono">
                            ZONE: B-2
                          </span>
                        </div>

                        {/* Bottom Coordinates & Location Overlay */}
                        <div className="relative bg-slate-950/80 backdrop-blur-md rounded-xl p-2 border border-slate-800 text-[11px]">
                          <p className="font-bold text-red-300 flex items-center gap-1 truncate">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                            Target: QIS Block B, 2nd Floor
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                            GPS: 15.5057° N, 80.0499° E
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Call Student Confirmation Modal */}
      <AnimatePresence>
        {activeCallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCallModal(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <PhoneCall className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Emergency Call Dispatch
                  </h3>
                  <p className="text-xs text-slate-500">Contacting student via campus telecom</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeCallModal.studentName}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">
                  {activeCallModal.studentPhone || '+91 98765 43210'}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Location: {activeCallModal.location}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${activeCallModal.studentPhone || '9876543210'}`}
                  onClick={() => setActiveCallModal(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm text-center shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Dial Now</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveCallModal(null)}
                  className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
