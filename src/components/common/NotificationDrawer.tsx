import React, { useState } from 'react';
import { X, Check, Bell, AlertTriangle, Wrench, FileText, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setSelectedIssueId, setActiveTab } = useApp();
  const [filter, setFilter] = useState<'all' | 'critical' | 'task' | 'report'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'critical') return n.type === 'critical';
    if (filter === 'task') return n.title.toLowerCase().includes('task') || n.title.toLowerCase().includes('assigned');
    if (filter === 'report') return n.title.toLowerCase().includes('report') || n.title.toLowerCase().includes('problem');
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string, title: string) => {
    if (type === 'critical') return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    if (title.toLowerCase().includes('resolved')) return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    if (title.toLowerCase().includes('task')) return <Wrench className="w-4 h-4 text-blue-600" />;
    return <FileText className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Notifications</h3>
                <p className="text-xs text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} unread alerts & activities` : 'All caught up'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 p-3 border-b border-slate-100 bg-white text-xs">
            {(['all', 'critical', 'task', 'report'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-full capitalize font-medium transition ${
                  filter === tab
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'critical' ? 'Alerts' : tab}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-10 h-10 mx-auto stroke-1 mb-2 opacity-40" />
                <p className="text-sm font-medium">No notifications in this filter</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.issueId) {
                      setSelectedIssueId(notif.issueId);
                    }
                    onClose();
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition hover:bg-slate-50 flex items-start gap-3 my-1 ${
                    !notif.read ? 'bg-blue-50/60 border border-blue-100' : ''
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-sm mt-0.5">
                    {getIcon(notif.type, notif.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold text-slate-800 truncate">{notif.title}</h4>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                    {notif.issueId && (
                      <span className="inline-block mt-1 font-mono text-[10px] text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded font-medium">
                        {notif.issueId}
                      </span>
                    )}
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 self-center flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
            <span>Real-time WebSocket feed active</span>
            <button
              onClick={() => {
                setActiveTab('alerts');
                onClose();
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View Alert Center →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
