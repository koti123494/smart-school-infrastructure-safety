import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
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
  NotificationType,
  EmergencyIncident,
  EmergencyResponseTeam,
  EmergencyStatus,
  EmergencyType,
  EmergencyTimelineEntry,
  AiSafetyAnalysis,
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
  INITIAL_EMERGENCY_TEAMS,
  INITIAL_EMERGENCIES,
} from '../data/initialData';
import { apiBaseUrl, apiGet, apiPatch, apiPost, apiPut, getApiToken, storeApiToken, type ApiUser } from '../data/api';
import { mapApiAlert, mapApiEmergency, mapApiIssue, mapApiNotification, mapApiUser } from '../data/apiMapping';

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
  | 'emergency-response'
  | 'ai-assistant'
  | 'maintenance'
  | 'teacher-reports'
  | 'analytics'
  | 'iot-sensors'
  | 'qr-management'
  | 'admin'
  | 'security';

interface AppContextType {
  schools: School[];
  currentSchool: School;
  setSchoolId: (id: string) => void;
  currentUser: User;
  isLoggedIn: boolean;
  loginAs: (role: UserRole) => void;
  loginWithApiUser: (user: ApiUser) => void;
  logout: () => void;
  backendConnected: boolean;
  refreshLiveData: () => Promise<void>;
  liveAnalytics: {
    total: number; open: number; critical: number; resolved: number; averageHours: number | null;
    byLocation: Array<{ location: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
  } | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  prefersReducedMotion: boolean;
  aiAssistantResponse: { title: string; possibleCause: string; risk: string; recommendedAction: string; priority: string; maintenanceSuggestion: string; demoMode: boolean; } | null;
  generateAiAdvice: (problem: { title: string; description: string; location: string; category: string; severity?: string }) => void;
  // AI Safety Assistant
  currentAiAnalysis: AiSafetyAnalysis | null;
  isAiAnalyzing: boolean;
  aiAnalysisError: string | null;
  selectedAiItem: { id?: string; itemType?: 'problem' | 'alert' | 'emergency'; title: string; category: string; location: string; description: string; severity?: string; imageUrl?: string } | null;
  selectForAiAnalysis: (item: { id?: string; itemType?: 'problem' | 'alert' | 'emergency'; title: string; category: string; location: string; description: string; severity?: string; imageUrl?: string }) => void;
  runAiSafetyAnalysis: (item: { id?: string; itemType?: 'problem' | 'alert' | 'emergency'; title: string; category: string; location: string; description: string; severity?: string; imageUrl?: string }) => Promise<AiSafetyAnalysis | null>;
  simulateAiQuotaError: boolean;
  setSimulateAiQuotaError: (simulate: boolean) => void;
  demoScenario: 'normal' | 'classroom-problem' | 'environmental-warning' | 'critical-alert';
  setDemoScenario: (scenario: 'normal' | 'classroom-problem' | 'environmental-warning' | 'critical-alert') => void;
  presentationMode: boolean;
  setPresentationMode: (enabled: boolean) => void;

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
  addProblemReport: (report: Omit<ProblemReport, 'id' | 'issueId' | 'history' | 'reportedDate' | 'reportedTime' | 'status'>, localOnly?: boolean) => ProblemReport;
  updateIssueStatus: (issueId: string, newStatus: IssueStatus, notes?: string, assignedToId?: string) => void;
  assignIssue: (issueId: string, teamId: string, technicianName: string) => void;
  resolveIssue: (issueId: string, resolutionNotes: string, afterImage?: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  triggerEmergencySimulation: (type: 'smoke' | 'water' | 'electrical') => void;
  resetSimulations: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  addSensor: (sensor: Omit<IoTSensor, 'id'>) => void;

  // Sound alert toggle
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playAlertTone: (type?: 'beep' | 'success') => void;

  // Overall campus health status
  campusSafetyStatus: 'safe' | 'warning' | 'critical';

  // Emergency Response Center
  emergencies: EmergencyIncident[];
  emergencyTeams: EmergencyResponseTeam[];
  addEmergency: (data: Omit<EmergencyIncident, 'id' | 'emergencyCode' | 'timeline' | 'reportedAt' | 'reportedAtMs' | 'status'>) => EmergencyIncident;
  acknowledgeEmergency: (id: string, note?: string) => void;
  assignEmergencyTeam: (id: string, teamId: string) => void;
  updateEmergencyStatus: (id: string, status: EmergencyStatus, note?: string) => void;
  resolveEmergency: (id: string, notes: string) => void;
  verifyEmergency: (id: string) => void;
  triggerDemoEmergency: (type: 'fire' | 'electrical' | 'water' | 'medical') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'smart_school_sys_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [schools] = useState<School[]>(INITIAL_SCHOOLS);
  const [currentSchoolId, setCurrentSchoolId] = useState<string>('sch-qis-01');

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [liveAnalytics, setLiveAnalytics] = useState<AppContextType['liveAnalytics']>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [aiAssistantResponse, setAiAssistantResponse] = useState<{ title: string; possibleCause: string; risk: string; recommendedAction: string; priority: string; maintenanceSuggestion: string; demoMode: boolean; } | null>({
    title: 'Demo AI Safety Assistant',
    possibleCause: 'Temperature rise and degraded airflow in a classroom can be caused by blocked vents, failing fan motors, or excessive occupancy.',
    risk: 'If unresolved, heat stress and poor ventilation may reduce comfort and strain electrical systems.',
    recommendedAction: 'Inspect the fan and airflow path, verify the room temperature trend, and schedule a maintenance check within the next shift.',
    priority: 'Medium',
    maintenanceSuggestion: 'Inspect classroom fan assembly, airflow filters, and room occupancy load; verify electrical circuit condition and clean dust buildup.',
    demoMode: true,
  });
  const [demoScenario, setDemoScenarioState] = useState<'normal' | 'classroom-problem' | 'environmental-warning' | 'critical-alert'>('normal');
  const [presentationMode, setPresentationModeState] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const savedTheme = window.localStorage.getItem('smart-school-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [sensors, setSensors] = useState<IoTSensor[]>(INITIAL_SENSORS);
  const [problems, setProblems] = useState<ProblemReport[]>(INITIAL_PROBLEMS);
  const [alerts, setAlerts] = useState<SafetyAlert[]>(INITIAL_ALERTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [teams, setTeams] = useState<MaintenanceTeam[]>(INITIAL_MAINTENANCE_TEAMS);
  const [recurringInsights] = useState<RecurringProblemInsight[]>(RECURRING_PROBLEMS);

  // Emergency Response State
  const [emergencies, setEmergencies] = useState<EmergencyIncident[]>(INITIAL_EMERGENCIES);
  const [emergencyTeams, setEmergencyTeams] = useState<EmergencyResponseTeam[]>(INITIAL_EMERGENCY_TEAMS);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);

  // AI Safety Assistant State
  const [currentAiAnalysis, setCurrentAiAnalysis] = useState<AiSafetyAnalysis | null>({
    title: 'Ceiling Fan Jammed & Making Grinding Noise',
    location: 'Classroom A101 (Floor 1)',
    category: 'Electrical & Ventilation',
    description: 'Ceiling fan is vibrating excessively, making loud grinding electrical noise, and running hot.',
    possibleCause: 'Motor or electrical fault (capacitor degradation, worn bearing, or internal winding resistance imbalance).',
    severity: 'Medium',
    recommendedAction: 'Switch off the fan and request electrical maintenance immediately to avoid coil burnout or physical detachment.',
    responsibleDepartment: 'Electrical Maintenance',
    immediateSafetyPrecaution: 'Do not operate the fan until inspected. Turn off the wall switch and tag it Out of Service.',
    riskAssessment: 'Sustained power to a jammed or faulty fan motor creates localized thermal buildup and potential mechanical drop hazard over student seating.',
    maintenanceSuggestion: 'Measure motor coil resistance, inspect downrod cotter pin safety lock, and replace starter capacitor.',
    analyzedAt: 'Today, 09:30 AM',
    hasImageAnalysis: false,
  });
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);
  const [selectedAiItem, setSelectedAiItem] = useState<{ id?: string; itemType?: 'problem' | 'alert' | 'emergency'; title: string; category: string; location: string; description: string; severity?: string; imageUrl?: string } | null>(null);
  const [simulateAiQuotaError, setSimulateAiQuotaError] = useState<boolean>(false);

  // Modal selections
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // Sound alert
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const currentSchool = useMemo(() => {
    return schools.find((s) => s.id === currentSchoolId) || schools[0];
  }, [schools, currentSchoolId]);

  const refreshLiveData = useCallback(async () => {
    const [issueResult, alertResult, emergencyResult, notificationResult, overview, locations, categories, statuses, monthly, resolution, departmentResult] = await Promise.all([
      apiGet<{ issues: Array<Record<string, any>> }>('/issues'),
      apiGet<{ alerts: Array<Record<string, any>> }>('/alerts'),
      apiGet<{ emergencies: Array<Record<string, any>> }>('/emergencies'),
      apiGet<{ notifications: Array<Record<string, any>> }>('/notifications'),
      apiGet<{ total: number; open: number; critical: number; resolved: number }>('/analytics/overview'),
      apiGet<{ data: Array<{ location: string; count: number }> }>('/analytics/problems-by-location'),
      apiGet<{ data: Array<{ category: string; count: number }> }>('/analytics/problems-by-category'),
      apiGet<{ data: Array<{ status: string; count: number }> }>('/analytics/status'),
      apiGet<{ data: Array<{ month: string; count: number }> }>('/analytics/monthly'),
      apiGet<{ averageHours: number | null }>('/analytics/resolution-time'),
      apiGet<{ departments: Array<{ id: string; name: string }> }>('/departments'),
    ]);
    setProblems(issueResult.issues.map(mapApiIssue));
    setAlerts(alertResult.alerts.map(mapApiAlert));
    setEmergencies(emergencyResult.emergencies.map(mapApiEmergency));
    setNotifications(notificationResult.notifications.map(mapApiNotification));
    setLiveAnalytics({ ...overview, byLocation: locations.data, byCategory: categories.data, byStatus: statuses.data, monthly: monthly.data, averageHours: resolution.averageHours });
    setDepartments(departmentResult.departments);
    setBackendConnected(true);
  }, []);

  const syncMutation = useCallback((request: Promise<unknown>) => {
    void request.then(() => refreshLiveData()).catch((error) => {
      if (error.status) {
        console.error('The backend rejected a school system change.', error);
        void refreshLiveData().catch(() => setBackendConnected(false));
        return;
      }
      setBackendConnected(false);
    });
  }, [refreshLiveData]);

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

  const setTheme = useCallback((nextTheme: 'light' | 'dark') => {
    setThemeState(nextTheme);
    window.localStorage.setItem('smart-school-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  }, []);

  const setPresentationMode = useCallback((enabled: boolean) => {
    setPresentationModeState(enabled);
  }, []);

  const setDemoScenario = useCallback((scenario: 'normal' | 'classroom-problem' | 'environmental-warning' | 'critical-alert') => {
    setDemoScenarioState(scenario);
  }, []);

  const inferAiSafetyAnalysis = useCallback((item: {
    id?: string;
    itemType?: 'problem' | 'alert' | 'emergency';
    title: string;
    category: string;
    location: string;
    description: string;
    severity?: string;
    imageUrl?: string;
  }): AiSafetyAnalysis => {
    const text = `${item.title} ${item.description} ${item.category} ${item.location}`.toLowerCase();
    const hasImage = Boolean(item.imageUrl && item.imageUrl.trim().length > 0);
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const isFan = text.includes('fan') || text.includes('ceiling fan') || text.includes('exhaust');
    const isSmokeOrFire = text.includes('smoke') || text.includes('fire') || text.includes('gas leak') || text.includes('flame') || text.includes('fume');
    const isWater = text.includes('water') || text.includes('leak') || text.includes('drain') || text.includes('pipe') || text.includes('tap') || text.includes('flood') || text.includes('seepage');
    const isElectrical = !isFan && (text.includes('electrical') || text.includes('power') || text.includes('wire') || text.includes('spark') || text.includes('short circuit') || text.includes('shock') || text.includes('switchboard') || text.includes('breaker') || text.includes('substation') || text.includes('feeder') || text.includes('socket'));
    const isStructural = text.includes('bench') || text.includes('desk') || text.includes('chair') || text.includes('window') || text.includes('glass') || text.includes('ceiling tile') || text.includes('wall crack') || text.includes('door') || text.includes('roof');
    const isIT = text.includes('projector') || text.includes('smart board') || text.includes('wifi') || text.includes('wi-fi') || text.includes('internet') || text.includes('computer') || text.includes('screen');
    const isMedical = text.includes('medical') || text.includes('injury') || text.includes('faint') || text.includes('asthma') || text.includes('bleeding') || text.includes('nurse');

    if (isFan) {
      return {
        itemId: item.id,
        itemType: item.itemType || 'problem',
        title: item.title,
        location: item.location,
        category: item.category || 'Electrical / Fixtures',
        description: item.description,
        possibleCause: 'Motor or electrical fault (capacitor degradation, worn bearing, or internal winding resistance imbalance).',
        severity: 'Medium',
        recommendedAction: 'Switch off the fan and request electrical maintenance immediately to prevent overheating or detachment.',
        responsibleDepartment: 'Electrical Maintenance',
        immediateSafetyPrecaution: 'Do not operate the fan until inspected. Turn off the wall switch and tag it Out of Service.',
        riskAssessment: 'Sustained power to a jammed fan motor creates thermal buildup, burning insulation, and mechanical drop hazard over student seating.',
        maintenanceSuggestion: 'Measure motor coil resistance, inspect downrod safety bolt/cotter pin, and replace starter capacitor.',
        analyzedAt: timeStr,
        hasImageAnalysis: hasImage,
      };
    }

    if (isSmokeOrFire) {
      return {
        itemId: item.id,
        itemType: item.itemType || 'emergency',
        title: item.title,
        location: item.location,
        category: item.category || 'Fire & Life Safety',
        description: item.description,
        possibleCause: 'Combustion of flammable materials, overheated electrical cabling, or hazardous chemical vapor ignition.',
        severity: 'Critical',
        recommendedAction: 'Trigger building fire alarm, initiate immediate room evacuation via designated exit, and dispatch Fire Safety Response Team.',
        responsibleDepartment: 'Fire Safety & Emergency Response Team',
        immediateSafetyPrecaution: 'Sound building alarm, evacuate without collecting personal belongings, close doors to contain smoke, do not use elevators.',
        riskAssessment: 'Acute smoke inhalation toxicity, rapid thermal flashover, and immediate threat to life safety across adjacent classrooms.',
        maintenanceSuggestion: 'Inspect ionization/optical smoke detectors, test emergency call points, verify fire damper shutoff, and replenish dry chemical extinguishers.',
        analyzedAt: timeStr,
        hasImageAnalysis: hasImage,
      };
    }

    if (isElectrical) {
      const isExposedOrSparking = text.includes('spark') || text.includes('exposed') || text.includes('burn') || text.includes('shock') || text.includes('overload');
      return {
        itemId: item.id,
        itemType: item.itemType || 'problem',
        title: item.title,
        location: item.location,
        category: item.category || 'Electrical Maintenance',
        description: item.description,
        possibleCause: 'Circuit overload, loose terminal connection, phase imbalance, or damaged cable insulation causing localized arcing.',
        severity: isExposedOrSparking ? 'Critical' : 'High',
        recommendedAction: 'De-energize circuit breaker immediately, place Lockout/Tagout (LOTO), and dispatch certified electrical maintenance personnel.',
        responsibleDepartment: 'Electrical Maintenance',
        immediateSafetyPrecaution: 'Keep all students away. Do not touch switches or wires with bare or wet hands. Cordon off the area with safety cones.',
        riskAssessment: 'High risk of electrical shock, arc flash burns, and secondary ignition of nearby combustible classroom furnishings.',
        maintenanceSuggestion: 'Conduct insulation resistance testing (megger), inspect busbar connections with infrared thermography, and replace damaged circuit breakers.',
        analyzedAt: timeStr,
        hasImageAnalysis: hasImage,
      };
    }

    if (isWater) {
      const isHeavyLeak = text.includes('flood') || text.includes('burst') || text.includes('near electrical') || text.includes('substation');
      return {
        itemId: item.id,
        itemType: item.itemType || 'problem',
        title: item.title,
        location: item.location,
        category: item.category || 'Plumbing & Water Safety',
        description: item.description,
        possibleCause: 'High water pressure joint rupture, deteriorated gasket seal, cracked PVC line, or blocked storm/sanitary drainage trap.',
        severity: isHeavyLeak ? 'High' : 'Medium',
        recommendedAction: 'Close zone water isolation valve, extract standing water, and inspect pipe unions and drainage lines.',
        responsibleDepartment: 'Plumbing & Sanitation Maintenance',
        immediateSafetyPrecaution: 'Post "WET FLOOR - SLIP HAZARD" cautionary boards. Disconnect nearby floor-level electric extension cords and appliances.',
        riskAssessment: 'Severe slip-and-fall hazard for students, structural ceiling plaster degradation, and electrocution hazard if water reaches conduit boxes.',
        maintenanceSuggestion: 'Pressure-test pipe line section, replace corroded brass couplers, and seal water ingress points with waterproof silicone.',
        analyzedAt: timeStr,
        hasImageAnalysis: hasImage,
      };
    }

    if (isStructural) {
      return {
        itemId: item.id,
        itemType: item.itemType || 'problem',
        title: item.title,
        location: item.location,
        category: item.category || 'Civil & Structural',
        description: item.description,
        possibleCause: 'Structural stress fatigue, loosened anchor fasteners, heavy impact damage, or material weathering.',
        severity: text.includes('glass') || text.includes('fall') || text.includes('ceiling') ? 'High' : 'Medium',
        recommendedAction: 'Barricade damaged furniture or fixture, redirect student traffic, and dispatch carpentry/civil repair crew.',
        responsibleDepartment: 'Civil & Structural Maintenance',
        immediateSafetyPrecaution: 'Do not allow students to use or approach the damaged item. Apply safety warning tape around the perimeter.',
        riskAssessment: 'Laceration hazard from broken glass/edges, or crush/impact hazard from unstable furniture collapse.',
        maintenanceSuggestion: 'Re-weld metal frames, replace shattered safety glass with tempered panes, and tighten floor anchor bolts.',
        analyzedAt: timeStr,
        hasImageAnalysis: hasImage,
      };
    }

    if (isIT) {
      return {
        itemId: item.id,
        itemType: item.itemType || 'problem',
        title: item.title,
        location: item.location,
        category: item.category || 'IT Infrastructure',
        description: item.description,
        possibleCause: 'Internal power converter thermal shutdown, faulty HDMI/LAN cabling, or software controller lockup.',
        severity: 'Low',
        recommendedAction: 'Verify surge protector power input, inspect cable connectors, and request IT hardware support.',
        responsibleDepartment: 'IT & Smart Hardware Team',
        immediateSafetyPrecaution: 'Do not yank suspended cables or attempt to open the electronic enclosure. Keep liquids away.',
        riskAssessment: 'Disruption to classroom curriculum delivery; low physical safety risk under normal conditions.',
        maintenanceSuggestion: 'Clean optical lenses and cooling fans, replace frayed cables, and verify surge suppressor grounding.',
        analyzedAt: timeStr,
        hasImageAnalysis: hasImage,
      };
    }

    if (isMedical) {
      return {
        itemId: item.id,
        itemType: item.itemType || 'emergency',
        title: item.title,
        location: item.location,
        category: item.category || 'Medical & Health',
        description: item.description,
        possibleCause: 'Acute physical trauma, sudden allergy/asthma exacerbation, or dehydration/heat stress.',
        severity: 'High',
        recommendedAction: 'Summon campus nurse immediately, administer standard first aid, and prepare medical transport if indicated.',
        responsibleDepartment: 'Campus Medical & Health Unit',
        immediateSafetyPrecaution: 'Keep student comfortable and calm. Do not move student if spinal or bone injury is suspected. Keep crowd away.',
        riskAssessment: 'Potential worsening of vital signs if emergency medical protocol is delayed.',
        maintenanceSuggestion: 'Replenish first-aid cabinet supplies and verify classroom emergency call button functionality.',
        analyzedAt: timeStr,
        hasImageAnalysis: hasImage,
      };
    }

    return {
      itemId: item.id,
      itemType: item.itemType || 'problem',
      title: item.title,
      location: item.location,
      category: item.category || 'General Campus Safety',
      description: item.description,
      possibleCause: 'Mechanical wear, environmental factors, or continuous operational load.',
      severity: (item.severity === 'critical' ? 'Critical' : item.severity === 'high' ? 'High' : item.severity === 'low' ? 'Low' : 'Medium'),
      recommendedAction: 'Log maintenance inspection request and verify operating safety parameters before continued use.',
      responsibleDepartment: 'General Campus Maintenance & Operations',
      immediateSafetyPrecaution: 'Exercise caution in the vicinity and report any sudden deterioration or unusual sounds/smells.',
      riskAssessment: 'May lead to recurring failures or service interruption if preventive maintenance is postponed.',
      maintenanceSuggestion: 'Complete thorough visual inspection, test component tolerance, and log service entry in facility register.',
      analyzedAt: timeStr,
      hasImageAnalysis: hasImage,
    };
  }, []);

  const runAiSafetyAnalysis = useCallback(async (item: {
    id?: string;
    itemType?: 'problem' | 'alert' | 'emergency';
    title: string;
    category: string;
    location: string;
    description: string;
    severity?: string;
    imageUrl?: string;
  }): Promise<AiSafetyAnalysis | null> => {
    setIsAiAnalyzing(true);
    setAiAnalysisError(null);

    // Realistic processing delay for AI reasoning
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (simulateAiQuotaError) {
      setAiAnalysisError('AI analysis is temporarily unavailable. Please try again later.');
      setIsAiAnalyzing(false);
      return null;
    }

    try {
      const analysis = inferAiSafetyAnalysis(item);
      setCurrentAiAnalysis(analysis);
      setSelectedAiItem(item);
      setIsAiAnalyzing(false);

      setAiAssistantResponse({
        title: analysis.title,
        possibleCause: analysis.possibleCause,
        risk: analysis.riskAssessment || '',
        recommendedAction: analysis.recommendedAction,
        priority: analysis.severity,
        maintenanceSuggestion: analysis.maintenanceSuggestion || '',
        demoMode: true,
      });

      return analysis;
    } catch {
      setAiAnalysisError('AI analysis is temporarily unavailable. Please try again later.');
      setIsAiAnalyzing(false);
      return null;
    }
  }, [simulateAiQuotaError, inferAiSafetyAnalysis]);

  const selectForAiAnalysis = useCallback((item: {
    id?: string;
    itemType?: 'problem' | 'alert' | 'emergency';
    title: string;
    category: string;
    location: string;
    description: string;
    severity?: string;
    imageUrl?: string;
  }) => {
    setSelectedAiItem(item);
    setActiveTab('ai-assistant');
    runAiSafetyAnalysis(item);
  }, [runAiSafetyAnalysis]);

  const generateAiAdvice = useCallback((problem: { title: string; description: string; location: string; category: string; severity?: string; }) => {
    runAiSafetyAnalysis({
      title: problem.title,
      description: problem.description,
      location: problem.location,
      category: problem.category,
      severity: problem.severity,
    });
  }, [runAiSafetyAnalysis]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('smart-school-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!presentationMode) return;
    const slides: ActiveTab[] = ['dashboard', 'live-monitoring', 'classrooms', 'classroom-problems', 'report-problem', 'issues', 'alerts', 'analytics'];
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % slides.length;
      setActiveTab(slides[index]);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [presentationMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const token = getApiToken();
    if (!token) return;
    void apiGet<{ user: ApiUser }>('/auth/me').then(async ({ user }) => {
      const mappedUser = mapApiUser(user);
      setCurrentUser(mappedUser);
      setIsLoggedIn(true);
      setActiveTab(mappedUser.role === 'maintenance' ? 'maintenance' : mappedUser.role === 'teacher' ? 'teacher-reports' : 'dashboard');
      await refreshLiveData();
    }).catch((error) => {
      if (error.status) {
        storeApiToken(null);
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
        setBackendConnected(false);
      }
    });
  }, [refreshLiveData]);

  useEffect(() => {
    const token = getApiToken();
    if (!token || !isLoggedIn) return;
    const socket = io(apiBaseUrl(), { auth: { token }, reconnection: true, reconnectionAttempts: 4, timeout: 4000 });
    const events = ['new_problem', 'issue_assigned', 'issue_status_changed', 'issue_resolved', 'issue_verified', 'critical_alert', 'emergency_alert'];
    const listeners = events.map((eventName) => {
      const listener = (payload: { title?: string; message?: string; issueId?: string }) => {
        void refreshLiveData().catch(() => {
          const now = new Date();
          setNotifications((current) => [{
            id: `live-${now.getTime()}-${eventName}`,
            title: payload.title ?? 'School system update',
            message: payload.message ?? 'A new activity update is available.',
            type: eventName === 'critical_alert' || eventName === 'emergency_alert' ? 'critical' : 'info',
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestampMs: now.getTime(), read: false, issueId: payload.issueId,
          }, ...current]);
        });
      };
      socket.on(eventName, listener);
      return [eventName, listener] as const;
    });
    return () => {
      listeners.forEach(([eventName, listener]) => socket.off(eventName, listener));
      socket.disconnect();
    };
  }, [isLoggedIn, refreshLiveData]);

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

  const loginWithApiUser = useCallback((user: ApiUser) => {
    const mappedUser = mapApiUser(user);
    setCurrentUser(mappedUser);
    setIsLoggedIn(true);
    setActiveTab(mappedUser.role === 'maintenance' ? 'maintenance' : mappedUser.role === 'teacher' ? 'teacher-reports' : 'dashboard');
    void refreshLiveData().catch((error) => {
      console.error('Unable to load live school data after login.', error);
      setBackendConnected(false);
    });
  }, [refreshLiveData]);

  const logout = useCallback(() => {
    storeApiToken(null);
    setIsLoggedIn(false);
    setBackendConnected(false);
    setLiveAnalytics(null);
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
    (reportData: Omit<ProblemReport, 'id' | 'issueId' | 'history' | 'reportedDate' | 'reportedTime' | 'status'>, localOnly = false): ProblemReport => {
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

      if (getApiToken() && !localOnly) return newReport;

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

        // Critical safety alert notification
        const critNotif: SystemNotification = {
          id: `notif-${Date.now()}-crit`,
          title: 'Critical Safety Issue Detected',
          message: `Critical issue: ${reportData.title} at ${reportData.exactLocation}.`,
          type: 'critical',
          notificationType: 'critical_safety' as NotificationType,
          priority: 'critical',
          timestamp: 'Just now',
          timestampMs: Date.now(),
          read: false,
          issueId,
          relatedLocation: reportData.exactLocation,
          relatedProblem: reportData.category,
        };
        setNotifications((prev) => [critNotif, ...prev]);
      } else {
        playAlertTone('success');
      }

      // Add system notification for new problem report
      const notifType: NotificationType = reportData.priority === 'critical' ? 'critical_safety' : 'new_problem';
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: 'New Problem Reported',
        message: `${reportData.title} logged for ${reportData.exactLocation} (${issueId}).`,
        type: reportData.priority === 'critical' ? 'critical' : 'warning',
        notificationType: notifType,
        priority: reportData.priority as SystemNotification['priority'],
        timestamp: 'Just now',
        timestampMs: Date.now(),
        read: false,
        issueId,
        relatedLocation: reportData.exactLocation,
        relatedProblem: reportData.category,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      return newReport;
    },
    [playAlertTone]
  );

  // Update status (e.g. REPORTED -> ASSIGNED -> IN PROGRESS -> RESOLVED)
  const updateIssueStatus = useCallback((issueId: string, newStatus: IssueStatus, notes?: string, assignedToId?: string) => {
    if (getApiToken()) {
      const backendStatus = newStatus === 'IN PROGRESS' ? 'IN_PROGRESS' : newStatus === 'CLOSED' ? 'VERIFIED' : newStatus;
      const issue = problems.find((entry) => entry.id === issueId || entry.issueId === issueId);
      const id = issue?.id ?? issueId;
      const request = newStatus === 'VERIFIED' || newStatus === 'CLOSED'
        ? apiPost(`/issues/${id}/verify`, { notes })
        : apiPost(`/issues/${id}/status`, { status: backendStatus, notes });
      syncMutation(request);
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updatedIssue: ProblemReport | undefined;
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
          updatedIssue = {
            ...p,
            status: newStatus,
            maintenanceNotes: notes ? (p.maintenanceNotes ? `${p.maintenanceNotes}\n${notes}` : notes) : p.maintenanceNotes,
            history: updatedHistory,
          };
          return updatedIssue;
        }
        return p;
      })
    );

    // Generate notification for status change
    if (newStatus === 'IN PROGRESS' || newStatus === 'RESOLVED' || newStatus === 'VERIFIED' || newStatus === 'CLOSED') {
      const statusNotifMap: Record<string, { title: string; notifType: NotificationType; msgType: SystemNotification['type'] }> = {
        'IN PROGRESS': { title: 'Maintenance Started', notifType: 'maintenance_started', msgType: 'info' },
        'RESOLVED': { title: 'Issue Resolved', notifType: 'issue_resolved', msgType: 'success' },
        'VERIFIED': { title: 'Issue Verified', notifType: 'issue_verified', msgType: 'success' },
        'CLOSED': { title: 'Issue Closed', notifType: 'issue_resolved', msgType: 'success' },
      };
      const entry = statusNotifMap[newStatus];
      if (entry) {
        const statusNotif: SystemNotification = {
          id: `notif-${Date.now()}`,
          title: entry.title,
          message: notes ? `${notes} (${issueId})` : `Issue ${issueId} status changed to ${newStatus}.`,
          type: entry.msgType,
          notificationType: entry.notifType,
          priority: 'medium',
          timestamp: 'Just now',
          timestampMs: Date.now(),
          read: false,
          issueId,
        };
        setNotifications((prev) => [statusNotif, ...prev]);
      }
    }
  }, [problems, syncMutation]);

  // Assign issue
  const assignIssue = useCallback((issueId: string, teamId: string, technicianName: string) => {
    const team = teams.find((t) => t.id === teamId);
    const teamName = team ? team.name : 'Maintenance Team';
    if (getApiToken()) {
      const normalized = teamName.toLowerCase();
      const department = departments.find((entry) => entry.name.toLowerCase().includes(normalized.split(' ')[0]))
        ?? departments.find((entry) => normalized.includes('electrical') && entry.name.toLowerCase().includes('electrical'))
        ?? departments.find((entry) => normalized.includes('plumbing') && entry.name.toLowerCase().includes('plumbing'))
        ?? departments.find((entry) => normalized.includes('civil') && entry.name.toLowerCase().includes('civil'));
      const issue = problems.find((entry) => entry.id === issueId || entry.issueId === issueId);
      syncMutation(apiPost(`/issues/${issue?.id ?? issueId}/assign`, { departmentId: department?.id }));
    }
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

    // Notification for assignment
    const assignNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'Issue Assigned to Team',
      message: `Issue ${issueId} assigned to ${technicianName} (${teamName}).`,
      type: 'info',
      notificationType: 'issue_assigned',
      priority: 'medium',
      timestamp: 'Just now',
      timestampMs: Date.now(),
      read: false,
      issueId,
    };
    setNotifications((prev) => [assignNotif, ...prev]);
  }, [teams, departments, problems, syncMutation]);

  // Resolve issue
  const resolveIssue = useCallback((issueId: string, resolutionNotes: string, afterImage?: string) => {
    if (getApiToken()) {
      const issue = problems.find((entry) => entry.id === issueId || entry.issueId === issueId);
      syncMutation(apiPost(`/issues/${issue?.id ?? issueId}/status`, { status: 'RESOLVED', notes: resolutionNotes, resolutionImage: afterImage }));
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    let resolvedTitle = issueId;

    setProblems((prev) =>
      prev.map((p) => {
        if (p.issueId === issueId || p.id === issueId) {
          resolvedTitle = p.title;
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

    // Resolution notification
    const resolveNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'Issue Resolved',
      message: `${resolvedTitle} issue marked as Resolved. ${resolutionNotes}`,
      type: 'success',
      notificationType: 'issue_resolved',
      priority: 'low',
      timestamp: 'Just now',
      timestampMs: Date.now(),
      read: false,
      issueId,
    };
    setNotifications((prev) => [resolveNotif, ...prev]);

    playAlertTone('success');
  }, [playAlertTone, problems, syncMutation]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    if (getApiToken()) syncMutation(apiPut(`/alerts/${alertId}`, { status: 'ACKNOWLEDGED', acknowledged: true }));
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
  }, [currentUser, syncMutation]);

  // Resolve alert
  const resolveAlert = useCallback((alertId: string) => {
    if (getApiToken()) syncMutation(apiPut(`/alerts/${alertId}`, { status: 'RESOLVED' }));
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
  }, [syncMutation]);

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
          notificationType: 'fire_smoke' as NotificationType,
          priority: 'critical' as SystemNotification['priority'],
          timestamp: 'Just now',
          timestampMs: Date.now(),
          read: false,
          relatedLocation: 'Chemistry Lab 2, Science Block',
          relatedProblem: 'Smoke Detection',
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

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Water Leakage Alert',
          message: 'Active water leakage detected near Electrical Room. Immediate action required.',
          type: 'critical',
          notificationType: 'water_leakage' as NotificationType,
          priority: 'critical' as SystemNotification['priority'],
          timestamp: 'Just now',
          timestampMs: Date.now(),
          read: false,
          relatedLocation: 'Electrical Room / Block B Corridor Junction',
          relatedProblem: 'Water Leakage',
        },
        ...prev,
      ]);
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

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Electrical Safety Alert',
          message: 'Thermal overload detected in Substation Feeder 2. Current: 34.8A, Temp: 48°C.',
          type: 'warning',
          notificationType: 'electrical_safety' as NotificationType,
          priority: 'high' as SystemNotification['priority'],
          timestamp: 'Just now',
          timestampMs: Date.now(),
          read: false,
          relatedLocation: 'Central Substation Room',
          relatedProblem: 'Electrical Overload',
        },
        ...prev,
      ]);
    }

    if (getApiToken()) {
      const alertsByType = {
        smoke: { title: 'Smoke detected in Chemistry Laboratory', message: 'Optical smoke sensor SMK-202 recorded acute particle spike (74 ppm). Immediate evacuation recommended.', location: 'Science Block → Chemistry Lab 2', priority: 'CRITICAL', source: 'IoT Sensor' },
        water: { title: 'Water leakage detected near Electrical Room', message: 'Floor probe WTR-303 registered active liquid conductance near substation distribution board.', location: 'Electrical Room / Block B Corridor Junction', priority: 'CRITICAL', source: 'IoT Sensor' },
        electrical: { title: 'Thermal & Current Overload in Substation Feeder 2', message: 'Current exceeded 34.5A threshold with 48°C busbar temperature.', location: 'Central Substation Room', priority: 'HIGH', source: 'IoT Sensor' },
      };
      syncMutation(apiPost('/alerts', alertsByType[type]));
    }

    playAlertTone('beep');
  }, [playAlertTone, syncMutation]);

  const resetSimulations = useCallback(() => {
    setAlerts(INITIAL_ALERTS);
    setSensors(INITIAL_SENSORS);
    setClassrooms(INITIAL_CLASSROOMS);
    setProblems(INITIAL_PROBLEMS);
    playAlertTone('success');
  }, [playAlertTone]);

  const markNotificationRead = useCallback((id: string) => {
    if (getApiToken() && !id.startsWith('live-')) syncMutation(apiPatch(`/notifications/${id}/read`, {}));
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, [syncMutation]);

  const markAllNotificationsRead = useCallback(() => {
    if (getApiToken()) {
      const unreadIds = notifications.filter((notification) => !notification.read && !notification.id.startsWith('live-')).map((notification) => notification.id);
      if (unreadIds.length) syncMutation(Promise.all(unreadIds.map((id) => apiPatch(`/notifications/${id}/read`, {}))));
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications, syncMutation]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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

  // Emergency Response Actions
  const addEmergency = useCallback((data: Omit<EmergencyIncident, 'id' | 'emergencyCode' | 'timeline' | 'reportedAt' | 'reportedAtMs' | 'status'>): EmergencyIncident => {
    if (getApiToken()) {
      syncMutation(apiPost('/emergencies', {
        type: data.type,
        location: data.location,
        description: data.description,
        priority: data.priority.toUpperCase(),
        evidenceImage: undefined,
      }));
    }
    const codeNum = Math.floor(100 + Math.random() * 900);
    const emergencyCode = `EMG-2026-${codeNum}`;
    const id = `emg-${Date.now()}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const newIncident: EmergencyIncident = {
      ...data,
      id,
      emergencyCode,
      status: 'Reported',
      reportedAt: `${dateStr}, ${timeStr}`,
      reportedAtMs: Date.now(),
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'Reported',
          timestamp: `${dateStr}, ${timeStr}`,
          timestampMs: Date.now(),
          updatedBy: data.reportedBy || 'Incident Reporter',
          note: `Emergency reported: ${data.title} at ${data.location}.`,
        }
      ],
    };
    setEmergencies((prev) => [newIncident, ...prev]);

    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `🚨 Emergency: ${data.title}`,
      message: `${data.title} reported at ${data.location}. Priority: ${data.priority.toUpperCase()}`,
      type: 'critical',
      notificationType: 'emergency',
      priority: data.priority,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      read: false,
      relatedLocation: data.location,
      relatedProblem: data.type,
    };
    setNotifications((prev) => [notif, ...prev]);
    playAlertTone('beep');
    return newIncident;
  }, [playAlertTone, syncMutation]);

  const acknowledgeEmergency = useCallback((id: string, note?: string) => {
    if (getApiToken()) syncMutation(apiPut(`/emergencies/${id}`, { status: 'ACKNOWLEDGED', note }));
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    setEmergencies((prev) => prev.map((e) => {
      if (e.id === id) {
        return {
          ...e,
          status: 'Acknowledged',
          acknowledgedAt: `${dateStr}, ${timeStr}`,
          timeline: [
            ...e.timeline,
            {
              id: `tl-${Date.now()}`,
              status: 'Acknowledged',
              timestamp: `${dateStr}, ${timeStr}`,
              timestampMs: Date.now(),
              updatedBy: 'Emergency Command',
              note: note || 'Emergency acknowledged by command center.',
            }
          ]
        };
      }
      return e;
    }));
  }, [syncMutation]);

  const assignEmergencyTeam = useCallback((id: string, teamId: string) => {
    const team = emergencyTeams.find((t) => t.id === teamId);
    const teamName = team ? team.name : 'Response Team';
    if (getApiToken()) syncMutation(apiPut(`/emergencies/${id}`, { status: 'TEAM_ASSIGNED', note: `Assigned response team: ${teamName}` }));
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    setEmergencies((prev) => prev.map((e) => {
      if (e.id === id) {
        return {
          ...e,
          status: 'Team Assigned',
          assignedTeamId: teamId,
          assignedTeamName: teamName,
          responseStartedAt: `${dateStr}, ${timeStr}`,
          timeline: [
            ...e.timeline,
            {
              id: `tl-${Date.now()}`,
              status: 'Team Assigned',
              timestamp: `${dateStr}, ${timeStr}`,
              timestampMs: Date.now(),
              updatedBy: 'Dispatcher',
              note: `Dispatched ${teamName} to incident scene.`,
            }
          ]
        };
      }
      return e;
    }));

    setEmergencyTeams((prev) => prev.map((t) => t.id === teamId ? { ...t, status: 'Responding', currentAssignment: `Incident ${id}` } : t));

    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `Team Dispatched: ${teamName}`,
      message: `${teamName} dispatched to incident ${id}.`,
      type: 'info',
      notificationType: 'issue_assigned',
      priority: 'high',
      timestamp: 'Just now',
      timestampMs: Date.now(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  }, [emergencyTeams, syncMutation]);

  const updateEmergencyStatus = useCallback((id: string, status: EmergencyStatus, note?: string) => {
    if (getApiToken()) {
      const backendStatus: Record<EmergencyStatus, string> = {
        Reported: 'REPORTED', Acknowledged: 'ACKNOWLEDGED', 'Team Assigned': 'TEAM_ASSIGNED',
        Responding: 'RESPONDING', 'On Scene': 'ON_SCENE', Resolved: 'RESOLVED', Verified: 'VERIFIED',
      };
      syncMutation(apiPut(`/emergencies/${id}`, { status: backendStatus[status], note }));
    }
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    setEmergencies((prev) => prev.map((e) => {
      if (e.id === id) {
        const updates: Partial<EmergencyIncident> = { status };
        if (status === 'On Scene') updates.onSceneAt = `${dateStr}, ${timeStr}`;
        return {
          ...e,
          ...updates,
          timeline: [
            ...e.timeline,
            {
              id: `tl-${Date.now()}`,
              status,
              timestamp: `${dateStr}, ${timeStr}`,
              timestampMs: Date.now(),
              updatedBy: 'Emergency Operations',
              note: note || `Status updated to ${status}.`,
            }
          ]
        };
      }
      return e;
    }));
  }, [syncMutation]);

  const resolveEmergency = useCallback((id: string, notes: string) => {
    if (getApiToken()) syncMutation(apiPut(`/emergencies/${id}`, { status: 'RESOLVED', note: notes }));
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    let assignedTeamId: string | undefined;
    setEmergencies((prev) => prev.map((e) => {
      if (e.id === id) {
        assignedTeamId = e.assignedTeamId;
        return {
          ...e,
          status: 'Resolved',
          resolvedAt: `${dateStr}, ${timeStr}`,
          resolutionNotes: notes,
          timeline: [
            ...e.timeline,
            {
              id: `tl-${Date.now()}`,
              status: 'Resolved',
              timestamp: `${dateStr}, ${timeStr}`,
              timestampMs: Date.now(),
              updatedBy: 'Response Team Lead',
              note: `Incident resolved: ${notes}`,
            }
          ]
        };
      }
      return e;
    }));

    if (assignedTeamId) {
      setEmergencyTeams((prev) => prev.map((t) => t.id === assignedTeamId ? { ...t, status: 'Available', currentAssignment: undefined } : t));
    }

    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `Emergency Incident Resolved`,
      message: `Incident resolved. Notes: ${notes}`,
      type: 'success',
      notificationType: 'issue_resolved',
      priority: 'medium',
      timestamp: 'Just now',
      timestampMs: Date.now(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    playAlertTone('success');
  }, [playAlertTone, syncMutation]);

  const verifyEmergency = useCallback((id: string) => {
    if (getApiToken()) syncMutation(apiPut(`/emergencies/${id}`, { status: 'VERIFIED', note: 'Resolution verified and incident closed.' }));
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    setEmergencies((prev) => prev.map((e) => {
      if (e.id === id) {
        return {
          ...e,
          status: 'Verified',
          verifiedAt: `${dateStr}, ${timeStr}`,
          timeline: [
            ...e.timeline,
            {
              id: `tl-${Date.now()}`,
              status: 'Verified',
              timestamp: `${dateStr}, ${timeStr}`,
              timestampMs: Date.now(),
              updatedBy: 'Safety Director',
              note: 'Resolution verified and incident closed.',
            }
          ]
        };
      }
      return e;
    }));
  }, [syncMutation]);

  const triggerDemoEmergency = useCallback((type: 'fire' | 'electrical' | 'water' | 'medical') => {
    const demos: Record<'fire' | 'electrical' | 'water' | 'medical', {
      type: EmergencyType;
      title: string;
      description: string;
      location: string;
      building: string;
      floor: string;
      classroomNumber: string;
      priority: 'critical' | 'high';
      teamId: string;
    }> = {
      fire: {
        type: 'Fire',
        title: 'Active Smoke & Flame Detected',
        description: 'Ionization sensor detected rapid thermal gradient and thick smoke in Chemistry Lab 2. Fire extinguisher deployed.',
        location: 'Science Block, Floor 2, Chemistry Lab 2',
        building: 'Science Block',
        floor: '2nd Floor',
        classroomNumber: 'Lab-C2',
        priority: 'critical',
        teamId: 'ert-fire',
      },
      electrical: {
        type: 'Electrical',
        title: 'Main Busbar Arc Overload',
        description: 'Audible arcing and scorched insulation smell reported from Substation Feeder 1 panel. Risk of electrical fire.',
        location: 'Main Substation Vault, Ground Level',
        building: 'Main Administrative Block',
        floor: 'Basement',
        classroomNumber: 'SUB-01',
        priority: 'critical',
        teamId: 'ert-elec',
      },
      water: {
        type: 'Water Leakage',
        title: 'Main Header Pipe Burst',
        description: 'High-pressure water line fractured above Library server rack room. 2 inches of pooling water spreading fast.',
        location: 'Academic Block B, Floor 1, Server Room',
        building: 'Academic Block B',
        floor: '1st Floor',
        classroomNumber: 'B-108',
        priority: 'high',
        teamId: 'ert-plumb',
      },
      medical: {
        type: 'Medical',
        title: 'Severe Asthma / Respiratory Distress',
        description: 'Student experiencing acute respiratory distress during indoor sports event in Gymnasium.',
        location: 'Sports Complex, Indoor Gymnasium',
        building: 'Sports Complex',
        floor: 'Ground Floor',
        classroomNumber: 'GYM-01',
        priority: 'high',
        teamId: 'ert-med',
      },
    };

    const demo = demos[type];
    const newIncident = addEmergency({
      ...demo,
      reportedBy: 'Automated Safety System (DEMO)',
      source: 'demo',
      isDemo: true,
    });
    return newIncident;
  }, [addEmergency]);

  return (
    <AppContext.Provider
      value={{
        schools,
        currentSchool,
        setSchoolId: setCurrentSchoolId,
        currentUser,
        isLoggedIn,
        loginAs,
        loginWithApiUser,
        logout,
        backendConnected,
        refreshLiveData,
        liveAnalytics,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        prefersReducedMotion,
        aiAssistantResponse,
        generateAiAdvice,
        currentAiAnalysis,
        isAiAnalyzing,
        aiAnalysisError,
        selectedAiItem,
        selectForAiAnalysis,
        runAiSafetyAnalysis,
        simulateAiQuotaError,
        setSimulateAiQuotaError,
        demoScenario,
        setDemoScenario,
        presentationMode,
        setPresentationMode,
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
        deleteNotification,
        addUser,
        addSensor,
        soundEnabled,
        setSoundEnabled,
        playAlertTone,
        campusSafetyStatus,
        emergencies,
        emergencyTeams,
        addEmergency,
        acknowledgeEmergency,
        assignEmergencyTeam,
        updateEmergencyStatus,
        resolveEmergency,
        verifyEmergency,
        triggerDemoEmergency,
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
