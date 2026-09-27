import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCw,
  Camera,
  MapPin,
  Calendar,
  Send,
  Upload,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IssueStatus, ProblemReport } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { SAMPLE_EVIDENCE_PHOTOS } from '../../data/initialData';
import { IssueDetailModal } from '../issues/IssueDetailModal';

export const MaintenanceDashboard: React.FC = () => {
  const {
    problems,
    currentUser,
    updateIssueStatus,
    resolveIssue,
    selectedIssueId,
    setSelectedIssueId,
  } = useApp();

  // Dialog states for updating progress or resolving
  const [activeTaskToResolve, setActiveTaskToResolve] = useState<ProblemReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('Fan motor replaced and tested successfully.');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=800&auto=format&fit=crop&q=80'
  );

  // Quick progress modal
  const [activeTaskToUpdate, setActiveTaskToUpdate] = useState<ProblemReport | null>(null);
  const [progressUpdateText, setProgressUpdateText] = useState('Diagnosed circuit fault. Swapping out worn capacitor.');

  // Filter tasks assigned to current technician or all maintenance tasks
  const assignedTasks = problems.filter(
    (p) => p.status === 'ASSIGNED' || (p.assignedTo && p.status !== 'RESOLVED')
  );
  const highPriorityTasks = problems.filter(
    (p) => (p.priority === 'high' || p.priority === 'critical') && p.status !== 'RESOLVED'
  );
  const inProgressTasks = problems.filter((p) => p.status === 'IN PROGRESS');
  const completedTasks = problems.filter((p) => p.status === 'RESOLVED');

  const handleStartWork = (task: ProblemReport) => {
    updateIssueStatus(
      task.id,
      'IN PROGRESS',
      `Technician ${currentUser.name} arrived on-site and commenced repair operations.`
    );
  };

  const handleConfirmProgress = () => {
    if (!activeTaskToUpdate) return;
    updateIssueStatus(
      activeTaskToUpdate.id,
      'IN PROGRESS',
      `${currentUser.name}: ${progressUpdateText}`
    );
    setActiveTaskToUpdate(null);
  };

  const handleConfirmResolve = () => {
    if (!activeTaskToResolve) return;
    resolveIssue(activeTaskToResolve.id, resolutionNotes, afterPhotoUrl);
    setActiveTaskToResolve(null);
  };

  return (
    <div className="space-y-6">
      {/* Header (Requirement 12) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Maintenance Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
              Field Technician Terminal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong>{currentUser.name}</strong> • Electrical &amp; Facilities Maintenance Lead
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Active Shift: 08:00 AM – 05:00 PM</span>
        </div>
      </div>

      {/* 4 Maintenance Metric Cards (Requirement 12) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600">Assigned Tasks</span>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {assignedTasks.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Queued for execution</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-rose-700">High Priority Tasks</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">
            {highPriorityTasks.length}
          </div>
          <p className="text-[11px] text-rose-600/80 mt-1 font-medium">Urgent resolution SLA</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-amber-700">Tasks In Progress</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2 font-mono">
            {inProgressTasks.length}
          </div>
          <p className="text-[11px] text-amber-700/80 mt-1">Technicians on-site</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-emerald-700">Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            {completedTasks.length}
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1">Closed &amp; verified</p>
        </div>
      </div>

      {/* Task Queue Cards (Requirement 12) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Assigned Work Orders &amp; Field Tasks
          </h2>
          <span className="text-xs text-slate-500">
            Click any task card to start, update notes, or mark resolved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((task) => (
            <div
              key={task.id}
              className={`p-5 rounded-2xl bg-white border transition shadow-sm flex flex-col justify-between ${
                task.status === 'IN PROGRESS'
                  ? 'border-blue-500 ring-1 ring-blue-500/30'
                  : task.status === 'RESOLVED'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header: ID, Priority, Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {task.issueId}
                    </span>
                    <StatusBadge status={task.priority} size="sm" />
                  </div>
                  <StatusBadge status={task.status} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1">{task.title}</h3>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {task.exactLocation}
                </p>

                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {task.description}
                </p>

                {/* Timestamps (Requirement 12) */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="block text-slate-400 text-[10px]">Reported Date</span>
                    <strong className="text-slate-700">{task.reportedDate}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">Assigned Date</span>
                    <strong className="text-slate-700">
                      {task.assignedTo?.assignedDate || 'Pending Assignment'}
                    </strong>
                  </div>
                </div>

                {/* Expected Resolution */}
                <div className="mt-2 text-[11px] text-slate-500">
                  Expected Resolution:{' '}
                  <strong className="text-blue-700">
                    {task.expectedResolution || 'Within 2 hours (Standard SLA)'}
                  </strong>
                </div>

                {/* Resolution summary if resolved */}
                {task.resolutionNotes && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    <strong className="block text-[10px] text-emerald-600 uppercase">Resolution Notes</strong>
                    {task.resolutionNotes}
                  </div>
                )}
              </div>

              {/* Action Buttons (Requirement 12: Start Work, Update Progress, Mark Resolved) */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIssueId(task.id)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  View Details &amp; History →
                </button>

                <div className="flex items-center gap-2">
                  {task.status === 'REPORTED' || task.status === 'ASSIGNED' ? (
                    <button
                      onClick={() => handleStartWork(task)}
                      className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Work</span>
                    </button>
                  ) : null}

                  {task.status === 'IN PROGRESS' && (
                    <>
                      <button
                        onClick={() => setActiveTaskToUpdate(task)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Update Progress</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTaskToResolve(task);
                          setResolutionNotes('Fan motor replaced and tested successfully.');
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Progress Dialog Modal */}
      {activeTaskToUpdate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900">
              Update Progress for {activeTaskToUpdate.issueId}
            </h3>
            <p className="text-xs text-slate-500">
              Provide status notes on parts requisition or repair steps taken
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Progress Note *
              </label>
              <textarea
                rows={3}
                value={progressUpdateText}
                onChange={(e) => setProgressUpdateText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTaskToUpdate(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmProgress}
                className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Resolved Dialog Modal (Requirement 12) */}
      {activeTaskToResolve && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-lg w-full space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Mark Issue Resolved • {activeTaskToResolve.issueId}
                </h3>
                <p className="text-xs text-slate-500">{activeTaskToResolve.title}</p>
              </div>
              <button
                onClick={() => setActiveTaskToResolve(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Resolution Notes (Requirement 12) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Notes (Required) *
              </label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder='e.g. "Fan motor replaced and tested successfully."'
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Upload After Photo (Requirement 12) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  Upload After Photo (Verification)
                </span>
                <span className="text-[10px] text-slate-400">Click to select proof photo</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_EVIDENCE_PHOTOS.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setAfterPhotoUrl(p.url)}
                    className={`rounded-xl border overflow-hidden cursor-pointer aspect-video relative transition ${
                      afterPhotoUrl === p.url ? 'ring-2 ring-emerald-500 border-emerald-500' : 'opacity-70'
                    }`}
                  >
                    <img src={p.url} alt="Proof" className="w-full h-full object-cover" />
                    {afterPhotoUrl === p.url && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 rounded-full text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTaskToResolve(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Close Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issueId={selectedIssueId}
        onClose={() => setSelectedIssueId(null)}
      />
    </div>
  );
};
