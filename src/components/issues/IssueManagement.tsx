import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  PlusCircle,
  Eye,
  ArrowUpDown,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IssueStatus, PriorityLevel } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { IssueDetailModal } from './IssueDetailModal';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

type SortField = 'reportedDate' | 'priority' | 'status' | 'issueId';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const STATUS_ORDER: Record<IssueStatus, number> = {
  REPORTED: 1,
  ASSIGNED: 2,
  'IN PROGRESS': 3,
  RESOLVED: 4,
  VERIFIED: 5,
  CLOSED: 6,
};

const PRIORITY_BADGE: Record<PriorityLevel, string> = {
  critical: 'bg-rose-100 text-rose-800 border border-rose-300',
  high: 'bg-orange-100 text-orange-800 border border-orange-300',
  medium: 'bg-amber-100 text-amber-800 border border-amber-300',
  low: 'bg-slate-100 text-slate-700 border border-slate-300',
};

const STATUS_BADGE_CLASSES: Record<IssueStatus, string> = {
  REPORTED: 'bg-slate-100 text-slate-700 border border-slate-300',
  ASSIGNED: 'bg-blue-100 text-blue-800 border border-blue-300',
  'IN PROGRESS': 'bg-amber-100 text-amber-800 border border-amber-300',
  RESOLVED: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  VERIFIED: 'bg-teal-100 text-teal-800 border border-teal-300',
  CLOSED: 'bg-slate-200 text-slate-600 border border-slate-300',
};

const ALL_CATEGORIES = [
  'Broken Fan', 'Broken Light', 'Damaged Desk', 'Damaged Chair', 'Projector Problem',
  'Smart Board Problem', 'Electrical Problem', 'Ceiling Damage', 'Wall Damage',
  'Door/Window Damage', 'Broken Door', 'Broken Window', 'Water Leakage',
  'Plumbing Problem', 'Cleanliness Problem', 'AC Problem', 'Internet/Wi-Fi Problem',
  'Sanitation & Plumbing', 'Playground Equipment', 'Security & Access',
  'Safety & Smoke Sensor', 'Water Facilities', 'Lab Equipment Problem', 'Computer Problem',
  'Floor Damage', 'Food Quality Problem', 'Hygiene Problem',
  'Ground/Safety Problem', 'Security Problem', 'Drainage Problem', 'Other',
];

const FILTER_CONTROL = 'px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200';

// ─── Image Preview Modal ──────────────────────────────────────────────────────
interface ImagePreviewModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ src, alt, onClose }) => (
  <div
    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onClose}
        className="absolute -top-10 right-0 text-white hover:text-slate-300 transition"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={src}
        alt={alt}
        className="w-full rounded-2xl object-contain max-h-[80vh] border border-white/20"
        onError={(e) => {
          e.currentTarget.src = 'https://placehold.co/600x400/1e293b/94a3b8?text=Image+Not+Available';
        }}
      />
      <p className="text-white/60 text-xs text-center mt-2">{alt}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const IssueManagement: React.FC = () => {
  const {
    problems,
    selectedIssueId,
    setSelectedIssueId,
    updateIssueStatus,
    setActiveTab,
    selectForAiAnalysis,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | IssueStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PriorityLevel>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [reporterFilter, setReporterFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('reportedDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(searchInput.trim().toLowerCase()), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const allDepts = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => { if (p.assignedTo?.team) set.add(p.assignedTo.team); });
    return Array.from(set).sort();
  }, [problems]);
  const allLocations = useMemo(() => Array.from(new Set(problems.map((problem) => problem.exactLocation))).sort(), [problems]);
  const allReporters = useMemo(() => Array.from(new Set(problems.map((problem) => problem.reportedBy.name))).sort(), [problems]);
  const allCategories = useMemo(() => Array.from(new Set([...ALL_CATEGORIES, ...problems.map((problem) => problem.category)])).sort(), [problems]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const filteredProblems = useMemo(() => {
    let list = problems.filter((issue) => {
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
      if (deptFilter !== 'all' && issue.assignedTo?.team !== deptFilter) return false;
      if (locationFilter !== 'all' && issue.exactLocation !== locationFilter) return false;
      if (reporterFilter !== 'all' && issue.reportedBy.name !== reporterFilter) return false;
      const issueDate = new Date(issue.reportedAtMs ?? Date.parse(issue.reportedDate));
      const localDate = Number.isNaN(issueDate.getTime()) ? '' : new Date(issueDate.getTime() - issueDate.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      if (fromDate && (!localDate || localDate < fromDate)) return false;
      if (toDate && (!localDate || localDate > toDate)) return false;
      if (searchQuery) {
        return (
          issue.issueId.toLowerCase().includes(searchQuery) ||
          issue.title.toLowerCase().includes(searchQuery) ||
          issue.exactLocation.toLowerCase().includes(searchQuery) ||
          issue.category.toLowerCase().includes(searchQuery) ||
          issue.reportedBy.name.toLowerCase().includes(searchQuery) ||
          (issue.reportedBy.phone?.toLowerCase().includes(searchQuery) ?? false) ||
          (issue.section?.toLowerCase().includes(searchQuery) ?? false) ||
          (issue.assignedTo?.team?.toLowerCase().includes(searchQuery) ?? false) ||
          (issue.assignedTo?.name?.toLowerCase().includes(searchQuery) ?? false)
        );
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'priority') {
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      } else if (sortField === 'status') {
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      } else if (sortField === 'issueId') {
        cmp = a.issueId.localeCompare(b.issueId);
      } else {
        cmp = (a.reportedAtMs ?? Date.parse(a.reportedDate)) - (b.reportedAtMs ?? Date.parse(b.reportedDate));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [problems, statusFilter, priorityFilter, categoryFilter, deptFilter, locationFilter, reporterFilter, fromDate, toDate, searchQuery, sortField, sortDir]);

  const counts = useMemo(() => ({
    all: problems.length,
    REPORTED: problems.filter((p) => p.status === 'REPORTED').length,
    ASSIGNED: problems.filter((p) => p.status === 'ASSIGNED').length,
    'IN PROGRESS': problems.filter((p) => p.status === 'IN PROGRESS').length,
    RESOLVED: problems.filter((p) => p.status === 'RESOLVED').length,
    VERIFIED: problems.filter((p) => p.status === 'VERIFIED').length,
  }), [problems]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const pagedProblems = filteredProblems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const handlePageChange = (p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  const handleExportCSV = () => {
    const headers = [
      'Issue ID', 'Problem', 'Room / Location', 'Category', 'Reporter Name', 'Phone Number',
      'Section', 'Reported Date', 'Reported Time', 'Priority', 'Assigned Department', 'Status', 'Image',
    ];
    const rows = filteredProblems.map((p) => [
      p.issueId,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.exactLocation.replace(/"/g, '""')}"`,
      p.category,
      p.reportedBy.name,
      p.reportedBy.phone ?? '',
      p.section ?? '',
      p.reportedDate,
      p.reportedTime,
      p.priority,
      p.assignedTo ? p.assignedTo.team : 'Unassigned',
      (p.beforeImage || p.images?.[0]?.url) ? 'Yes' : 'No',
      p.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `smart_school_issues_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortBtn: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <button
      type="button"
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-blue-700 transition group whitespace-nowrap"
    >
      {label}
      {sortField === field ? (
        sortDir === 'asc' ? <SortAsc className="w-3 h-3 text-blue-600" /> : <SortDesc className="w-3 h-3 text-blue-600" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
      )}
    </button>
  );

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || deptFilter !== 'all' || locationFilter !== 'all' || reporterFilter !== 'all' || fromDate !== '' || toDate !== '' || searchInput !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Issue Management Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Operations Dispatch</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Full lifecycle tracking: REPORTED → ASSIGNED → IN PROGRESS → RESOLVED. Reassign crews and adjust priority levels.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button onClick={handleExportCSV} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button onClick={() => setActiveTab('report-problem')} className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(
          [
            { label: 'All', value: counts.all, cls: 'text-slate-700' },
            { label: 'Reported', value: counts.REPORTED, cls: 'text-slate-700' },
            { label: 'Assigned', value: counts.ASSIGNED, cls: 'text-blue-800' },
            { label: 'In Progress', value: counts['IN PROGRESS'], cls: 'text-amber-800' },
            { label: 'Resolved', value: counts.RESOLVED, cls: 'text-emerald-800' },
            { label: 'Verified', value: counts.VERIFIED, cls: 'text-teal-800' },
          ] as const
        ).map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm text-center">
            <div className={`text-xl font-extrabold ${s.cls}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold border-b border-slate-100 pb-3">
          {(['all', 'REPORTED', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'VERIFIED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                statusFilter === tab ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab === 'all' ? 'All Issues' : tab}</span>
              <span className={`text-[10px] px-1.5 rounded-full ${statusFilter === tab ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Filter:</span>
          </div>

          <select aria-label="Filter by priority" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value as 'all' | PriorityLevel); setCurrentPage(1); }} className={FILTER_CONTROL}>
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select aria-label="Filter by category" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className={FILTER_CONTROL}>
            <option value="all">All Categories</option>
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select aria-label="Filter by department" value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }} className={FILTER_CONTROL}>
            <option value="all">All Departments</option>
            {allDepts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select aria-label="Filter by location" value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }} className={`${FILTER_CONTROL} max-w-[220px]`}>
            <option value="all">All Locations</option>
            {allLocations.map((location) => <option key={location} value={location}>{location}</option>)}
          </select>

          <select aria-label="Filter by reporter" value={reporterFilter} onChange={(e) => { setReporterFilter(e.target.value); setCurrentPage(1); }} className={`${FILTER_CONTROL} max-w-[190px]`}>
            <option value="all">All Reporters</option>
            {allReporters.map((reporter) => <option key={reporter} value={reporter}>{reporter}</option>)}
          </select>

          <label className="flex items-center gap-1.5 text-slate-500">
            <span>From</span>
            <input aria-label="Reported from date" type="date" value={fromDate} max={toDate || undefined} onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }} className={FILTER_CONTROL} />
          </label>
          <label className="flex items-center gap-1.5 text-slate-500">
            <span>To</span>
            <input aria-label="Reported to date" type="date" value={toDate} min={fromDate || undefined} onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }} className={FILTER_CONTROL} />
          </label>

          {hasActiveFilters && (
            <button
              onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setCategoryFilter('all'); setDeptFilter('all'); setLocationFilter('all'); setReporterFilter('all'); setFromDate(''); setToDate(''); setSearchInput(''); setCurrentPage(1); }}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <div className="ml-auto flex items-center gap-1.5 text-slate-500">
            <span>Show</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700">
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>per page</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search issue ID, problem, location, reporter, phone, category, or department"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="max-h-[72vh] overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-max table-fixed border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wide text-[10px] shadow-sm">
              <tr className="divide-x divide-slate-300 dark:divide-slate-700">
                <th className="w-[140px] border-b border-slate-300 dark:border-slate-700 p-2.5 pl-3"><SortBtn field="issueId" label="Issue ID" /></th>
                <th className="w-[220px] border-b border-slate-300 dark:border-slate-700 p-2.5">Problem / Issue</th>
                <th className="w-[125px] border-b border-slate-300 dark:border-slate-700 p-2.5">Room / Location</th>
                <th className="w-[110px] border-b border-slate-300 dark:border-slate-700 p-2.5">Category</th>
                <th className="w-[110px] border-b border-slate-300 dark:border-slate-700 p-2.5">Reporter Name</th>
                <th className="w-[120px] border-b border-slate-300 dark:border-slate-700 p-2.5">Phone Number</th>
                <th className="w-[60px] border-b border-slate-300 dark:border-slate-700 p-2.5">Section</th>
                <th className="w-[160px] border-b border-slate-300 dark:border-slate-700 p-2.5"><SortBtn field="reportedDate" label="Reported Date" /></th>
                <th className="w-[110px] border-b border-slate-300 dark:border-slate-700 p-2.5">Reported Time</th>
                <th className="w-[75px] border-b border-slate-300 dark:border-slate-700 p-2.5"><SortBtn field="priority" label="Priority" /></th>
                <th className="w-[130px] border-b border-slate-300 dark:border-slate-700 p-2.5">Assigned Department</th>
                <th className="w-[120px] border-b border-slate-300 dark:border-slate-700 p-2.5"><SortBtn field="status" label="Status" /></th>
                <th className="w-[65px] border-b border-slate-300 dark:border-slate-700 p-2.5 text-center">Image</th>
                <th className="w-[140px] border-b border-slate-300 dark:border-slate-700 p-2.5 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {pagedProblems.length === 0 ? (
                <tr>
                  <td colSpan={14} className="border-x border-slate-200 dark:border-slate-700 p-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <ClipboardList className="w-12 h-12 opacity-30" />
                      <div className="font-semibold text-slate-600 dark:text-slate-300 text-sm">No issues found</div>
                      <p className="text-xs max-w-xs">No tickets match your current filters. Try adjusting the filters or report a new problem.</p>
                      <button onClick={() => setActiveTab('report-problem')} className="mt-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition">
                        Report New Problem
                      </button>
                    </div>
                  </td>
                </tr>
              ) : pagedProblems.map((issue) => {
                const imageUrl = issue.beforeImage || issue.images?.[0]?.url;
                const cellClass = 'border-r border-slate-200 dark:border-slate-700 px-3 py-3 align-middle text-slate-700 dark:text-slate-200 truncate overflow-hidden whitespace-nowrap';
                return (
                  <tr key={issue.id} className="group odd:bg-white even:bg-slate-50/70 hover:bg-blue-50/70 dark:odd:bg-slate-900 dark:even:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">
                    <td className={`${cellClass} pl-4 font-mono font-bold text-blue-700 dark:text-blue-300`} title={issue.issueId}>{issue.issueId}</td>
                    <td className={cellClass} title={`${issue.title} — ${issue.description}`}>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1" title={issue.title}>{issue.title}</div>
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2" title={issue.description}>{issue.description}</div>
                    </td>
                    <td className={cellClass} title={issue.exactLocation}>
                      <div className="font-medium truncate" title={issue.exactLocation}>{issue.exactLocation}</div>
                      <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{issue.locationType}</div>
                    </td>
                    <td className={cellClass} title={issue.category}><span className="inline-flex max-w-full rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 text-[10px] font-semibold text-indigo-800 dark:text-indigo-200">{issue.category}</span></td>
                    <td className={`${cellClass} font-medium`} title={issue.reportedBy.name}>{issue.reportedBy.name}</td>
                    <td className={`${cellClass} font-mono text-[11px]`} title={issue.reportedBy.phone || 'No phone number'}>{issue.reportedBy.phone || <span className="text-slate-400">—</span>}</td>
                    <td className={cellClass} title={issue.section || 'No section'}>{issue.section || <span className="text-slate-400">—</span>}</td>
                    <td className={cellClass} title={issue.reportedDate}>{issue.reportedDate}</td>
                    <td className={`${cellClass} font-mono text-[11px]`} title={issue.reportedTime}>{issue.reportedTime}</td>
                    <td className={cellClass} title={issue.priority}>
                      <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${PRIORITY_BADGE[issue.priority]}`}>{issue.priority}</span>
                    </td>
                    <td className={cellClass} title={issue.assignedTo?.team || 'Unassigned'}>
                      {issue.assignedTo ? <span className="font-semibold text-slate-800 dark:text-slate-100">{issue.assignedTo.team}</span> : <span className="text-amber-700 dark:text-amber-300 font-medium">Unassigned</span>}
                    </td>
                    <td className={cellClass} title={issue.status}>
                      <select aria-label={`Change status for ${issue.issueId}`} value={issue.status} onChange={(event) => updateIssueStatus(issue.id, event.target.value as IssueStatus)} className={`max-w-full text-[10px] font-bold px-2 py-1.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${STATUS_BADGE_CLASSES[issue.status]}`}>
                        <option value="REPORTED">REPORTED</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="IN PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="VERIFIED">VERIFIED</option>
                      </select>
                    </td>
                    <td className={`${cellClass} text-center`} title={imageUrl ? 'View image preview' : 'No image attached'}>
                      {imageUrl ? <button type="button" onClick={() => setPreviewImage({ src: imageUrl, alt: issue.title })} className="mx-auto block h-9 w-12 overflow-hidden rounded border border-slate-300 dark:border-slate-600" title="View image" aria-label={`View image for ${issue.issueId}`}><img src={imageUrl} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} /></button> : <span className="text-slate-400">—</span>}
                    </td>
                    <td className={`${cellClass} border-r-0 pr-4 text-right`} title={`Actions for ${issue.issueId}`}>
                      <div className="inline-flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedIssueId(issue.id)} className="rounded-md border border-slate-300 dark:border-slate-600 px-2 py-1.5 font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300" title="View details">View</button>
                        <button onClick={() => setSelectedIssueId(issue.id)} className="rounded-md border border-blue-200 dark:border-blue-800 px-2 py-1.5 font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50" title="Assign department">Assign</button>
                        <button onClick={() => selectForAiAnalysis({ id: issue.issueId, itemType: 'problem', title: issue.title, category: issue.category, location: issue.exactLocation, description: issue.description, severity: issue.priority, imageUrl })} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300" title="AI Safety Analysis" aria-label={`AI safety analysis for ${issue.issueId}`}><Sparkles className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing {pagedProblems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredProblems.length)} of {filteredProblems.length} tickets
            {filteredProblems.length !== problems.length && ` (filtered from ${problems.length} total)`}
          </span>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] mr-2">Live Sync: Active</span>

            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100 transition">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-7 h-7 rounded-lg border text-xs font-bold transition ${currentPage === page ? 'bg-blue-700 text-white border-blue-700' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                >
                  {page}
                </button>
              );
            })}

            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100 transition">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal src={previewImage.src} alt={previewImage.alt} onClose={() => setPreviewImage(null)} />
      )}

      {/* Detail Modal */}
      <IssueDetailModal issueId={selectedIssueId} onClose={() => setSelectedIssueId(null)} />
    </div>
  );
};
