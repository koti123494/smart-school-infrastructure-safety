import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  School,
  Building,
  Classroom,
  IoTSensor,
  ProblemReport,
  SafetyAlert,
  MaintenanceTeam,
  SystemNotification,
  RecurringProblemInsight,
  User,
  UserRole,
  IssueStatus,
  PriorityLevel,
} from '../types';
import {
  INITIAL_SCHOOLS,
  INITIAL_USERS,
  INITIAL_BUILDINGS,
  INITIAL_CLASSROOMS,
  INITIAL_SENSORS,
  INITIAL_PROBLEMS,
  INITIAL_ALERTS,
  INITIAL_MAINTENANCE_TEAMS,
  INITIAL_NOTIFICATIONS,
  RECURRING_PROBLEMS,
} from '../data/initialData';

export type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'live-monitoring'
  | 'campus-map'
  | 'classrooms'
  | 'classroom-problems'
  | 'surroundings'
  | 'report-problem'
  | 'issues'
  | 'alerts'
  | 'maintenance'
  | 'teacher-reports'
  | 'analytics'
  | 'iot-sensors'
  | 'admin';

interface AppContextType {
  schools: School[];
  currentSchool: School;
  setSchoolId: (id: string) => void;
  currentUser: User;
  isLoggedIn: boolean;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  buildings: Building[];
  classrooms: Classroom[];
  sensors: IoTSensor[];
  problems: ProblemReport[];
  alerts: SafetyAlert[];
  notifications: SystemNotification[];
  teams: MaintenanceTeam[];
  recurringInsights: RecurringProblemInsight[];

  // Drilldown states
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  selectedClassroomId: string | null;
  setSelectedClassroomId: (id: string | null) => void;
  selectedBuildingId: string | null;
  setSelectedBuildingId: (id: string | null) => void;

  // Actions
  addProblemReport: (report: Omit<ProblemReport, 'id' | 'issueId' | 'history' | 'reportedDate' | 'reportedTime' | 'status'>) => ProblemReport;
  updateIssueStatus: (issueId: string, newStatus: IssueStatus, notes?: string, assignedToId?: string) => void;
  assignIssue: (issueId: string, teamId: string, technicianName: string) => void;
  resolveIssue: (issueId: string, resolutionNotes: string, afterImage?: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  triggerEmergencySimulation: (type: 'smoke' | 'water' | 'electrical') => void;
  resetSimulations: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  addSensor: (sensor: Omit<IoTSensor, 'id'>) => void;

  // Sound alert toggle
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playAlertTone: (type?: 'beep' | 'success') => void;

  // Overall campus health status
  campusSafetyStatus: 'safe' | 'warning' | 'critical';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'smart_school_sys_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [schools] = useState<School[]>(INITIAL_SCHOOLS);
  const [currentSchoolId, setCurrentSchoolId] = useState<string>('sch-qis-01');

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Logged in by default for seamless demo
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [sensors, setSensors] = useState<IoTSensor[]>(INITIAL_SENSORS);
  const [problems, setProblems] = useState<ProblemReport[]>(INITIAL_PROBLEMS);
  const [alerts, setAlerts] = useState<SafetyAlert[]>(INITIAL_ALERTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [teams, setTeams] = useState<MaintenanceTeam[]>(INITIAL_MAINTENANCE_TEAMS);
  const [recurringInsights] = useState<RecurringProblemInsight[]>(RECURRING_PROBLEMS);

  // Modal selections
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // Sound alert
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const currentSchool = useMemo(() => {
    return schools.find((s) => s.id === currentSchoolId) || schools[0];
  }, [schools, currentSchoolId]);

  // Overall Campus Safety Status computed from active alerts & critical sensors
  const campusSafetyStatus = useMemo<'safe' | 'warning' | 'critical'>(() => {
    const hasActiveCritical = alerts.some((a) => a.severity === 'critical' && a.status !== 'resolved');
    if (hasActiveCritical) return 'critical';
    const hasActiveWarning = alerts.some((a) => a.severity === 'warning' && a.status !== 'resolved');
    if (hasActiveWarning) return 'warning';
    return 'safe';
  }, [alerts]);

  // Web Audio synthesizer for alert sound
  const playAlertTone = useCallback(
    (type: 'beep' | 'success' = 'beep') => {
      if (!soundEnabled) return;
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'beep') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (e) {
        console.warn('Audio playback error', e);
      }
    },
    [soundEnabled]
  );

  // Role login helper
  const loginAs = useCallback(
    (role: UserRole) => {
      const found = users.find((u) => u.role === role) || users[0];
      setCurrentUser(found);
      setIsLoggedIn(true);

      // Route to role-specific default view
      if (role === 'maintenance') {
        setActiveTab('maintenance');
      } else if (role === 'teacher') {
        setActiveTab('teacher-reports');
      } else {
        setActiveTab('dashboard');
      }
    },
    [users]
  );

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setActiveTab('landing');
  }, []);

  // Periodic subtle sensor jitter simulation (IoT alive effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prev) =>
        prev.map((s) => {
          if (s.status === 'offline') return s;
          if (s.type === 'temperature') {
            const jitter = (Math.random() - 0.5) * 0.4;
            const newNumeric = Math.round((s.numericValue + jitter) * 10) / 10;
            return {
              ...s,
              numericValue: newNumeric,
              currentValue: `${newNumeric.toFixed(1)}°C`,
              lastUpdated: 'Just now',
            };
          }
          if (s.type === 'electrical' && s.unit === 'A') {
            const jitter = (Math.random() - 0.5) * 0.2;
            const newNumeric = Math.max(1, Math.round((s.numericValue + jitter) * 10) / 10);
            return {
              ...s,
              numericValue: newNumeric,
              currentValue: `${newNumeric.toFixed(1)}A (${newNumeric > 20 ? 'Warning' : 'Balanced'})`,
              lastUpdated: 'Just now',
            };
          }
          return s;
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Escalation timer countdown for active critical alerts
  useEffect(() => {
    const timer = setInterval(() => {
      setAlerts((prevAlerts) =>
        prevAlerts.map((alt) => {
          if (alt.status === 'active' && alt.escalationTimerSeconds > 0) {
            const nextSecs = alt.escalationTimerSeconds - 1;
            // When timer hits 0, escalate to Level 3 if still Level 2
            if (nextSecs === 0 && alt.escalationLevel === 2) {
              return {
                ...alt,
                escalationLevel: 3,
                escalationTimerSeconds: 0,
                message: `[ESCALATED TO LEVEL 3] Unresolved after SLA limit. Emergency contacts & School Board notified: ${alt.message}`,
              };
            }
            return {
              ...alt,
              escalationTimerSeconds: nextSecs,
            };
          }
          return alt;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Add problem report
  const addProblemReport = useCallback(
    (reportData: Omit<ProblemReport, 'id' | 'issueId' | 'history' | 'reportedDate' | 'reportedTime' | 'status'>): ProblemReport => {
      const randomSeq = Math.floor(100 + Math.random() * 900);
      const issueId = `SCH-2026-00${randomSeq}`;
      const newId = `pr-${Date.now()}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

      // Auto-assign matching team based on category
      let assignedTeamName = 'General Maintenance & Housekeeping';
      let assignedTechName = 'Suresh Kumar';
      const cat = reportData.category.toLowerCase();
      if (cat.includes('fan') || cat.includes('light') || cat.includes('electrical')) {
        assignedTeamName = 'Electrical Team';
        assignedTechName = 'Rajesh Kumar';
      } else if (cat.includes('water') || cat.includes('drainage') || cat.includes('plumbing') || cat.includes('tap')) {
        assignedTeamName = 'Plumbing Team';
        assignedTechName = 'M. Nagaraju';
      } else if (cat.includes('desk') || cat.includes('chair') || cat.includes('ceiling') || cat.includes('wall') || cat.includes('door') || cat.includes('playground')) {
        assignedTeamName = 'Civil & Structural Team';
        assignedTechName = 'Anil Babu';
      } else if (cat.includes('smart') || cat.includes('projector') || cat.includes('wi-fi') || cat.includes('internet')) {
        assignedTeamName = 'IT & Smart Hardware Team';
        assignedTechName = 'Pradeep Chary';
      }

      const newReport: ProblemReport = {
        ...reportData,
        id: newId,
        issueId,
        reportedDate: dateStr,
        reportedTime: timeStr,
        status: 'REPORTED',
        assignedTo: {
          id: `tech-${Date.now()}`,
          name: assignedTechName,
          team: assignedTeamName,
          assignedDate: `${dateStr}, ${timeStr}`,
        },
        history: [
          {
            id: `h-${Date.now()}`,
            status: 'REPORTED',
            timestamp: timeStr,
            updatedBy: `${reportData.reportedBy.name} (${reportData.reportedBy.role})`,
            comment: 'Problem submitted via Smart School Infrastructure Portal.',
          },
          {
            id: `h-${Date.now() + 1}`,
            status: 'ASSIGNED',
            timestamp: timeStr,
            updatedBy: 'Automated Dispatch System',
            comment: `Auto-routed to ${assignedTeamName} (${assignedTechName}) based on domain specialty.`,
          },
        ],
      };

      setProblems((prev) => [newReport, ...prev]);

      // If priority is critical, trigger an alert too
      if (reportData.priority === 'critical') {
        const newAlert: SafetyAlert = {
          id: `alt-${Date.now()}`,
          alertCode: `ALT-CRIT-${Math.floor(100 + Math.random() * 899)}`,
          title: `CRITICAL: ${reportData.title}`,
          message: `${reportData.description} at ${reportData.exactLocation}`,
          location: reportData.exactLocation,
          building: reportData.building,
          severity: 'critical',
          timestamp: timeStr,
          source: 'Staff Report',
          problemId: newId,
          isAcknowledged: false,
          escalationLevel: 1,
          escalationTimerSeconds: 120,
          status: 'active',
        };
        setAlerts((prev) => [newAlert, ...prev]);
        playAlertTone('beep');
      } else {
        playAlertTone('success');
      }

      // Add system notification
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: 'New Problem Report',
        message: `${reportData.title} logged for ${reportData.exactLocation} (${issueId}).`,
        type: reportData.priority === 'critical' ? 'critical' : 'warning',
        timestamp: 'Just now',
        read: false,
        issueId,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      return newReport;
    },
    [playAlertTone]
  );

  // Update status (e.g. REPORTED -> ASSIGNED -> IN PROGRESS -> RESOLVED)
  const updateIssueStatus = useCallback((issueId: string, newStatus: IssueStatus, notes?: string, assignedToId?: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setProblems((prev) =>
      prev.map((p) => {
        if (p.issueId === issueId || p.id === issueId) {
          const updatedHistory = [
            ...p.history,
            {
              id: `h-${Date.now()}`,
              status: newStatus,
              timestamp: timeStr,
              updatedBy: 'Facility Operations',
              comment: notes || `Status transitioned to ${newStatus}.`,
            },
          ];
          return {
            ...p,
            status: newStatus,
            maintenanceNotes: notes ? (p.maintenanceNotes ? `${p.maintenanceNotes}\n${notes}` : notes) : p.maintenanceNotes,
            history: updatedHistory,
          };
        }
        return p;
      })
    );
  }, []);

  // Assign issue
  const assignIssue = useCallback((issueId: string, teamId: string, technicianName: string) => {
    const team = teams.find((t) => t.id === teamId);
    const teamName = team ? team.name : 'Maintenance Team';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setProblems((prev) =>
      prev.map((p) => {
        if (p.issueId === issueId || p.id === issueId) {
          return {
            ...p,
            status: 'ASSIGNED',
            assignedTo: {
              id: `tech-${Date.now()}`,
              name: technicianName,
              team: teamName,
              assignedDate: `Today, ${timeStr}`,
            },
            history: [
              ...p.history,
              {
                id: `h-${Date.now()}`,
                status: 'ASSIGNED',
                timestamp: timeStr,
                updatedBy: 'Administrator',
                comment: `Assigned directly to ${technicianName} (${teamName}).`,
              },
            ],
          };
        }
        return p;
      })
    );
  }, [teams]);

  // Resolve issue
  const resolveIssue = useCallback((issueId: string, resolutionNotes: string, afterImage?: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    setProblems((prev) =>
      prev.map((p) => {
        if (p.issueId === issueId || p.id === issueId) {
          return {
            ...p,
            status: 'RESOLVED',
            resolutionNotes,
            afterImage: afterImage || p.afterImage,
            resolvedAt: `${dateStr}, ${timeStr}`,
            history: [
              ...p.history,
              {
                id: `h-${Date.now()}`,
                status: 'RESOLVED',
                timestamp: timeStr,
                updatedBy: 'Maintenance Technician',
                comment: `Marked resolved: ${resolutionNotes}`,
              },
            ],
          };
        }
        return p;
      })
    );

    // Also resolve matching alert if any
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.problemId === issueId || a.message.includes(issueId)) {
          return { ...a, status: 'resolved' };
        }
        return a;
      })
    );

    playAlertTone('success');
  }, [playAlertTone]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            isAcknowledged: true,
            acknowledgedBy: `${currentUser.name} (${currentUser.role})`,
            status: 'acknowledged',
          };
        }
        return a;
      })
    );
  }, [currentUser]);

  // Resolve alert
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            status: 'resolved',
            isAcknowledged: true,
          };
        }
        return a;
      })
    );
  }, []);

  // Emergency simulation trigger for hackathon/presentation
  const triggerEmergencySimulation = useCallback((type: 'smoke' | 'water' | 'electrical') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (type === 'smoke') {
      const smokeAlert: SafetyAlert = {
        id: `alt-sim-${Date.now()}`,
        alertCode: `ALT-SMK-${Math.floor(100 + Math.random() * 899)}`,
        title: 'Smoke detected in Chemistry Laboratory',
        message: 'Optical smoke sensor SMK-202 recorded acute particle spike (74 ppm). Immediate evacuation recommended.',
        location: 'Science Block → Chemistry Lab 2',
        building: 'Science Block',
        severity: 'critical',
        timestamp: timeStr,
        source: 'IoT Sensor',
        sensorId: 'SMK-202',
        isAcknowledged: false,
        escalationLevel: 1,
        escalationTimerSeconds: 120,
        status: 'active',
      };
      setAlerts((prev) => [smokeAlert, ...prev]);

      // Update sensor value
      setSensors((prev) =>
        prev.map((s) =>
          s.sensorCode === 'SMK-202'
            ? { ...s, currentValue: 'DENSE SMOKE (74 ppm)', numericValue: 74, status: 'critical', lastUpdated: 'Just now' }
            : s
        )
      );

      // Add notification
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'CRITICAL SAFETY ALARM',
          message: 'Dense smoke detected in Chemistry Lab 2. Level 1 protocol initiated.',
          type: 'critical',
          timestamp: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    } else if (type === 'water') {
      const waterAlert: SafetyAlert = {
        id: `alt-sim-${Date.now()}`,
        alertCode: `ALT-WTR-${Math.floor(100 + Math.random() * 899)}`,
        title: 'Water leakage detected near Electrical Room',
        message: 'Floor probe WTR-303 registered active liquid conductance near substation distribution board.',
        location: 'Electrical Room / Block B Corridor Junction',
        building: 'Electrical Room',
        severity: 'critical',
        timestamp: timeStr,
        source: 'IoT Sensor',
        sensorId: 'WTR-303',
        isAcknowledged: false,
        escalationLevel: 1,
        escalationTimerSeconds: 120,
        status: 'active',
      };
      setAlerts((prev) => [waterAlert, ...prev]);

      setSensors((prev) =>
        prev.map((s) =>
          s.sensorCode === 'WTR-303'
            ? { ...s, currentValue: 'ACTIVE LIQUID FLOW', numericValue: 1, status: 'critical', lastUpdated: 'Just now' }
            : s
        )
      );
    } else if (type === 'electrical') {
      const elecAlert: SafetyAlert = {
        id: `alt-sim-${Date.now()}`,
        alertCode: `ALT-ELE-${Math.floor(100 + Math.random() * 899)}`,
        title: 'Thermal & Current Overload in Substation Feeder 2',
        message: 'Current exceeded 34.5A threshold with 48°C busbar temperature.',
        location: 'Central Substation Room',
        building: 'Electrical Room',
        severity: 'warning',
        timestamp: timeStr,
        source: 'IoT Sensor',
        sensorId: 'ELE-404',
        isAcknowledged: false,
        escalationLevel: 1,
        escalationTimerSeconds: 180,
        status: 'active',
      };
      setAlerts((prev) => [elecAlert, ...prev]);

      setSensors((prev) =>
        prev.map((s) =>
          s.sensorCode === 'ELE-404'
            ? { ...s, currentValue: '34.8A (OVERLOAD)', numericValue: 34.8, status: 'warning', lastUpdated: 'Just now' }
            : s
        )
      );
    }

    playAlertTone('beep');
  }, [playAlertTone]);

  const resetSimulations = useCallback(() => {
    setAlerts(INITIAL_ALERTS);
    setSensors(INITIAL_SENSORS);
    setClassrooms(INITIAL_CLASSROOMS);
    setProblems(INITIAL_PROBLEMS);
    playAlertTone('success');
  }, [playAlertTone]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    };
    setUsers((prev) => [...prev, newUser]);
  }, []);

  const addSensor = useCallback((sensorData: Omit<IoTSensor, 'id'>) => {
    const newSensor: IoTSensor = {
      ...sensorData,
      id: `sns-${Date.now()}`,
    };
    setSensors((prev) => [...prev, newSensor]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        schools,
        currentSchool,
        setSchoolId: setCurrentSchoolId,
        currentUser,
        isLoggedIn,
        loginAs,
        logout,
        activeTab,
        setActiveTab,
        buildings,
        classrooms,
        sensors,
        problems,
        alerts,
        notifications,
        teams,
        recurringInsights,
        selectedIssueId,
        setSelectedIssueId,
        selectedClassroomId,
        setSelectedClassroomId,
        selectedBuildingId,
        setSelectedBuildingId,
        addProblemReport,
        updateIssueStatus,
        assignIssue,
        resolveIssue,
        acknowledgeAlert,
        resolveAlert,
        triggerEmergencySimulation,
        resetSimulations,
        markNotificationRead,
        markAllNotificationsRead,
        addUser,
        addSensor,
        soundEnabled,
        setSoundEnabled,
        playAlertTone,
        campusSafetyStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
