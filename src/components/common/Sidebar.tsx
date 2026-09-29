import React from 'react';
import {
  LayoutDashboard,
  Activity,
  MapPin,
  GraduationCap,
  AlertOctagon,
  Trees,
  PlusCircle,
  ClipboardList,
  ShieldAlert,
  Wrench,
  FileCheck2,
  BarChart3,
  Cpu,
  Users2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building,
  Sparkles,
  QrCode,
  Siren,
} from 'lucide-react';
import { useApp, ActiveTab } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const { activeTab, setActiveTab, problems, alerts, emergencies, currentUser, logout } = useApp();

  const openIssuesCount = problems.filter((p) => p.status !== 'RESOLVED' && p.status !== 'VERIFIED').length;
  const criticalAlertsCount = alerts.filter(
    (a) => a.severity === 'critical' && a.status === 'active'
  ).length;
  const activeEmergenciesCount = emergencies.filter(
    (e) => e.status !== 'Resolved' && e.status !== 'Verified'
  ).length;

  const navItems = [
    {
      tab: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'supervisor'],
    },
    {
      tab: 'live-monitoring' as ActiveTab,
      label: 'Live Monitoring',
      icon: Activity,
      badge: 'Live',
      badgeColor: 'bg-emerald-500 text-white',
      roles: ['admin', 'supervisor', 'maintenance', 'teacher'],
    },
    {
      tab: 'campus-map' as ActiveTab,
      label: 'Campus Map',
      icon: MapPin,
      roles: ['admin', 'supervisor', 'maintenance', 'teacher'],
    },
    {
      tab: 'classrooms' as ActiveTab,
      label: 'Classrooms',
      icon: GraduationCap,
      roles: ['admin', 'supervisor', 'teacher'],
    },
    {
      tab: 'classroom-problems' as ActiveTab,
      label: 'Classroom Problems',
      icon: AlertOctagon,
      roles: ['admin', 'teacher', 'supervisor'],
    },
    {
      tab: 'surroundings' as ActiveTab,
      label: 'School Surroundings',
      icon: Trees,
      roles: ['admin', 'supervisor', 'teacher', 'maintenance'],
    },
    {
      tab: 'report-problem' as ActiveTab,
      label: 'Report Problem',
      icon: PlusCircle,
      highlight: true,
      roles: ['admin', 'teacher', 'maintenance', 'supervisor'],
    },
    {
      tab: 'issues' as ActiveTab,
      label: 'Issue Management',
      icon: ClipboardList,
      badge: openIssuesCount > 0 ? String(openIssuesCount) : undefined,
      badgeColor: 'bg-blue-600 text-white',
      roles: ['admin', 'supervisor'],
    },
    {
      tab: 'alerts' as ActiveTab,
      label: 'Safety Alert Center',
      icon: ShieldAlert,
      badge: criticalAlertsCount > 0 ? String(criticalAlertsCount) : undefined,
      badgeColor: 'bg-rose-600 text-white animate-pulse',
      roles: ['admin', 'supervisor', 'maintenance', 'teacher'],
    },
    {
      tab: 'emergency-response' as ActiveTab,
      label: 'Emergency Response',
      icon: Siren,
      badge: activeEmergenciesCount > 0 ? String(activeEmergenciesCount) : undefined,
      badgeColor: 'bg-rose-600 text-white animate-pulse',
      roles: ['admin', 'supervisor', 'maintenance', 'teacher'],
    },
    {
      tab: 'ai-assistant' as ActiveTab,
      label: 'AI Safety Assistant',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold',
      roles: ['admin', 'supervisor', 'maintenance', 'teacher'],
    },
    {
      tab: 'maintenance' as ActiveTab,
      label: 'Maintenance Staff',
      icon: Wrench,
      roles: ['admin', 'maintenance', 'supervisor'],
    },
    {
      tab: 'teacher-reports' as ActiveTab,
      label: 'Teacher Dashboard',
      icon: FileCheck2,
      roles: ['admin', 'teacher'],
    },
    {
      tab: 'analytics' as ActiveTab,
      label: 'Analytics & Risk',
      icon: BarChart3,
      roles: ['admin', 'supervisor'],
    },
    {
      tab: 'iot-sensors' as ActiveTab,
      label: 'IoT Sensors',
      icon: Cpu,
      roles: ['admin', 'supervisor', 'maintenance'],
    },
    {
      tab: 'qr-management' as ActiveTab,
      label: 'Classroom QR Codes',
      icon: QrCode,
      roles: ['admin'],
    },
    {
      tab: 'admin' as ActiveTab,
      label: 'Admin Management',
      icon: Users2,
      roles: ['admin'],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-3 cursor-pointer overflow-hidden ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Building className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1">
                  SMART SCHOOL
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </span>
                <span className="text-[10px] text-blue-400 font-medium block truncate">
                  Infrastructure &amp; Safety
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg hidden lg:block transition"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Button */}
        {isCollapsed && (
          <div className="py-2 flex justify-center hidden lg:flex border-b border-slate-800">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;

            return (
              <button
                key={item.tab}
                onClick={() => {
                  setActiveTab(item.tab);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  item.highlight
                    ? isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 font-semibold'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate text-left flex-1">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed badge dot */}
                {isCollapsed && item.badge && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer / User Role Info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize truncate">{currentUser.role} View</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
