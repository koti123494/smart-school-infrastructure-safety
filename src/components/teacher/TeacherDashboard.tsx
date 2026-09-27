import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { IssueDetailModal } from '../issues/IssueDetailModal';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    problems,
    selectedIssueId,
    setSelectedIssueId,
    setActiveTab,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter problems reported by teacher Priya Sharma or all staff
  const myReports = problems.filter((p) => {
    // If logged in user is Priya Sharma, show hers, or fallback to matching role
    if (currentUser.role === 'teacher') {
      return (
        p.reportedBy.id === currentUser.id ||
        p.reportedBy.name.toLowerCase().includes('sharma') ||
        p.reportedBy.name.toLowerCase().includes('priya') ||
        p.reportedBy.role.toLowerCase().includes('teacher')
      );
    }
    return true;
  });

  const counts = {
    all: myReports.length,
    REPORTED: myReports.filter((p) => p.status === 'REPORTED').length,
    ASSIGNED: myReports.filter((p) => p.status === 'ASSIGNED').length,
    'IN PROGRESS': myReports.filter((p) => p.status === 'IN PROGRESS').length,
    RESOLVED: myReports.filter((p) => p.status === 'RESOLVED').length,
  };

  const filteredReports = myReports.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Teacher &amp; Staff Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Staff Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <strong>{currentUser.name}</strong> • Grade 8 Coordinator &amp; Science Faculty
          </p>
        </div>

        {/* Button: + Report New Problem (Requirement 13) */}
        <button
          onClick={() => setActiveTab('report-problem')}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Report New Problem</span>
        </button>
      </div>

      {/* 4 Metric Cards (Requirement 13: Reported, Assigned, In Progress, Resolved) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Reported */}
        <div
          onClick={() => setFilterStatus('REPORTED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'REPORTED'
              ? 'border-blue-600 bg-blue-50/70 shadow-sm'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-blue-900">Reported</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-2 font-mono">
            {counts.REPORTED}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting dispatch</p>
        </div>

        {/* Card 2: Assigned */}
        <div
          onClick={() => setFilterStatus('ASSIGNED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'ASSIGNED'
              ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-indigo-900">Assigned</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-900 mt-2 font-mono">
            {counts.ASSIGNED}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Crew scheduled</p>
        </div>

        {/* Card 3: In Progress */}
        <div
          onClick={() => setFilterStatus('IN PROGRESS')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'IN PROGRESS'
              ? 'border-amber-600 bg-amber-50/70 shadow-sm'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-amber-900">In Progress</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2 font-mono">
            {counts['IN PROGRESS']}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Work underway on-site</p>
        </div>

        {/* Card 4: Resolved */}
        <div
          onClick={() => setFilterStatus('RESOLVED')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'RESOLVED'
              ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-emerald-900">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            {counts.RESOLVED}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Repairs completed</p>
        </div>
      </div>

      {/* My Reports Section (Requirement 13) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">My Reported Issues</h2>
            <p className="text-xs text-slate-500">
              Track the live progress of problems you reported across the school campus
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {['all', 'REPORTED', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl transition ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedIssueId(report.id)}
              className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {report.issueId}
                  </span>
                  <StatusBadge status={report.status} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                  {report.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {report.exactLocation}
                </p>

                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                  {report.description}
                </p>

                {/* Assigned Crew Info (Requirement 13) */}
                <div className="mt-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Assigned Maintenance
                  </span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {report.assignedTo ? report.assignedTo.team : 'Queuing for technician assignment'}
                  </div>
                  {report.assignedTo && (
                    <div className="text-[11px] text-blue-700 mt-0.5">
                      Technician: {report.assignedTo.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Reported: {report.reportedDate}</span>
                <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition text-[11px]">
                  Track Timeline
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drilldown Modal */}
      <IssueDetailModal
        issueId={selectedIssueId}
        onClose={() => setSelectedIssueId(null)}
      />
    </div>
  );
};
