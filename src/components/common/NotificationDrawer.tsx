import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  Wrench,
  FileText,
  CheckCircle2,
  Flame,
  Droplets,
  Zap,
  WifiOff,
  ClipboardList,
  ShieldAlert,
  ShieldCheck,
  Info,
  Trash2,
  Check,
  ChevronRight,
  MapPin,
  Filter,
  BellOff,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SystemNotification, NotificationType } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'unread' | 'critical' | 'maintenance' | 'safety';

// ── Icon & colour helpers ──────────────────────────────────────────────────────

function getNotifIcon(notif: SystemNotification): React.ReactNode {
  const nt = notif.notificationType;
  const t = notif.type;

  if (nt === 'fire_smoke')          return <Flame       className="w-4 h-4 text-rose-600"    />;
  if (nt === 'water_leakage')       return <Droplets    className="w-4 h-4 text-blue-600"    />;
  if (nt === 'electrical_safety')   return <Zap         className="w-4 h-4 text-amber-600"   />;
  if (nt === 'sensor_offline')      return <WifiOff     className="w-4 h-4 text-slate-500"   />;
  if (nt === 'emergency')           return <ShieldAlert className="w-4 h-4 text-rose-600"    />;
  if (nt === 'critical_safety')     return <ShieldAlert className="w-4 h-4 text-rose-600"    />;
  if (nt === 'high_priority')       return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  if (nt === 'issue_assigned')      return <Wrench      className="w-4 h-4 text-blue-600"    />;
  if (nt === 'maintenance_started') return <Wrench      className="w-4 h-4 text-indigo-600"  />;
  if (nt === 'issue_resolved')      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (nt === 'issue_verified')      return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
  if (nt === 'new_problem')         return <ClipboardList className="w-4 h-4 text-amber-600" />;

  // Fallback to legacy `type`
  if (t === 'critical') return <AlertTriangle className="w-4 h-4 text-rose-600"    />;
  if (t === 'success')  return <CheckCircle2  className="w-4 h-4 text-emerald-600" />;
  if (t === 'warning')  return <FileText      className="w-4 h-4 text-amber-600"   />;
  return                       <Info          className="w-4 h-4 text-blue-600"    />;
}

interface IconBgConfig {
  bg: string;
  border: string;
}

function getIconBg(notif: SystemNotification): IconBgConfig {
  const nt = notif.notificationType;
  const t  = notif.type;

  if (nt === 'fire_smoke' || nt === 'emergency' || nt === 'critical_safety' || t === 'critical')
    return { bg: 'bg-rose-50',    border: 'border-rose-200'    };
  if (nt === 'electrical_safety' || nt === 'high_priority' || t === 'warning')
    return { bg: 'bg-amber-50',   border: 'border-amber-200'   };
  if (nt === 'water_leakage')
    return { bg: 'bg-blue-50',    border: 'border-blue-200'    };
  if (nt === 'issue_resolved' || nt === 'issue_verified' || t === 'success')
    return { bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (nt === 'issue_assigned' || nt === 'maintenance_started')
    return { bg: 'bg-indigo-50',  border: 'border-indigo-200'  };
  if (nt === 'new_problem')
    return { bg: 'bg-amber-50',   border: 'border-amber-200'   };
  return   { bg: 'bg-slate-50',   border: 'border-slate-200'   };
}

interface PriorityConfig {
  label: string;
  dot: string;
  text: string;
}

function getPriorityConfig(priority?: string): PriorityConfig | null {
  if (!priority) return null;
  const map: Record<string, PriorityConfig> = {
    critical: { label: 'Critical', dot: 'bg-rose-500',    text: 'text-rose-600'   },
    high:     { label: 'High',     dot: 'bg-amber-500',   text: 'text-amber-600'  },
    medium:   { label: 'Medium',   dot: 'bg-blue-500',    text: 'text-blue-600'   },
    low:      { label: 'Low',      dot: 'bg-slate-400',   text: 'text-slate-500'  },
  };
  return map[priority] ?? null;
}

function getNotifTypeLabel(nt?: NotificationType): string {
  if (!nt) return 'Notification';
  const map: Record<NotificationType, string> = {
    new_problem:        'New Problem',
    critical_safety:    'Critical Safety',
    high_priority:      'High Priority',
    issue_assigned:     'Assigned',
    maintenance_started:'Maintenance',
    issue_resolved:     'Resolved',
    issue_verified:     'Verified',
    sensor_offline:     'Sensor Offline',
    fire_smoke:         'Fire / Smoke',
    electrical_safety:  'Electrical',
    water_leakage:      'Water Leak',
    emergency:          'Emergency',
    info:               'Info',
  };
  return map[nt] ?? 'Notification';
}

// ── Notification card ─────────────────────────────────────────────────────────

interface NotifCardProps {
  notif: SystemNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (notif: SystemNotification) => void;
  onAiAnalyze: (notif: SystemNotification) => void;
}

const NotifCard: React.FC<NotifCardProps> = ({ notif, onRead, onDelete, onNavigate, onAiAnalyze }) => {
  const [hovered, setHovered] = useState(false);
  const iconCfg = getIconBg(notif);
  const priorityCfg = getPriorityConfig(notif.priority);
  const isCritical = notif.priority === 'critical' || notif.type === 'critical';

  return (
    <div
      className={`
        group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer
        border transition-all duration-200
        ${!notif.read
          ? isCritical
            ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-50'
            : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50/70'
          : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
        }
      `}
      onClick={() => onNavigate(notif)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onNavigate(notif)}
      aria-label={`Notification: ${notif.title}`}
    >
      {/* Unread indicator stripe */}
      {!notif.read && (
        <div
          className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${
            isCritical ? 'bg-rose-500' : 'bg-blue-500'
          }`}
        />
      )}

      {/* Icon */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm mt-0.5 ${iconCfg.bg} ${iconCfg.border}`}
      >
        {getNotifIcon(notif)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-xs font-semibold leading-snug line-clamp-1 ${
              !notif.read ? 'text-slate-900' : 'text-slate-700'
            }`}
          >
            {notif.title}
          </h4>
          <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
            {notif.timestamp}
          </span>
        </div>

        {/* Type + Priority badges */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
            {getNotifTypeLabel(notif.notificationType)}
          </span>
          {priorityCfg && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${priorityCfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
              {priorityCfg.label}
            </span>
          )}
        </div>

        {/* Message */}
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {notif.message}
        </p>

        {/* Location */}
        {notif.relatedLocation && (
          <div className="flex items-center gap-1 mt-1.5">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-[11px] text-slate-400 truncate">{notif.relatedLocation}</span>
          </div>
        )}

        {/* Issue ID */}
        {notif.issueId && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="font-mono text-[10px] text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded font-medium">
              {notif.issueId}
            </span>
            {(notif.issueId || notif.alertId) && (
              <span className="text-[10px] text-blue-600 flex items-center gap-0.5 font-medium">
                View issue <ChevronRight className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 self-center ${
            isCritical ? 'bg-rose-500' : 'bg-blue-500'
          }`}
        />
      )}

      {/* Hover action buttons */}
      {hovered && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm px-1 py-0.5 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onAiAnalyze(notif); }}
            className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition"
            title="Analyze with AI Safety Assistant"
            aria-label="AI Safety Analysis"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          </button>
          {!notif.read && (
            <button
              onClick={(e) => { e.stopPropagation(); onRead(notif.id); }}
              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
              title="Mark as read"
              aria-label="Mark as read"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
            title="Delete notification"
            aria-label="Delete notification"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main drawer ───────────────────────────────────────────────────────────────

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    setSelectedIssueId,
    setActiveTab,
    selectForAiAnalysis,
  } = useApp();

  const [filter, setFilter] = useState<FilterType>('all');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen) drawerRef.current?.focus();
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread')      return !n.read;
    if (filter === 'critical')    return n.priority === 'critical' || n.type === 'critical';
    if (filter === 'maintenance') {
      const nt = n.notificationType;
      return nt === 'issue_assigned' || nt === 'maintenance_started' || nt === 'issue_resolved' || nt === 'issue_verified';
    }
    if (filter === 'safety') {
      const nt = n.notificationType;
      return nt === 'fire_smoke' || nt === 'water_leakage' || nt === 'electrical_safety' || nt === 'emergency' || nt === 'critical_safety' || nt === 'sensor_offline';
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalCount  = notifications.length;

  const handleNavigate = useCallback((notif: SystemNotification) => {
    markNotificationRead(notif.id);
    if (notif.issueId) {
      setSelectedIssueId(notif.issueId);
      setActiveTab('issues');
    } else if (notif.alertId || notif.notificationType === 'fire_smoke' || notif.notificationType === 'water_leakage' || notif.notificationType === 'electrical_safety' || notif.notificationType === 'emergency' || notif.notificationType === 'critical_safety') {
      setActiveTab('alerts');
    }
    onClose();
  }, [markNotificationRead, setSelectedIssueId, setActiveTab, onClose]);

  const handleAiAnalyze = useCallback((notif: SystemNotification) => {
    markNotificationRead(notif.id);
    selectForAiAnalysis({
      id: notif.issueId || notif.alertId || notif.id,
      itemType: notif.alertId ? 'alert' : notif.notificationType === 'emergency' ? 'emergency' : 'problem',
      title: notif.title,
      category: notif.relatedProblem || notif.notificationType || 'Infrastructure Safety',
      location: notif.relatedLocation || 'Campus Facility',
      description: notif.message,
      severity: notif.priority,
    });
    onClose();
  }, [markNotificationRead, selectForAiAnalysis, onClose]);

  const filterConfig: Array<{ key: FilterType; label: string; count?: number }> = [
    { key: 'all',         label: 'All',         count: totalCount  },
    { key: 'unread',      label: 'Unread',      count: unreadCount },
    { key: 'critical',    label: 'Critical'                        },
    { key: 'safety',      label: 'Safety'                          },
    { key: 'maintenance', label: 'Maintenance'                     },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Notification Center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 flex pl-10 pointer-events-none">
        <div
          ref={drawerRef}
          tabIndex={-1}
          className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col pointer-events-auto outline-none"
          style={{ animation: 'slideInRight 0.22s cubic-bezier(0.4,0,0.2,1)' }}
        >
          {/* ── Header ── */}
          <div className="px-4 py-3.5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
                    <Bell className="w-4.5 h-4.5 text-white" style={{ width: '1.1rem', height: '1.1rem' }} />
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Notification Center</h2>
                  <p className="text-[11px] text-slate-500">
                    {unreadCount > 0
                      ? <><span className="font-semibold text-blue-600">{unreadCount}</span> unread · {totalCount} total</>
                      : <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="inline w-3 h-3" /> All caught up</span>
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    id="notif-mark-all-read"
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}
                <button
                  id="notif-close-btn"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  aria-label="Close notification panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Filter pills ── */}
          <div className="flex gap-1.5 px-4 py-2.5 border-b border-slate-100 bg-white overflow-x-auto flex-shrink-0 scrollbar-hide">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 self-center" />
            {filterConfig.map(({ key, label, count }) => (
              <button
                key={key}
                id={`notif-filter-${key}`}
                onClick={() => setFilter(key)}
                className={`
                  px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1
                  ${filter === key
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {label}
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[9px] font-bold px-1 py-0.5 rounded-full leading-none ${
                      filter === key ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Notification List ── */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <BellOff className="w-8 h-8 text-slate-400 stroke-1" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications here'}
                </h3>
                <p className="text-xs text-slate-400 max-w-[200px]">
                  {filter === 'unread'
                    ? 'All notifications have been read.'
                    : `No ${filter} notifications at the moment.`
                  }
                </p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    View all notifications
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Group: unread */}
                {filteredNotifications.some(n => !n.read) && (
                  <div>
                    <div className="px-1 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Unread
                    </div>
                    {filteredNotifications.filter(n => !n.read).map(notif => (
                      <NotifCard
                        key={notif.id}
                        notif={notif}
                        onRead={markNotificationRead}
                        onDelete={deleteNotification}
                        onNavigate={handleNavigate}
                        onAiAnalyze={handleAiAnalyze}
                      />
                    ))}
                  </div>
                )}
                {/* Group: read */}
                {filteredNotifications.some(n => n.read) && (
                  <div className={filteredNotifications.some(n => !n.read) ? 'mt-3' : ''}>
                    {filteredNotifications.some(n => !n.read) && (
                      <div className="px-1 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Earlier
                      </div>
                    )}
                    {filteredNotifications.filter(n => n.read).map(notif => (
                      <NotifCard
                        key={notif.id}
                        notif={notif}
                        onRead={markNotificationRead}
                        onDelete={deleteNotification}
                        onNavigate={handleNavigate}
                        onAiAnalyze={handleAiAnalyze}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Live feed active</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="notif-view-ai-btn"
                onClick={() => { setActiveTab('ai-assistant'); onClose(); }}
                className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                AI Assistant
              </button>
              <span className="text-slate-300">|</span>
              <button
                id="notif-view-alerts-btn"
                onClick={() => { setActiveTab('alerts'); onClose(); }}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition"
              >
                Alert Center
                <ExternalLink className="w-3 h-3" />
              </button>
              <span className="text-slate-300">|</span>
              <button
                id="notif-view-issues-btn"
                onClick={() => { setActiveTab('issues'); onClose(); }}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
              >
                All Issues
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.7; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
