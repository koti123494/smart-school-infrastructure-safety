export type UserRole = 'admin' | 'teacher' | 'maintenance' | 'supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  phone?: string;
}

export type SafetyStatus = 'safe' | 'warning' | 'critical';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'REPORTED' | 'ASSIGNED' | 'IN PROGRESS' | 'RESOLVED' | 'VERIFIED' | 'CLOSED';

export type ProblemCategory =
  | 'Broken Fan'
  | 'Broken Light'
  | 'Damaged Desk'
  | 'Damaged Desk/Bench'
  | 'Damaged Chair'
  | 'Damaged Chair/Table'
  | 'Projector Problem'
  | 'Smart Board Problem'
  | 'Lab Equipment Problem'
  | 'Computer/System Problem'
  | 'Electrical Problem'
  | 'Electrical Fault'
  | 'Wiring Problem'
  | 'Switch/Panel Problem'
  | 'Power Issue'
  | 'Safety Hazard'
  | 'Safety Equipment Problem'
  | 'Ceiling Damage'
  | 'Wall Damage'
  | 'Damaged Wall'
  | 'Door/Window Damage'
  | 'Broken Door'
  | 'Door Problem'
  | 'Broken Window'
  | 'Water Leakage'
  | 'Tap Problem'
  | 'Flush Problem'
  | 'Lighting Problem'
  | 'Plumbing Problem'
  | 'Cleanliness Problem'
  | 'Damaged Equipment'
  | 'Broken Lights'
  | 'Ground/Safety Problem'
  | 'Water Problem'
  | 'Floor Problem'
  | 'Food Quality Problem'
  | 'Hygiene Problem'
  | 'Equipment Problem'
  | 'Drainage/Water Problem'
  | 'Security Problem'
  | 'Damaged Surface'
  | 'Furniture Problem'
  | 'Food Complaint'
  | 'AC Problem'
  | 'Internet/Wi-Fi Problem'
  | 'Sanitation & Plumbing'
  | 'Playground Equipment'
  | 'Security & Access'
  | 'Safety & Smoke Sensor'
  | 'Water Facilities'
  | 'Other';

export type LocationType =
  | 'Classroom'
  | 'Laboratory'
  | 'Library'
  | 'Staff Room'
  | "Teachers' Class / Faculty Room"
  | 'Washroom'
  | 'Playground'
  | 'Corridor'
  | 'Canteen'
  | 'Parking Area'
  | 'Electrical Room'
  | 'Water Tank'
  | 'School Entrance'
  | 'Main Building'
  | 'Food'
  | 'Others';

export interface School {
  id: string;
  name: string;
  location: string;
  address: string;
  district: string;
  state: string;
  totalClassrooms: number;
  totalSensors: number;
  principalName: string;
  emergencyContact: string;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  type: string;
  floors: number;
  totalRooms: number;
  status: SafetyStatus;
  coordinates: { x: number; y: number; width: number; height: number };
  description: string;
}

export interface Classroom {
  id: string;
  roomNumber: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  studentCapacity: number;
  currentStudents: number;
  status: SafetyStatus;
  temperature: number;
  smokeStatus: 'Normal' | 'Alert' | 'Critical';
  electricalStatus: 'Normal' | 'Warning' | 'Overload';
  waterLeakageStatus: 'None' | 'Detected';
  openIssuesCount: number;
  lastInspectionDate: string;
  assignedTeacher?: string;
  sensorIds: string[];
}

export type SensorType = 'temperature' | 'smoke' | 'water' | 'electrical' | 'air_quality' | 'vibration';

export interface IoTSensor {
  id: string;
  sensorCode: string;
  name: string;
  location: string;
  buildingName: string;
  roomId?: string;
  type: SensorType;
  currentValue: string;
  numericValue: number;
  unit: string;
  status: 'online' | 'warning' | 'critical' | 'offline';
  batteryPercentage: number;
  lastUpdated: string;
  thresholdMin?: number;
  thresholdMax?: number;
}

export interface ProblemImage {
  id: string;
  url: string;
  caption?: string;
  type: 'reported' | 'before' | 'after';
  uploadedAt: string;
}

export interface IssueHistoryEntry {
  id: string;
  status: IssueStatus;
  timestamp: string;
  updatedBy: string;
  comment: string;
}

export interface ProblemReport {
  id: string;
  issueId: string; // SCH-2026-00124
  title: string;
  category: ProblemCategory;
  description: string;
  locationType: LocationType;
  building: string;
  floor?: string;
  classroomNumber?: string;
  section?: string;
  exactLocation: string;
  priority: PriorityLevel;
  reportedBy: {
    id: string;
    name: string;
    role: string;
    email: string;
    phone?: string;
  };
  reportedDate: string;
  reportedTime: string;
  reportedAtMs?: number;
  status: IssueStatus;
  assignedTo?: {
    id: string;
    name: string;
    team: string;
    assignedDate: string;
    phone?: string;
  };
  expectedResolution?: string;
  images: ProblemImage[];
  beforeImage?: string;
  afterImage?: string;
  maintenanceNotes?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  history: IssueHistoryEntry[];
  source: 'human' | 'sensor_auto';
  sensorId?: string;
}

export interface SafetyAlert {
  id: string;
  alertCode: string;
  title: string;
  message: string;
  location: string;
  building: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  source: 'IoT Sensor' | 'Staff Report' | 'Automatic Escalation';
  sensorId?: string;
  problemId?: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  escalationLevel: 1 | 2 | 3;
  escalationTimerSeconds: number; // 120s for Level 2
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface MaintenanceTeam {
  id: string;
  name: string;
  specialty: 'Electrical' | 'Plumbing' | 'Civil' | 'IT Infrastructure' | 'General Maintenance';
  leadName: string;
  contactNumber: string;
  activeTasks: number;
  completedTasks: number;
  members: string[];
}

export type NotificationType =
  | 'new_problem'
  | 'critical_safety'
  | 'high_priority'
  | 'issue_assigned'
  | 'maintenance_started'
  | 'issue_resolved'
  | 'issue_verified'
  | 'sensor_offline'
  | 'fire_smoke'
  | 'electrical_safety'
  | 'water_leakage'
  | 'emergency'
  | 'info';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  notificationType?: NotificationType;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  timestampMs?: number;
  read: boolean;
  actionUrl?: string;
  issueId?: string;
  alertId?: string;
  relatedLocation?: string;
  relatedProblem?: string;
}

export interface RecurringProblemInsight {
  id: string;
  title: string;
  location: string;
  building: string;
  category: ProblemCategory;
  incidentCount: number;
  timeframe: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: string;
  rootCause: string;
  estimatedPreventiveSavings: string;
}

// ── Emergency Response Center ──────────────────────────────────────────────────

export type EmergencyType =
  | 'Fire'
  | 'Smoke'
  | 'Electrical'
  | 'Water Leakage'
  | 'Medical'
  | 'Security'
  | 'Structural'
  | 'Other';

export type EmergencyStatus =
  | 'Reported'
  | 'Acknowledged'
  | 'Team Assigned'
  | 'Responding'
  | 'On Scene'
  | 'Resolved'
  | 'Verified';

export interface EmergencyTimelineEntry {
  id: string;
  status: EmergencyStatus;
  timestamp: string;
  timestampMs: number;
  updatedBy: string;
  note: string;
}

export interface EmergencyResponseTeam {
  id: string;
  name: string;
  specialty: 'Fire Safety' | 'Electrical' | 'Plumbing' | 'Medical' | 'Security' | 'General' | 'Civil';
  leadName: string;
  contactNumber: string;
  status: 'Available' | 'Responding' | 'On Scene' | 'Off Duty';
  currentLocation?: string;
  currentAssignment?: string;
  members: string[];
  responseTimeMinutes: number;
}

export interface EmergencyIncident {
  id: string;
  emergencyCode: string;
  type: EmergencyType;
  title: string;
  description: string;
  location: string;
  building: string;
  floor?: string;
  classroomNumber?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: EmergencyStatus;
  reportedAt: string;
  reportedAtMs: number;
  reportedBy: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  acknowledgedAt?: string;
  responseStartedAt?: string;
  onSceneAt?: string;
  resolvedAt?: string;
  verifiedAt?: string;
  resolutionNotes?: string;
  timeline: EmergencyTimelineEntry[];
  linkedAlertId?: string;
  linkedIssueId?: string;
  source: 'manual' | 'sensor_auto' | 'demo';
  isDemo?: boolean;
}

export interface AiSafetyAnalysis {
  itemId?: string;
  itemType?: 'problem' | 'alert' | 'emergency';
  title: string;
  location: string;
  category: string;
  description?: string;
  possibleCause: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendedAction: string;
  responsibleDepartment: string;
  immediateSafetyPrecaution: string;
  riskAssessment?: string;
  maintenanceSuggestion?: string;
  analyzedAt: string;
  hasImageAnalysis?: boolean;
}
