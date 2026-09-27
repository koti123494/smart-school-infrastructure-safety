import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  MapPin,
  AlertTriangle,
  FileText,
  Camera,
  Check,
  Building2,
  GraduationCap,
  FlaskConical,
  BookOpen,
  Droplets,
  Trees,
  Car,
  UtensilsCrossed,
  Zap,
  ArrowRight,
  Upload,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocationType, PriorityLevel, ProblemCategory, ProblemReport } from '../../types';
import { SAMPLE_EVIDENCE_PHOTOS } from '../../data/initialData';

const STEP_NAMES = [
  'Select Location',
  'Select Problem',
  'Add Details',
  'Upload Evidence',
  'Confirm Location',
  'Review & Submit',
];

const LOCATIONS: { type: LocationType; label: string; icon: React.ElementType; sub: string }[] = [
  { type: 'Classroom', label: 'Classroom', icon: GraduationCap, sub: 'Rooms 101-204, Blocks A/B' },
  { type: 'Laboratory', label: 'Laboratory', icon: FlaskConical, sub: 'Chemistry, Physics, Computer Labs' },
  { type: 'Library', label: 'Library', icon: BookOpen, sub: 'Central Reading & Archives' },
  { type: 'Washroom', label: 'Washroom', icon: Droplets, sub: 'Student & Staff Restrooms' },
  { type: 'Playground', label: 'Playground', icon: Trees, sub: 'Sports Grounds & Courts' },
  { type: 'Corridor', label: 'Corridor', icon: Building2, sub: 'Hallways & Staircases' },
  { type: 'Canteen', label: 'Canteen', icon: UtensilsCrossed, sub: 'Dining & Kitchen Hall' },
  { type: 'Parking Area', label: 'Parking Area', icon: Car, sub: 'Vehicle bays & drop-off' },
  { type: 'Electrical Room', label: 'Electrical Room', icon: Zap, sub: 'Substation & Panels' },
  { type: 'Main Building', label: 'Other Facility', icon: Building2, sub: 'Admin, Entrance, Water Tank' },
];

const PROBLEM_CATEGORIES: ProblemCategory[] = [
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

export const ReportProblemWizard: React.FC = () => {
  const { currentUser, addProblemReport, setSelectedIssueId, setActiveTab } = useApp();

  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedLocationType, setSelectedLocationType] = useState<LocationType>('Classroom');
  const [building, setBuilding] = useState('Block A');
  const [roomNumber, setRoomNumber] = useState('103');
  const [category, setCategory] = useState<ProblemCategory>('Broken Fan');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>(SAMPLE_EVIDENCE_PHOTOS[0].url);
  const [exactSpot, setExactSpot] = useState('Block A → Floor 1 → Classroom 103 (Ceiling Fan #2)');

  // Submission Result State
  const [submittedReport, setSubmittedReport] = useState<ProblemReport | null>(null);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!title) {
        setTitle(`${category} in ${selectedLocationType === 'Classroom' ? `Classroom ${roomNumber}` : building}`);
      }
    }
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = () => {
    const created = addProblemReport({
      title: title || `${category} Issue`,
      category,
      description: description || `Reported ${category} at ${exactSpot}.`,
      locationType: selectedLocationType,
      building,
      floor: roomNumber.startsWith('2') ? 'Floor 2' : 'Floor 1',
      classroomNumber: selectedLocationType === 'Classroom' ? roomNumber : undefined,
      exactLocation: exactSpot,
      priority,
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role === 'teacher' ? 'Teacher' : 'Staff Member',
        email: currentUser.email,
        phone: currentUser.phone,
      },
      images: uploadedPhotoUrl
        ? [
            {
              id: `img-${Date.now()}`,
              url: uploadedPhotoUrl,
              type: 'reported',
              uploadedAt: 'Just now',
            },
          ]
        : [],
      beforeImage: uploadedPhotoUrl || undefined,
      source: 'human',
    });

    setSubmittedReport(created);
  };

  // If submitted successfully, show confirmation screen matching Requirement 10
  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-2">
            Status: REPORTED
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Report Submitted Successfully
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Your infrastructure hazard has been recorded and broadcast to the Facilities Dispatch Team.
          </p>
        </div>

        {/* Unique Generated Issue ID Badge (Requirement 8 & 10) */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 max-w-md mx-auto">
          <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
            Assigned Tracking Reference
          </div>
          <div className="text-2xl font-extrabold text-blue-900 font-mono mt-1">
            {submittedReport.issueId}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Keep this ticket ID for status updates or follow-up escalation
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between">
            <span className="text-slate-500">Problem:</span>
            <strong className="text-slate-800">{submittedReport.title}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Location:</span>
            <strong className="text-slate-800">{submittedReport.exactLocation}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Priority Level:</span>
            <span className="font-bold text-rose-600 uppercase">{submittedReport.priority}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Auto-Assigned To:</span>
            <strong className="text-blue-700">{submittedReport.assignedTo?.team}</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={() => setSelectedIssueId(submittedReport.id)}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Track Issue Live Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSubmittedReport(null);
              setCurrentStep(1);
              setTitle('');
              setDescription('');
            }}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Report Another Problem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Report Infrastructure Problem
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              6-Step Wizard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mobile-friendly step-by-step reporting with photographs and automatic team dispatch.
          </p>
        </div>

        <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 self-start md:self-auto">
          Step {currentStep} of 6: {STEP_NAMES[currentStep - 1]}
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[580px] px-2">
          {STEP_NAMES.map((name, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={name} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => stepNum <= currentStep && setCurrentStep(stepNum)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </button>
                <span
                  className={`text-[11px] font-semibold hidden md:inline ${
                    isCurrent ? 'text-blue-900' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {name}
                </span>
                {index < STEP_NAMES.length - 1 && (
                  <div className="w-6 sm:w-10 h-0.5 bg-slate-200 mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Step Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm min-h-[400px] flex flex-col justify-between">
        {/* STEP 1: Select Location */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 1: Select Location</h3>
              <p className="text-xs text-slate-500">
                Where did you notice the defect or infrastructure hazard?
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {LOCATIONS.map((loc) => {
                const Icon = loc.icon;
                const isSelected = selectedLocationType === loc.type;

                return (
                  <button
                    key={loc.type}
                    type="button"
                    onClick={() => {
                      setSelectedLocationType(loc.type);
                      if (loc.type === 'Classroom') {
                        setExactSpot(`Block A → Floor 1 → Classroom 103`);
                      } else {
                        setExactSpot(`${loc.label} Zone`);
                      }
                    }}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-2">
                      <Icon className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{loc.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{loc.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedLocationType === 'Classroom' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Building / Block:
                  </label>
                  <select
                    value={building}
                    onChange={(e) => {
                      setBuilding(e.target.value);
                      setExactSpot(`${e.target.value} → Classroom ${roomNumber}`);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Block A">Block A (Junior Wing)</option>
                    <option value="Block B">Block B (Senior Wing)</option>
                    <option value="Science Block">Science &amp; STEM Block</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classroom Number:
                  </label>
                  <select
                    value={roomNumber}
                    onChange={(e) => {
                      setRoomNumber(e.target.value);
                      setExactSpot(`${building} → Classroom ${e.target.value}`);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    {['101', '102', '103', '104', '201', '202', '203', '204'].map((rm) => (
                      <option key={rm} value={rm}>
                        Room {rm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Select Problem */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 2: Select Problem Category</h3>
              <p className="text-xs text-slate-500">
                Choose the primary category that best describes the malfunction
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {PROBLEM_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setTitle(`${cat} issue`);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition font-semibold text-xs flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Add Details */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 3: Add Details &amp; Priority</h3>
              <p className="text-xs text-slate-500">
                Provide title, detailed symptoms, and urgency level
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken Fan, Flickering Light, Exposed Wire"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Priority Rating *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'low', label: 'Low', desc: 'Cosmetic / Non-disruptive' },
                      { id: 'medium', label: 'Medium', desc: 'Requires standard maintenance' },
                      { id: 'high', label: 'High', desc: 'Disrupts classroom teaching' },
                      { id: 'critical', label: 'Critical', desc: 'Immediate student safety hazard' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        priority === p.id
                          ? p.id === 'critical'
                            ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500'
                            : 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs uppercase">{p.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what is broken, sounds heard, water leaks, or potential injury risks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Upload Evidence */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 4: Upload Evidence Photo</h3>
              <p className="text-xs text-slate-500">
                Visual proof helps maintenance technicians bring the exact replacement parts
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-dashed border-blue-300 bg-blue-50/40 text-center space-y-2">
              <Upload className="w-8 h-8 text-blue-600 mx-auto" />
              <div className="text-xs font-bold text-slate-800">
                Select Photo from Sample Evidence Gallery or Pick File
              </div>
              <p className="text-[11px] text-slate-500">
                Click any realistic photo below to attach to this work order
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {SAMPLE_EVIDENCE_PHOTOS.map((photo) => {
                const isSelected = uploadedPhotoUrl === photo.url;
                return (
                  <div
                    key={photo.id}
                    onClick={() => setUploadedPhotoUrl(photo.url)}
                    className={`rounded-2xl border overflow-hidden cursor-pointer aspect-video relative group transition ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500 shadow-md'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-1 bg-black/70 text-[9px] text-white truncate">
                      {photo.category}
                    </div>
                  </div>
                );
              })}
            </div>

            {uploadedPhotoUrl && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={uploadedPhotoUrl}
                  alt="Selected"
                  className="w-16 h-12 rounded-lg object-cover border border-slate-300"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">Attached Evidence</span>
                  <span className="text-slate-500 text-[11px]">High-resolution photo verified</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Confirm Location */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 5: Confirm Exact Location</h3>
              <p className="text-xs text-slate-500">
                Fine-tune the exact physical spot so technicians locate it immediately
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Campus Spatial Breadcrumb *
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <input
                    type="text"
                    value={exactSpot}
                    onChange={(e) => setExactSpot(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Zone Type</span>
                  <strong className="text-slate-800">{selectedLocationType}</strong>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Campus</span>
                  <strong className="text-slate-800">QIS Smart School Campus</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 6: Review &amp; Submit</h3>
              <p className="text-xs text-slate-500">
                Verify the report details before creating the official ticket
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">PROBLEM TITLE</span>
                  <strong className="text-slate-900 text-sm">{title || category}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CATEGORY &amp; PRIORITY</span>
                  <span className="font-semibold text-blue-700">{category}</span> •{' '}
                  <span className="uppercase font-bold text-rose-600">{priority}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">LOCATION</span>
                <strong className="text-slate-800">{exactSpot}</strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">DESCRIPTION</span>
                <p className="text-slate-700">{description || 'No description provided.'}</p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                {uploadedPhotoUrl && (
                  <img
                    src={uploadedPhotoUrl}
                    alt="Evidence"
                    className="w-16 h-12 rounded-lg object-cover border"
                  />
                )}
                <div>
                  <span className="text-slate-400 block text-[10px]">REPORTED BY</span>
                  <strong className="text-slate-800">
                    {currentUser.name} ({currentUser.role})
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Submit Problem Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
