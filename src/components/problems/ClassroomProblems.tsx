import React, { useState } from 'react';
import {
  AlertOctagon,
  Search,
  Filter,
  PlusCircle,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  ChevronRight,
  Camera,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProblemCategory, PriorityLevel, ProblemReport } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { SAMPLE_EVIDENCE_PHOTOS } from '../../data/initialData';

const CLASSROOM_CATEGORIES: ProblemCategory[] = [
  'Broken Fan',
  'Broken Light',
  'Damaged Desk',
  'Damaged Chair',
  'Projector Problem',
  'Smart Board Problem',
  'Electrical Problem',
  'Ceiling Damage',
  'Wall Damage',
  'Door/Window Damage',
  'Water Leakage',
  'AC Problem',
  'Internet/Wi-Fi Problem',
  'Other',
];

export const ClassroomProblems: React.FC = () => {
  const {
    problems,
    currentUser,
    addProblemReport,
    setSelectedIssueId,
    setActiveTab,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('Broken Fan');
  const [classroomNumber, setClassroomNumber] = useState('103');
  const [building, setBuilding] = useState('Block A');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [description, setDescription] = useState('');
  const [selectedSamplePhoto, setSelectedSamplePhoto] = useState<string>('');
  const [submittedIssue, setSubmittedIssue] = useState<ProblemReport | null>(null);

  // Filter problems for classrooms
  const classroomProblemsList = problems.filter((p) => {
    const isClassroom =
      p.locationType === 'Classroom' ||
      p.classroomNumber ||
      p.exactLocation.toLowerCase().includes('room');

    if (!isClassroom) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && p.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.issueId.toLowerCase().includes(q) ||
        p.exactLocation.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addProblemReport({
      title,
      category,
      description,
      locationType: 'Classroom',
      building,
      floor: classroomNumber.startsWith('1') ? 'Floor 1' : 'Floor 2',
      classroomNumber,
      exactLocation: `${building} → Floor ${classroomNumber.startsWith('1') ? '1' : '2'} → Classroom ${classroomNumber}`,
      priority,
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role === 'teacher' ? 'Teacher' : 'Staff',
        email: currentUser.email,
      },
      images: selectedSamplePhoto
        ? [
            {
              id: `img-${Date.now()}`,
              url: selectedSamplePhoto,
              type: 'reported',
              uploadedAt: 'Just now',
            },
          ]
        : [],
      beforeImage: selectedSamplePhoto || undefined,
      source: 'human',
    });

    setSubmittedIssue(created);
    // Reset form
    setTitle('');
    setDescription('');
    setSelectedSamplePhoto('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Problems Inside Classrooms
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Staff &amp; Faculty Reporting Module
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dedicated portal for reporting defects in furniture, electrical fixtures, smart boards, ceiling, and teaching amenities.
          </p>
        </div>

        <button
          onClick={() => {
            setIsReportFormOpen(true);
            setSubmittedIssue(null);
          }}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Report Classroom Problem</span>
        </button>
      </div>

      {/* Embedded Quick Report Modal / Drawer */}
      {isReportFormOpen && (
        <div className="bg-gradient-to-br from-blue-50/60 to-white rounded-2xl p-6 border-2 border-blue-200 shadow-md animate-fadeIn">
          {submittedIssue ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Problem successfully reported</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your issue has been logged into the school maintenance dispatch engine and assigned to the relevant team.
              </p>
              <div className="inline-block p-3 rounded-xl bg-white border border-slate-200 font-mono text-sm font-bold text-blue-700">
                Issue ID: {submittedIssue.issueId}
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setSelectedIssueId(submittedIssue.id)}
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition"
                >
                  Track Issue Details →
                </button>
                <button
                  onClick={() => {
                    setSubmittedIssue(null);
                    setIsReportFormOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-blue-700" />
                  Report Problem Inside Classroom
                </h3>
                <button
                  type="button"
                  onClick={() => setIsReportFormOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Problem Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Broken Fan, Flickering Smart Board, Damaged Desk"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                {/* Problem Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Problem Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProblemCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    {CLASSROOM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Classroom Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classroom Number *
                  </label>
                  <select
                    value={classroomNumber}
                    onChange={(e) => setClassroomNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="101">Classroom 101</option>
                    <option value="102">Classroom 102</option>
                    <option value="103">Classroom 103</option>
                    <option value="104">Classroom 104</option>
                    <option value="201">Classroom 201</option>
                    <option value="202">Classroom 202</option>
                    <option value="203">Classroom 203</option>
                    <option value="204">Classroom 204</option>
                  </select>
                </div>

                {/* Building */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Building *
                  </label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="Block A">Block A (Junior Wing)</option>
                    <option value="Block B">Block B (Senior Wing)</option>
                    <option value="Science Block">Science &amp; STEM Block</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="low">Low (Cosmetic/Minor)</option>
                    <option value="medium">Medium (Requires attention)</option>
                    <option value="high">High (Disrupting class)</option>
                    <option value="critical">Critical (Safety hazard)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the exact issue, student safety risks, or symptoms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              {/* Upload Photograph / Sample Photo Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    Upload Photograph / Select Evidence Photo
                  </span>
                  <span className="text-[10px] text-slate-400">Click to attach</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SAMPLE_EVIDENCE_PHOTOS.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedSamplePhoto(photo.url)}
                      className={`relative rounded-xl border overflow-hidden cursor-pointer aspect-video transition ${
                        selectedSamplePhoto === photo.url
                          ? 'border-blue-600 ring-2 ring-blue-500'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1 text-[9px] text-white font-medium truncate">
                        {photo.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Submit Problem Report
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search classroom issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Categories</option>
            {CLASSROOM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Classroom Problems List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classroomProblemsList.map((issue) => (
          <div
            key={issue.id}
            onClick={() => setSelectedIssueId(issue.id)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Header with Issue ID and Status */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {issue.issueId}
                </span>
                <StatusBadge status={issue.status} size="sm" />
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                {issue.title}
              </h3>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-slate-500 font-medium">{issue.exactLocation}</span>
                <StatusBadge status={issue.priority} size="sm" />
              </div>

              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{issue.description}</p>

              {/* Photo preview if attached */}
              {issue.images && issue.images.length > 0 && (
                <div className="mt-3 rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100">
                  <img
                    src={issue.images[0].url}
                    alt={issue.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate max-w-[150px]">
                By: <strong className="text-slate-700">{issue.reportedBy.name}</strong>
              </span>
              <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition text-[11px]">
                Details
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
