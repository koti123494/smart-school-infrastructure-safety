import React, { useState } from 'react';
import {
  Trees,
  Droplets,
  Zap,
  Building2,
  Car,
  UtensilsCrossed,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Camera,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocationType, PriorityLevel, ProblemCategory, ProblemReport } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { SAMPLE_EVIDENCE_PHOTOS } from '../../data/initialData';

const SURROUNDINGS_ZONES = [
  {
    id: 'zone-playground',
    name: 'Playground',
    locationType: 'Playground' as LocationType,
    icon: Trees,
    issues: ['Broken equipment', 'Damaged ground', 'Unsafe objects', 'Water accumulation'],
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'zone-washrooms',
    name: 'Washrooms',
    locationType: 'Washroom' as LocationType,
    icon: Droplets,
    issues: ['Water leakage', 'Broken taps', 'Blocked drainage', 'Electrical problems', 'Hygiene problems'],
    bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  },
  {
    id: 'zone-corridors',
    name: 'Corridors',
    locationType: 'Corridor' as LocationType,
    icon: Building2,
    issues: ['Broken lights', 'Slippery floor', 'Damaged ceiling', 'Electrical problems'],
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'zone-entrance',
    name: 'School Entrance',
    locationType: 'School Entrance' as LocationType,
    icon: ShieldAlert,
    issues: ['Gate damage', 'Lighting problems', 'Security-related infrastructure issues'],
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    id: 'zone-parking',
    name: 'Parking Area',
    locationType: 'Parking Area' as LocationType,
    icon: Car,
    issues: ['Damaged surface', 'Lighting problems', 'Water accumulation'],
    bg: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  {
    id: 'zone-canteen',
    name: 'Canteen',
    locationType: 'Canteen' as LocationType,
    icon: UtensilsCrossed,
    issues: ['Gas/safety warning', 'Water leakage', 'Electrical issues', 'Damaged equipment'],
    bg: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  {
    id: 'zone-water',
    name: 'Water Facilities',
    locationType: 'Water Tank' as LocationType,
    icon: Droplets,
    issues: ['Tank leakage', 'Pipe leakage', 'Low water supply'],
    bg: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    id: 'zone-electrical',
    name: 'Electrical Infrastructure',
    locationType: 'Electrical Room' as LocationType,
    icon: Zap,
    issues: ['Exposed wires', 'Electrical panel warning', 'Power fluctuations', 'Overheating'],
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
];

export const SurroundingsProblems: React.FC = () => {
  const { problems, currentUser, addProblemReport, setSelectedIssueId } = useApp();

  const [selectedZone, setSelectedZone] = useState(SURROUNDINGS_ZONES[0]);
  const [selectedSubProblem, setSelectedSubProblem] = useState(SURROUNDINGS_ZONES[0].issues[0]);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [specificLocation, setSpecificLocation] = useState('Central Outdoor Area');
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [submittedReport, setSubmittedReport] = useState<ProblemReport | null>(null);

  // Filter problems for outdoor & non-classroom surroundings
  const surroundingsProblems = problems.filter((p) => p.locationType !== 'Classroom');

  const handleZoneSelect = (zone: typeof SURROUNDINGS_ZONES[0]) => {
    setSelectedZone(zone);
    setSelectedSubProblem(zone.issues[0]);
    setSpecificLocation(zone.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addProblemReport({
      title: `${selectedZone.name}: ${selectedSubProblem}`,
      category: 'Other',
      description: description || `${selectedSubProblem} reported at ${specificLocation}.`,
      locationType: selectedZone.locationType,
      building: selectedZone.name,
      exactLocation: `${selectedZone.name} • ${specificLocation}`,
      priority,
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email,
      },
      images: selectedPhoto
        ? [
            {
              id: `img-${Date.now()}`,
              url: selectedPhoto,
              type: 'reported',
              uploadedAt: 'Just now',
            },
          ]
        : [],
      beforeImage: selectedPhoto || undefined,
      source: 'human',
    });

    setSubmittedReport(created);
    setDescription('');
    setSelectedPhoto('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              School Surroundings Problems
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Campus Exterior &amp; Common Facilities
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor and report infrastructure hazards in playgrounds, washrooms, corridors, electrical rooms, and water supplies.
          </p>
        </div>
      </div>

      {/* Interactive Campus Zone Hotspots (Requirement 9) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>Select Campus Facility / Surroundings Zone</span>
          <span className="text-xs text-slate-400 font-normal">Step 1 of 2: Pick location</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SURROUNDINGS_ZONES.map((zone) => {
            const Icon = zone.icon;
            const isSelected = selectedZone.id === zone.id;

            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => handleZoneSelect(zone)}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50/50 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${zone.bg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{zone.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{zone.issues.length} defect types</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Zone Fast Reporter Form */}
        <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          {submittedReport ? (
            <div className="text-center py-4 space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Problem Reported Successfully</h4>
              <p className="text-xs text-slate-500">
                Logged under Ticket #{submittedReport.issueId} for {submittedReport.exactLocation}.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => setSelectedIssueId(submittedReport.id)}
                  className="px-3.5 py-1.5 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800"
                >
                  View Ticket
                </button>
                <button
                  onClick={() => setSubmittedReport(null)}
                  className="px-3.5 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-300"
                >
                  Report Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  Reporting at: <span className="text-blue-700">{selectedZone.name}</span>
                </span>
                <span className="text-[11px] text-slate-500">Choose exact defect below</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Specific Problem Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Problem Type *
                  </label>
                  <select
                    value={selectedSubProblem}
                    onChange={(e) => setSelectedSubProblem(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {selectedZone.issues.map((issue) => (
                      <option key={issue} value={issue}>
                        {issue}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specific Spot */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exact Location / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near West Goalpost, Water Tank Bay 1"
                    value={specificLocation}
                    onChange={(e) => setSpecificLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="low">Low (Cosmetic)</option>
                    <option value="medium">Medium (Standard Maintenance)</option>
                    <option value="high">High (Disruptive / Safety Concern)</option>
                    <option value="critical">Critical (Immediate Hazard)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observations / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context on the physical condition or student risk..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Attach Photo Evidence */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    Attach Photo Evidence
                  </span>
                  <span className="text-[10px] text-slate-400">Sample picker</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SAMPLE_EVIDENCE_PHOTOS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPhoto(p.url)}
                      className={`rounded-xl border overflow-hidden cursor-pointer aspect-video transition ${
                        selectedPhoto === p.url
                          ? 'border-blue-600 ring-2 ring-blue-500'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Submit Surroundings Report
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Active Surroundings Tickets */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Active Surroundings &amp; Common Infrastructure Issues ({surroundingsProblems.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {surroundingsProblems.map((issue) => (
            <div
              key={issue.id}
              onClick={() => setSelectedIssueId(issue.id)}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {issue.issueId}
                  </span>
                  <StatusBadge status={issue.status} size="sm" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{issue.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {issue.exactLocation}
                </p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{issue.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <StatusBadge status={issue.priority} size="sm" />
                <span className="text-blue-600 font-semibold hover:underline">Inspect →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
