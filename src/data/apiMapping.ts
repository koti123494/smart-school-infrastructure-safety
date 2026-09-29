import { EmergencyIncident, EmergencyStatus, IssueStatus, ProblemReport, SafetyAlert, SystemNotification, User, UserRole } from '../types';
import { ApiUser } from './api';

type ApiRecord = Record<string, any>;

const lower = (value: unknown, fallback = '') => String(value ?? fallback).toLowerCase();
const dateText = (value: unknown, options: Intl.DateTimeFormatOptions) => {
  const date = value ? new Date(String(value)) : new Date();
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', options);
};

export function mapApiUser(user: ApiUser): User {
  const roles: Record<string, UserRole> = {
    ADMIN: 'admin', TEACHER: 'teacher', STUDENT: 'teacher', MAINTENANCE_STAFF: 'maintenance',
    SECURITY: 'supervisor', CANTEEN_STAFF: 'teacher',
  };
  return {
    id: user.id, name: user.name, email: user.email, role: roles[user.role] ?? 'teacher',
    department: user.department?.name,
  };
}

export function mapApiIssue(issue: ApiRecord): ProblemReport {
  const report = issue.report ?? {};
  const reporter = report.reporter ?? {};
  const assignment = issue.assignment ?? {};
  const assignee = assignment.assignee ?? {};
  const timeline = Array.isArray(issue.timeline) ? issue.timeline : [];
  const reportedAt = issue.reportedAt ?? issue.createdAt;
  const imageUrl = report.imageUrl || undefined;
  const status: IssueStatus = issue.status === 'WORK_STARTED' || issue.status === 'IN_PROGRESS' ? 'IN PROGRESS' : issue.status;
  return {
    id: issue.id,
    issueId: issue.issueNumber,
    title: issue.title,
    category: issue.category,
    description: issue.description,
    locationType: report.locationType || 'Others',
    building: report.building || issue.location,
    floor: report.floor || undefined,
    classroomNumber: report.classroom || undefined,
    section: report.section || undefined,
    exactLocation: report.exactLocation || issue.location,
    priority: lower(issue.priority, 'medium') as ProblemReport['priority'],
    reportedBy: {
      id: reporter.id || '', name: reporter.name || 'Unknown reporter', role: reporter.role || 'Staff Member',
      email: reporter.email || '', phone: report.reporterPhone || undefined,
    },
    reportedDate: dateText(reportedAt, { day: 'numeric', month: 'long', year: 'numeric' }),
    reportedTime: dateText(reportedAt, { hour: '2-digit', minute: '2-digit' }),
    reportedAtMs: new Date(reportedAt).getTime() || Date.now(),
    status,
    assignedTo: assignment.id ? {
      id: assignee.id || assignment.id, name: assignee.name || 'Assigned team',
      team: assignment.department?.name || 'Maintenance',
      assignedDate: dateText(assignment.assignedAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    } : undefined,
    images: imageUrl ? [{ id: `image-${issue.id}`, url: imageUrl, type: 'reported', uploadedAt: String(reportedAt ?? '') }] : [],
    beforeImage: imageUrl,
    afterImage: issue.resolutionImage || undefined,
    maintenanceNotes: timeline.map((entry: ApiRecord) => entry.note).filter(Boolean).join('\n') || undefined,
    resolutionNotes: issue.resolutionNotes || undefined,
    resolvedAt: issue.resolvedAt ? dateText(issue.resolvedAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : undefined,
    history: timeline.map((entry: ApiRecord) => ({
      id: entry.id,
      status: entry.status === 'WORK_STARTED' || entry.status === 'IN_PROGRESS' ? 'IN PROGRESS' : entry.status,
      timestamp: dateText(entry.createdAt, { hour: '2-digit', minute: '2-digit' }),
      updatedBy: entry.actor?.name || 'System',
      comment: entry.note || `Status changed to ${entry.status}.`,
    })),
    source: 'human',
  };
}

export function mapApiAlert(alert: ApiRecord): SafetyAlert {
  const priority = lower(alert.priority, 'medium');
  return {
    id: alert.id,
    alertCode: `ALT-${alert.id.slice(0, 8).toUpperCase()}`,
    title: alert.title,
    message: alert.message,
    location: alert.location,
    building: alert.location,
    severity: priority === 'critical' ? 'critical' : priority === 'high' ? 'warning' : 'info',
    timestamp: dateText(alert.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    source: /sensor|iot/i.test(String(alert.source ?? '')) ? 'IoT Sensor' : 'Staff Report',
    isAcknowledged: alert.status !== 'ACTIVE',
    acknowledgedBy: alert.acknowledgedBy?.name,
    escalationLevel: 1,
    escalationTimerSeconds: 0,
    status: lower(alert.status) as SafetyAlert['status'],
  };
}

const emergencyStatus: Record<string, EmergencyStatus> = {
  REPORTED: 'Reported', ACKNOWLEDGED: 'Acknowledged', TEAM_ASSIGNED: 'Team Assigned',
  RESPONDING: 'Responding', ON_SCENE: 'On Scene', RESOLVED: 'Resolved', VERIFIED: 'Verified',
};

export function mapApiEmergency(incident: ApiRecord): EmergencyIncident {
  const reportedAt = incident.reportedAt ?? incident.createdAt;
  const rawTimeline = Array.isArray(incident.timeline) ? incident.timeline : [];
  const status = emergencyStatus[incident.status] ?? 'Reported';
  const assignedEntry = rawTimeline.find((entry: ApiRecord) => entry.status === 'TEAM_ASSIGNED');
  const assignedTeamName = typeof assignedEntry?.note === 'string' ? assignedEntry.note.replace(/^Assigned response team:\s*/, '') : undefined;
  return {
    id: incident.id,
    emergencyCode: incident.incidentNumber,
    type: incident.type,
    title: incident.type,
    description: incident.description,
    location: incident.location,
    building: incident.location,
    priority: lower(incident.priority, 'medium') as EmergencyIncident['priority'],
    status,
    reportedAt: dateText(reportedAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    reportedAtMs: new Date(reportedAt).getTime() || Date.now(),
    reportedBy: incident.reporter?.name || 'School user',
    assignedTeamName,
    acknowledgedAt: status === 'Acknowledged' ? 'Acknowledged' : undefined,
    resolvedAt: incident.resolvedAt ? dateText(incident.resolvedAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : undefined,
    verifiedAt: status === 'Verified' ? dateText(incident.updatedAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : undefined,
    resolutionNotes: rawTimeline.at(-1)?.note,
    timeline: rawTimeline.map((entry: ApiRecord, index: number) => ({
      id: `${incident.id}-timeline-${index}`,
      status: emergencyStatus[entry.status] ?? 'Reported',
      timestamp: dateText(entry.timestamp, { hour: '2-digit', minute: '2-digit' }),
      timestampMs: new Date(entry.timestamp).getTime() || Date.now(),
      updatedBy: entry.actor || incident.reporter?.name || 'School user',
      note: entry.note || `Emergency status: ${entry.status}`,
    })),
    source: 'manual',
  };
}

export function mapApiNotification(notification: ApiRecord): SystemNotification {
  const typeMap: Record<string, SystemNotification['notificationType']> = {
    new_report: 'new_problem', critical_alert: 'critical_safety', issue_assigned: 'issue_assigned',
    issue_resolved: 'issue_resolved', issue_verified: 'issue_verified', issue_status_changed: 'maintenance_started',
    emergency: 'emergency', emergency_status_changed: 'emergency',
  };
  const createdAt = notification.createdAt;
  const type = typeMap[notification.type] ?? 'info';
  const priority = type === 'critical_safety' || type === 'emergency' ? 'critical' : 'medium';
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: priority === 'critical' ? 'critical' : type === 'issue_resolved' || type === 'issue_verified' ? 'success' : 'info',
    notificationType: type,
    priority,
    timestamp: dateText(createdAt, { hour: '2-digit', minute: '2-digit' }),
    timestampMs: new Date(createdAt).getTime() || Date.now(),
    read: Boolean(notification.readAt),
    issueId: notification.issue?.issueNumber || notification.issueId,
  };
}