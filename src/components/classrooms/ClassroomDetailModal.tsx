import React from 'react';
import {
  X,
  GraduationCap,
  Thermometer,
  Flame,
  Zap,
  Droplets,
  Users,
  Calendar,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';

interface ClassroomDetailModalProps {
  classroomId: string | null;
  onClose: () => void;
}

export const ClassroomDetailModal: React.FC<ClassroomDetailModalProps> = ({
  classroomId,
  onClose,
}) => {
  const {
    classrooms,
    sensors,
    problems,
    setSelectedIssueId,
    setActiveTab,
  } = useApp();

  if (!classroomId) return null;

  const classroom = classrooms.find((c) => c.id === classroomId);
  if (!classroom) return null;

  // Find sensors associated with this room
  const roomSensors = sensors.filter(
    (s) =>
      s.roomId === classroom.id ||
      s.location.toLowerCase().includes(classroom.roomNumber.toLowerCase()) ||
      classroom.sensorIds.includes(s.sensorCode)
  );

  // Find problems reported for this classroom
  const roomProblems = problems.filter(
    (p) =>
      p.classroomNumber === classroom.roomNumber.replace(/[^0-9]/g, '') ||
      p.exactLocation.includes(classroom.roomNumber) ||
      p.title.includes(classroom.roomNumber)
  );

  const activeIssues = roomProblems.filter((p) => p.status !== 'RESOLVED');
  const pastIssues = roomProblems.filter((p) => p.status === 'RESOLVED');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <GraduationCap className="w-7 h-7 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold">{classroom.roomNumber}</h3>
                <StatusBadge status={classroom.status} size="sm" />
              </div>
              <p className="text-xs text-blue-200 mt-1">
                {classroom.buildingName} • Floor {classroom.floor} • In-Charge: {classroom.assignedTeacher || 'Staff'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-600">Students Present</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                {classroom.currentStudents} / {classroom.studentCapacity}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">93% Attendance</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-600">Temperature</span>
                <Thermometer className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                {classroom.temperature}°C
              </div>
              <span className="text-[10px] text-slate-500">Normal Range: 22-30°C</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-600">Smoke / Air</span>
                <Flame className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                {classroom.smokeStatus}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Clear / 0 ppm</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-600">Electrical System</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                {classroom.electricalStatus}
              </div>
              <span className="text-[10px] text-slate-500">Load monitored</span>
            </div>
          </div>

          {/* Connected IoT Sensors in this Classroom */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Connected IoT Sensor Nodes ({roomSensors.length})</span>
              <span className="text-[10px] text-slate-400">Live 5s Polling</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roomSensors.map((sensor) => (
                <div
                  key={sensor.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        {sensor.sensorCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{sensor.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Battery: {sensor.batteryPercentage}%</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-slate-900">{sensor.currentValue}</span>
                    <div className="mt-1">
                      <StatusBadge status={sensor.status} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Problems / Current Issues */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Active Reported Issues ({activeIssues.length})
            </h4>
            {activeIssues.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No active complaints or hazards logged for this classroom.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {activeIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => {
                      setSelectedIssueId(issue.id);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {issue.issueId}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{issue.title}</span>
                        <StatusBadge status={issue.priority} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{issue.description}</p>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                        <span>Reported by: {issue.reportedBy.name}</span>
                        {issue.assignedTo && (
                          <span className="text-blue-600 font-medium">
                            Assigned to: {issue.assignedTo.name} ({issue.assignedTo.team})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={issue.status} size="sm" />
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Maintenance & Inspection Log */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              Previous Maintenance &amp; Inspection History
            </h4>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Last Routine Safety Audit</span>
                <span className="font-semibold text-slate-900">{classroom.lastInspectionDate}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Certified Electrical Safety Check</span>
                <span className="font-semibold text-emerald-700">Passed (Valid till Nov 2026)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Resolved Complaints (History)</span>
                <span className="font-semibold text-slate-900">{pastIssues.length} resolved</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs text-slate-500">Spotted a defect in {classroom.roomNumber}?</span>
            <button
              onClick={() => {
                setActiveTab('report-problem');
                onClose();
              }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Problem in {classroom.roomNumber}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
