import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  Flame,
  Droplets,
  Zap,
  RotateCcw,
  Menu,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Sparkles,
  Moon,
  SunMedium,
  Play,
  Pause,
  CheckCircle2,
  Thermometer,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationDrawer } from './NotificationDrawer';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    schools,
    currentSchool,
    setSchoolId,
    currentUser,
    loginAs,
    logout,
    notifications,
    campusSafetyStatus,
    soundEnabled,
    setSoundEnabled,
    triggerEmergencySimulation,
    resetSimulations,
    setActiveTab,
    theme,
    setTheme,
    demoScenario,
    setDemoScenario,
    presentationMode,
    setPresentationMode,
  } = useApp();

  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const [isSimMenuOpen, setIsSimMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Hamburger & School Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* School Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSchoolDropdownOpen(!isSchoolDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {currentSchool.name}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {currentSchool.location}
                  </div>
                </div>
              </button>

              {isSchoolDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn"
                  onMouseLeave={() => setIsSchoolDropdownOpen(false)}
                >
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Managed School
                  </div>
                  {schools.map((school) => (
                    <button
                      key={school.id}
                      onClick={() => {
                        setSchoolId(school.id);
                        setIsSchoolDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition text-xs flex flex-col gap-0.5 ${
                        school.id === currentSchool.id
                          ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="font-medium text-slate-900">{school.name}</span>
                      <span className="text-[11px] text-slate-500">{school.location}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Real-time Campus Safety Status Badge */}
          <div className="hidden md:flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm transition-all ${
                campusSafetyStatus === 'safe'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : campusSafetyStatus === 'warning'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 glow-amber'
                  : 'bg-rose-50 text-rose-800 border-rose-300 glow-red animate-pulse'
              }`}
            >
              {campusSafetyStatus === 'safe' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              )}
              <span>
                Campus Safety Status:{' '}
                <strong className="uppercase">{campusSafetyStatus}</strong>
              </span>
            </div>

            {/* IoT Gateway Status */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs border border-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Radio className="w-3 h-3 text-slate-500" />
              <span className="font-mono text-[11px]">MQTT: 48/48 Nodes Live</span>
            </div>
          </div>

          {/* Right: Demo Simulators, Audio, Notifications, Profile */}
          <div className="flex items-center gap-2">
            {/* Hackathon Live Demo Simulator Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSimMenuOpen(!isSimMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold shadow-sm transition"
                title="Simulate IoT & Safety events for hackathon demonstration"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Demo Simulator</span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              {isSimMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 text-xs animate-fadeIn"
                  onMouseLeave={() => setIsSimMenuOpen(false)}
                >
                  <div className="px-2 py-1 font-bold text-slate-800 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span>IoT Event Injection</span>
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">SIH Demo</span>
                  </div>
                  <button
                    onClick={() => {
                      triggerEmergencySimulation('smoke');
                      setIsSimMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-rose-50 text-rose-700 flex items-center gap-2 transition"
                  >
                    <Flame className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Simulate Smoke in Lab</div>
                      <div className="text-[10px] text-slate-500">Triggers optical sensor spike &amp; Alert</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      triggerEmergencySimulation('water');
                      setIsSimMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-blue-50 text-blue-700 flex items-center gap-2 transition"
                  >
                    <Droplets className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Simulate Water Leak</div>
                      <div className="text-[10px] text-slate-500">Washroom moisture near electrical panel</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      triggerEmergencySimulation('electrical');
                      setIsSimMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-amber-50 text-amber-700 flex items-center gap-2 transition"
                  >
                    <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Simulate Power Overload</div>
                      <div className="text-[10px] text-slate-500">Substation CT current trip warning</div>
                    </div>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      setDemoScenario('normal');
                      resetSimulations();
                      setIsSimMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center gap-2 transition"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Reset Campus to Baseline</span>
                  </button>
                  <button
                    onClick={() => {
                      setDemoScenario('classroom-problem');
                      setIsSimMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center gap-2 transition"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">Scenario: Classroom Problem</span>
                  </button>
                  <button
                    onClick={() => {
                      setDemoScenario('environmental-warning');
                      setIsSimMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center gap-2 transition"
                  >
                    <Thermometer className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Scenario: Environmental Warning</span>
                  </button>
                  <button
                    onClick={() => {
                      setDemoScenario('critical-alert');
                      setIsSimMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center gap-2 transition"
                  >
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span className="font-medium">Scenario: Critical Safety Alert</span>
                  </button>
                  <button
                    onClick={() => {
                      setPresentationMode(!presentationMode);
                      setIsSimMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center gap-2 transition"
                  >
                    {presentationMode ? <Pause className="w-4 h-4 text-slate-500" /> : <Play className="w-4 h-4 text-slate-500" />}
                    <span className="font-medium">{presentationMode ? 'Stop Presentation Mode' : 'Start Presentation Mode'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <SunMedium className="w-4 h-4" />}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition ${
                soundEnabled
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
              }`}
              title={soundEnabled ? 'Alert audio sound enabled' : 'Alert audio muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notifications Button */}
            <button
              id="notif-bell-btn"
              onClick={() => setIsNotifDrawerOpen(true)}
              className={`relative p-2 rounded-lg border transition-all ${
                unreadNotifCount > 0
                  ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
              title={unreadNotifCount > 0 ? `${unreadNotifCount} unread notifications` : 'Notifications'}
              aria-label={`Notifications${unreadNotifCount > 0 ? `, ${unreadNotifCount} unread` : ''}`}
            >
              <Bell className={`w-4 h-4 ${unreadNotifCount > 0 ? 'text-blue-600' : ''}`} />
              {unreadNotifCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center leading-none z-10">
                    {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                  </span>
                  <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-rose-400 rounded-full animate-ping opacity-60" />
                </>
              )}
            </button>

            {/* User Profile / Quick Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium capitalize">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 text-xs animate-fadeIn"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="p-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                    <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 capitalize">
                      {currentUser.role} Account
                    </div>
                  </div>

                  <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Role Switch (Demo)
                  </div>
                  <button
                    onClick={() => {
                      loginAs('admin');
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition ${
                      currentUser.role === 'admin' ? 'bg-blue-50 font-semibold text-blue-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                    <div>
                      <div>Dr. Arvind Sharma</div>
                      <div className="text-[10px] text-slate-400">Administrator</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      loginAs('teacher');
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition ${
                      currentUser.role === 'teacher' ? 'bg-blue-50 font-semibold text-blue-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <div>
                      <div>Priya Sharma</div>
                      <div className="text-[10px] text-slate-400">Teacher / Staff</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      loginAs('maintenance');
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition ${
                      currentUser.role === 'maintenance' ? 'bg-blue-50 font-semibold text-blue-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-amber-600" />
                    <div>
                      <div>Rajesh Kumar</div>
                      <div className="text-[10px] text-slate-400">Maintenance Lead</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification Drawer Component */}
      <NotificationDrawer isOpen={isNotifDrawerOpen} onClose={() => setIsNotifDrawerOpen(false)} />
    </>
  );
};
