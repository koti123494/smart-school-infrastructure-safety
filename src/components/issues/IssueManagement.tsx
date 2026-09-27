import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  PlusCircle,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  ArrowUpDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IssueStatus, PriorityLevel } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { IssueDetailModal } from './IssueDetailModal';

export const IssueManagement: React.FC = () => {
  const {
    problems,
    teams,
    selectedIssueId,
    setSelectedIssueId,
    updateIssueStatus,
    assignIssue,
    setActiveTab,
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | IssueStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PriorityLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProblems = problems.filter((issue) => {
    if (activeTabFilter !== 'all' && issue.status !== activeTabFilter) return false;
    if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        issue.issueId.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.exactLocation.toLowerCase().includes(q) ||
        issue.reportedBy.name.toLowerCase().includes(q) ||
        (issue.assignedTo && issue.assignedTo.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const counts = {
    all: problems.length,
    REPORTED: problems.filter((p) => p.status === 'REPORTED').length,
    ASSIGNED: problems.filter((p) => p.status === 'ASSIGNED').length,
    'IN PROGRESS': problems.filter((p) => p.status === 'IN PROGRESS').length,
    RESOLVED: problems.filter((p) => p.status === 'RESOLVED').length,
  };

  const handleExportCSV = () => {
    const headers = ['Issue ID', 'Problem', 'Location', 'Reported By', 'Priority', 'Assigned To', 'Status', 'Date'];
    const rows = filteredProblems.map((p) => [
      p.issueId,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.exactLocation.replace(/"/g, '""')}"`,
      p.reportedBy.name,
      p.priority,
      p.assignedTo ? p.assignedTo.name : 'Unassigned',
      p.status,
      p.reportedDate,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_school_issues_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Issue Management Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Operations Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Full lifecycle tracking: REPORTED → ASSIGNED → IN PROGRESS → RESOLVED. Reassign crews and adjust priority levels.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('report-problem')}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        {/* Status Tab Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {(['all', 'REPORTED', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTabFilter(tab)}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  activeTabFilter === tab
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab === 'all' ? 'All Issues' : tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTabFilter === tab ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'all' | PriorityLevel)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Issue ID, problem name, location, reporter, or technician..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Main Issue Table (Requirement 11) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 pl-5">Issue ID</th>
                <th className="p-3.5">Problem</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Reported By</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Assigned To</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right pr-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No tickets found matching current search or filters.
                  </td>
                </tr>
              ) : (
                filteredProblems.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    {/* Issue ID */}
                    <td className="p-3.5 pl-5 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {issue.issueId}
                    </td>

                    {/* Problem */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                        {issue.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{issue.category}</div>
                    </td>

                    {/* Location */}
                    <td className="p-3.5 text-slate-700 max-w-xs truncate">
                      {issue.exactLocation}
                    </td>

                    {/* Reported By */}
                    <td className="p-3.5 text-slate-700 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{issue.reportedBy.name}</div>
                      <div className="text-[10px] text-slate-400">{issue.reportedBy.role}</div>
                    </td>

                    {/* Priority - Editable inline */}
                    <td className="p-3.5 whitespace-nowrap">
                      <StatusBadge status={issue.priority} size="sm" />
                    </td>

                    {/* Assigned To - Editable inline */}
                    <td className="p-3.5 text-slate-700 whitespace-nowrap">
                      {issue.assignedTo ? (
                        <div>
                          <div className="font-semibold text-slate-900">{issue.assignedTo.name}</div>
                          <div className="text-[10px] text-blue-600 font-medium">
                            {issue.assignedTo.team}
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Status - Direct Transition Dropdown (Requirement 11) */}
                    <td className="p-3.5 whitespace-nowrap">
                      <select
                        value={issue.status}
                        onChange={(e) => updateIssueStatus(issue.id, e.target.value as IssueStatus)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none transition cursor-pointer ${
                          issue.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : issue.status === 'IN PROGRESS'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : issue.status === 'ASSIGNED'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="REPORTED">REPORTED</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="IN PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </td>

                    {/* View Action */}
                    <td className="p-3.5 text-right pr-5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedIssueId(issue.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold transition inline-flex items-center gap-1 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredProblems.length} tickets</span>
          <span className="font-mono text-[11px]">Live Sync: Active</span>
        </div>
      </div>

      {/* Detailed Drilldown Modal */}
      <IssueDetailModal
        issueId={selectedIssueId}
        onClose={() => setSelectedIssueId(null)}
      />
    </div>
  );
};
