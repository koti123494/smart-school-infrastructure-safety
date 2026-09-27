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
export type IssueStatus = 'REPORTED' | 'ASSIGNED' | 'IN PROGRESS' | 'RESOLVED';

export type ProblemCategory =
  | 'Broken Fan'
  | 'Broken Light'
  | 'Damaged Desk'
  | 'Damaged Chair'
  | 'Projector Problem'
  | 'Smart Board Problem'
  | 'Electrical Problem'
  | 'Ceiling Damage'
  | 'Wall Damage'
  | 'Door/Window Damage'
  | 'Water Leakage'
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
  | 'Washroom'
  | 'Playground'
  | 'Corridor'
  | 'Canteen'
  | 'Parking Area'
  | 'Electrical Room'
  | 'Water Tank'
  | 'School Entrance'
  | 'Main Building';

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

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  issueId?: string;
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
