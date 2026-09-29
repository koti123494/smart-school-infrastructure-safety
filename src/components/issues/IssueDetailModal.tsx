import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Send,
  Camera,
  ArrowRight,
  ShieldCheck,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IssueStatus, PriorityLevel } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface IssueDetailModalProps {
  issueId: string | null;
  onClose: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issueId, onClose }) => {
  const {
    problems,
    teams,
    currentUser,
    updateIssueStatus,
    assignIssue,
    resolveIssue,
    selectForAiAnalysis,
  } = useApp();

  const [newNote, setNewNote] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0].id);
  const [techName, setTechName] = useState(teams[0].members[0]);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolutionText, setResolutionText] = useState('Fan motor replaced and tested successfully.');
  const [resolutionAfterPhoto, setResolutionAfterPhoto] = useState(
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
  );

  if (!issueId) return null;

  const issue = problems.find((p) => p.id === issueId || p.issueId === issueId);
  if (!issue) return null;

  const steps: IssueStatus[] = ['REPORTED', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED'];
  const currentStepIdx = steps.indexOf(issue.status);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    updateIssueStatus(issue.id, issue.status, `${currentUser.name} (${currentUser.role}): ${newNote}`);
    setNewNote('');
  };

  const handleStatusChange = (newStatus: IssueStatus) => {
    if (newStatus === 'RESOLVED') {
      setShowResolveDialog(true);
    } else {
      updateIssueStatus(issue.id, newStatus, `Status transitioned to ${newStatus} by ${currentUser.name}`);
    }
  };

  const handleAssignTeam = () => {
    assignIssue(issue.id, selectedTeamId, techName);
  };

  const handleCompleteResolution = () => {
    resolveIssue(issue.id, resolutionText, resolutionAfterPhoto);
    setShowResolveDialog(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-400/30">
                  {issue.issueId}
                </span>
                <StatusBadge status={issue.status} size="sm" />
                <StatusBadge status={issue.priority} size="sm" />
              </div>
              <h2 className="text-xl font-bold mt-1 text-white">{issue.title}</h2>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {issue.exactLocation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                selectForAiAnalysis({
                  id: issue.issueId,
                  itemType: 'problem',
                  title: issue.title,
                  category: issue.category,
                  location: issue.exactLocation,
                  description: issue.description,
                  severity: issue.priority,
                  imageUrl: issue.beforeImage || issue.images[0]?.url,
                });
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Safety Advice</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Visual Interactive Status Timeline (Requirement 22) */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Lifecycle Timeline: REPORTED → ASSIGNED → IN PROGRESS → RESOLVED
            </h4>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={st} className="flex flex-col items-center relative z-10">
                    <button
                      onClick={() => handleStatusChange(st)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-400 hover:border-slate-400'
                      }`}
                      title={`Click to set status to ${st}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </button>
                    <span
                      className={`text-[11px] font-bold mt-2 uppercase ${
                        isCurrent ? 'text-blue-700' : isPassed ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Issue Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: General Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                Ticket Details
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Reported By:</span>
                <strong className="text-slate-800">
                  {issue.reportedBy.name} ({issue.reportedBy.role})
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reported Timestamp:</span>
                <strong className="text-slate-800">
                  {issue.reportedDate} at {issue.reportedTime}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <strong className="text-slate-800">{issue.category}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Source:</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold uppercase text-[10px]">
                  {issue.source === 'human' ? 'Staff Reported' : 'IoT Automated Alert'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Issue Description:</span>
                <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                  {issue.description}
                </p>
              </div>
            </div>

            {/* Right: Assigned Crew & Resolution Notes */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Assigned Maintenance
                </h4>
                {currentUser.role === 'admin' && (
                  <span className="text-[10px] text-blue-600 font-semibold">Change Crew</span>
                )}
              </div>

              {issue.assignedTo ? (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-sm text-slate-900">{issue.assignedTo.name}</strong>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                      {issue.assignedTo.team}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Assigned: {issue.assignedTo.assignedDate}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                  Not yet assigned to a technician.
                </div>
              )}

              {/* Crew Reassignment for Admin */}
              <div className="flex items-center gap-2 pt-1">
                <select
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    const team = teams.find((t) => t.id === e.target.value);
                    if (team && team.members.length > 0) setTechName(team.members[0]);
                  }}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white w-full"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAssignTeam}
                  className="px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition whitespace-nowrap"
                >
                  Assign
                </button>
              </div>

              {/* Maintenance & Resolution Notes */}
              {issue.maintenanceNotes && (
                <div>
                  <span className="text-slate-500 block mb-1">Technician Work Notes:</span>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700">
                    {issue.maintenanceNotes}
                  </div>
                </div>
              )}

              {issue.resolutionNotes && (
                <div>
                  <span className="text-slate-500 block mb-1">Resolution Summary:</span>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                    {issue.resolutionNotes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photographic Evidence: Before and After Images (Requirement 22) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-600" />
              Photographic Evidence &amp; Visual Verification
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  1. Reported / Before Photo
                </span>
                <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-200 relative">
                  {issue.beforeImage || (issue.images && issue.images[0]?.url) ? (
                    <img
                      src={issue.beforeImage || issue.images[0].url}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      No photograph attached
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                    BEFORE REPAIR
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  2. After Repair Photo (Verified)
                </span>
                <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-200 relative">
                  {issue.afterImage ? (
                    <img
                      src={issue.afterImage}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-400 p-4 text-center">
                      <span>Pending resolution verification photograph</span>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                    AFTER REPAIR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Incident Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              AI Incident Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="space-y-2 rounded-xl bg-white/70 p-3 border border-sky-200">
                <div><span className="font-semibold text-slate-500 block">What happened</span><span>{issue.title}</span></div>
                <div><span className="font-semibold text-slate-500 block">Where it happened</span><span>{issue.exactLocation}</span></div>
                <div><span className="font-semibold text-slate-500 block">When it happened</span><span>{issue.reportedDate} at {issue.reportedTime}</span></div>
                <div><span className="font-semibold text-slate-500 block">Reported problem</span><span>{issue.description}</span></div>
              </div>
              <div className="space-y-2 rounded-xl bg-white/70 p-3 border border-sky-200">
                <div><span className="font-semibold text-slate-500 block">Sensor readings</span><span>{issue.source === 'sensor_auto' ? 'Automated sensor data reviewed' : 'Manual staff observation recorded'}</span></div>
                <div><span className="font-semibold text-slate-500 block">Actions taken</span><span>{issue.history.slice(-1)[0]?.comment || 'No action details recorded yet.'}</span></div>
                <div><span className="font-semibold text-slate-500 block">Maintenance status</span><span>{issue.status}</span></div>
                <div><span className="font-semibold text-slate-500 block">Resolution</span><span>{issue.resolutionNotes || 'Pending final resolution notes.'}</span></div>
                <div><span className="font-semibold text-slate-500 block">Final status</span><span>{issue.status}</span></div>
              </div>
            </div>
          </div>

          {/* Activity History Audit Trail (Requirement 22) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Activity History &amp; Audit Trail
            </h4>

            <div className="space-y-2 text-xs">
              {issue.history.map((entry) => (
                <div
                  key={entry.id}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={entry.status} size="sm" />
                      <strong className="text-slate-800">{entry.updatedBy}</strong>
                    </div>
                    <p className="text-slate-600 mt-1">{entry.comment}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    {entry.timestamp}
                  </span>
                </div>
              ))}
            </div>

            {/* Add note input */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Add technician comment or operational note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              />
              <button
                type="button"
                onClick={handleAddNote}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Note</span>
              </button>
            </div>
          </div>

          {/* Resolution Dialog if active */}
          {showResolveDialog && (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-3 text-xs animate-fadeIn">
              <h4 className="font-bold text-emerald-900 text-sm">Mark Issue as RESOLVED</h4>
              <p className="text-emerald-700">
                Please provide resolution notes and verify that safety standards have been re-tested.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution Notes *
                </label>
                <textarea
                  rows={2}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolveDialog(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteResolution}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                >
                  Confirm &amp; Complete Ticket
                </button>
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-mono">
              SLA Standard: Response &lt; 20m • Resolution &lt; 3h
            </span>

            <div className="flex items-center gap-2">
              {issue.status !== 'IN PROGRESS' && issue.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleStatusChange('IN PROGRESS')}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition"
                >
                  Start Work
                </button>
              )}
              {issue.status !== 'RESOLVED' && (
                <button
                  onClick={() => setShowResolveDialog(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Resolved</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
