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
import { MaintenanceDashboard } from './components/maintenance/MaintenanceDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { IoTSensorDashboard } from './components/iot/IoTSensorDashboard';
import { AdminManagement } from './components/admin/AdminManagement';

export const AppContent: React.FC = () => {
  const { activeTab, isLoggedIn } = useApp();
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // If user is on landing page
  if (activeTab === 'landing') {
    return <LandingPage />;
  }

  // If user is not logged in, show login page
  if (!isLoggedIn) {
    return <LoginPage />;
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
      case 'maintenance':
        return <MaintenanceDashboard />;
      case 'teacher-reports':
        return <TeacherDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'iot-sensors':
        return <IoTSensorDashboard />;
      case 'admin':
        return <AdminManagement />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
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
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
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
