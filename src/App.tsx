import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { EmergencyEscalationBanner } from './components/common/EmergencyEscalationBanner';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { LiveCampusMonitoring } from './components/monitoring/LiveCampusMonitoring';
import { CampusMap } from './components/map/CampusMap';
import { ClassroomMonitoring } from './components/classrooms/ClassroomMonitoring';
import { ClassroomProblems } from './components/problems/ClassroomProblems';
import { SurroundingsProblems } from './components/problems/SurroundingsProblems';
import { ReportProblemWizard } from './components/problems/ReportProblemWizard';
import { IssueManagement } from './components/issues/IssueManagement';
import { AlertCenter } from './components/alerts/AlertCenter';
import { EmergencyResponseCenter } from './components/emergency/EmergencyResponseCenter';
import { AiSafetyAssistant } from './components/ai/AiSafetyAssistant';
import { MaintenanceDashboard } from './components/maintenance/MaintenanceDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { IoTSensorDashboard } from './components/iot/IoTSensorDashboard';
import { AdminManagement } from './components/admin/AdminManagement';
import { ClassroomQrManagement } from './components/admin/ClassroomQrManagement';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { DemoLoginPage } from './components/auth/DemoLoginPage';
import EmergencyBanner from './components/EmergencyBanner';
import ClassroomLiveGrid from './components/dashboard/ClassroomLiveGrid';

export const AppContent: React.FC = () => {
  const { activeTab, isLoggedIn, setActiveTab } = useApp();
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [authRoute, setAuthRoute] = useState<'login' | 'demo-login'>(() => {
    return typeof window !== 'undefined' && window.location.pathname === '/demo-login' ? 'demo-login' : 'login';
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync authRoute on browser navigation
  React.useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/demo-login') {
        setAuthRoute('demo-login');
      } else {
        setAuthRoute('login');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Display pending toasts on dashboard mount
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('pending_toast');
      if (raw) {
        const parsed = JSON.parse(raw);
        sessionStorage.removeItem('pending_toast');
        setToast(parsed);
        const timer = setTimeout(() => setToast(null), 3800);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [isLoggedIn, activeTab]);

  React.useEffect(() => {
    const hasClassroomQr = new URLSearchParams(window.location.search).has('classroom');
    if (hasClassroomQr) setActiveTab('report-problem');
  }, [setActiveTab]);

  const hasPasswordResetToken = new URLSearchParams(window.location.search).has('resetToken');
  if (hasPasswordResetToken) {
    return <LoginPage />;
  }

  // If user is on landing page
  if (activeTab === 'landing') {
    return <LandingPage />;
  }

  // If user is not logged in, render LoginPage or DemoLoginPage with smooth slide animation
  if (!isLoggedIn) {
    return (
      <AnimatePresence mode="wait">
        {authRoute === 'demo-login' ? (
          <DemoLoginPage
            key="demo-login"
            onBackToLogin={() => {
              window.history.pushState(null, '', '/login');
              setAuthRoute('login');
            }}
          />
        ) : (
          <LoginPage
            key="login"
            onNavigateDemoLogin={() => {
              window.history.pushState(null, '', '/demo-login');
              setAuthRoute('demo-login');
            }}
          />
        )}
      </AnimatePresence>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MainDashboard />;
      case 'live-monitoring':
        return <LiveCampusMonitoring />;
      case 'campus-map':
        return <CampusMap />;
      case 'classrooms':
        return <ClassroomMonitoring />;
      case 'classroom-problems':
        return <ClassroomProblems />;
      case 'surroundings':
        return <SurroundingsProblems />;
      case 'report-problem':
        return <ReportProblemWizard />;
      case 'issues':
        return <IssueManagement />;
      case 'alerts':
        return <AlertCenter />;
      case 'emergency-response':
        return <EmergencyResponseCenter />;
      case 'ai-assistant':
        return <AiSafetyAssistant />;
      case 'maintenance':
        return <MaintenanceDashboard />;
      case 'teacher-reports':
        return <TeacherDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'iot-sensors':
        return <IoTSensorDashboard />;
      case 'qr-management':
        return <ClassroomQrManagement />;
      case 'admin':
        return <AdminManagement />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans relative">
      {/* Floating Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/30'
                : 'bg-rose-600 text-white border-rose-400 shadow-rose-950/30'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QIS Emergency Banner with countdown */}
      <EmergencyBanner issue="Smoke Detected in Chemistry Lab C-101" />

      {/* Top Critical Escalation Banner (Requirement 15) */}
      <EmergencyEscalationBanner />

      {/* Main Layout Container */}
      <div className="flex flex-1 min-h-0">
        {/* Collapsible Responsive Sidebar (Requirement 21 & 28) */}
        <Sidebar
          isOpen={isSidebarOpenMobile}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        {/* Right Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
            isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Header Navbar with School Selection, Safety Status, Notifications */}
          <Navbar onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)} />

          {/* Main Page View Body */}
          <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${activeTab === 'issues' ? 'max-w-[2200px]' : 'max-w-7xl'} w-full mx-auto animate-fadeIn`}>
            {/* QIS Live Classroom Monitor */}
            <div className="mb-6">
              <ClassroomLiveGrid />
            </div>
            {renderActiveView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
