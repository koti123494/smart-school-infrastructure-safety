import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  X,
  RefreshCw,
  ImagePlus,
  Video,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createApiReport, getApiToken, uploadReportImage } from '../../data/api';
import { LocationType, PriorityLevel, ProblemCategory, ProblemReport } from '../../types';
import { SAMPLE_EVIDENCE_PHOTOS, getProblemCategoryImage } from '../../data/imageLibrary';
import { findClassroomByQrCode } from '../../data/classroomQr';
import { LOCATION_PROBLEMS, LUNCH_TIME, WEEKLY_MENU } from '../../data/reportProblem';

const STEP_NAMES = [
  'Select Location',
  'Select Problem / Menu',
  'Report Details',
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
  { type: "Teachers' Class / Faculty Room", label: "Teachers' Class / Faculty Room", icon: GraduationCap, sub: 'Faculty & staff workspace' },
  { type: 'Food', label: 'Food', icon: UtensilsCrossed, sub: 'Weekly lunch menu & feedback' },
  { type: 'Others', label: 'Others', icon: FileText, sub: 'Describe another problem' },
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;

// ─── Image Source Mode ────────────────────────────────────────────────────────
type ImageMode = 'sample' | 'camera' | 'upload';

// ─── Camera Capture Sub-component ────────────────────────────────────────────
interface CameraCapturePanelProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

const CameraCapturePanel: React.FC<CameraCapturePanelProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isReady, setIsReady] = useState(false);

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsReady(false);
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
        };
      }
    } catch (err) {
      const e = err as DOMException;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please use the Upload Image option instead.');
      } else {
        setCameraError('Unable to start camera. Try refreshing or use the Upload Image option.');
      }
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFlip = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    await startCamera(next);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onCapture(dataUrl);
  };

  return (
    <div className="flex flex-col gap-3">
      {cameraError ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
          <p className="text-xs text-rose-800 font-semibold">{cameraError}</p>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold transition"
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video border border-slate-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2">
                <Video className="w-8 h-8 animate-pulse" />
                <span className="text-xs">Starting camera…</span>
              </div>
            )}
            {/* Corner brackets for viewfinder feel */}
            <div className="absolute inset-4 pointer-events-none">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-sm" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-sm" />
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex items-center justify-center gap-3">
            {/* Flip camera (mobile) */}
            <button
              type="button"
              onClick={handleFlip}
              title="Switch front/back camera"
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Capture */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={!isReady}
              className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg transition ring-4 ring-blue-200"
            >
              <Camera className="w-7 h-7" />
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={onCancel}
              title="Cancel"
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-400">
            Press the blue button to capture a photo
          </p>
        </>
      )}
    </div>
  );
};

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export const ReportProblemWizard: React.FC = () => {
  const { currentUser, classrooms, addProblemReport, refreshLiveData, setSelectedIssueId, selectForAiAnalysis } = useApp();
  const classroomParam = new URLSearchParams(window.location.search).get('classroom');
  const qrClassroom = findClassroomByQrCode(classrooms, classroomParam) ?? null;
  const qrLookupAttempted = Boolean(classroomParam);
  const qrRoomNumber = qrClassroom?.roomNumber.match(/\d+/)?.[0] ?? qrClassroom?.roomNumber ?? '103';

  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedLocationType, setSelectedLocationType] = useState<LocationType>('Classroom');
  const [building, setBuilding] = useState(qrClassroom?.buildingName ?? 'Block A');
  const [roomNumber, setRoomNumber] = useState(qrRoomNumber);
  const [category, setCategory] = useState<ProblemCategory>('Broken Fan');
  const [title, setTitle] = useState(qrClassroom ? `Broken Fan in ${qrClassroom.roomNumber}` : '');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(currentUser.name);
  const [section, setSection] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
  const [selectedDay, setSelectedDay] = useState<keyof typeof WEEKLY_MENU | null>(null);
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>(getProblemCategoryImage('Broken Fan'));
  const [exactSpot, setExactSpot] = useState(
    qrClassroom
      ? `${qrClassroom.buildingName} → Floor ${qrClassroom.floor} → ${qrClassroom.roomNumber}`
      : 'Block A → Floor 1 → Classroom 103 (Ceiling Fan #2)'
  );

  // Image mode / camera state
  const [imageMode, setImageMode] = useState<ImageMode>('sample');
  const [showCamera, setShowCamera] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission Result State
  const [submittedReport, setSubmittedReport] = useState<ProblemReport | null>(null);
  const [backendSyncMessage, setBackendSyncMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFoodReport = selectedLocationType === 'Food';
  const isOtherReport = selectedLocationType === 'Others';
  const isSpecialReport = isFoodReport || isOtherReport;
  const currentDate = new Date();
  const displayDate = currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const displayTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleNext = () => {
    if (currentStep === 1) {
      if (isOtherReport) {
        setCategory('Other');
        setCurrentStep(3);
        return;
      }
      if (isFoodReport) {
        setCategory('Food Complaint');
        setTitle('Food Complaint');
        setCurrentStep(2);
        return;
      }
      if (!title) {
        setTitle(`${category} in ${selectedLocationType === 'Classroom' ? `Classroom ${roomNumber}` : building}`);
      }
    }
    if (currentStep === 2 && isFoodReport && !selectedDay) return;
    if (currentStep === 3 && isSpecialReport) {
      if (!description.trim() || !reporterName.trim() || !section.trim()) return;
      if (isOtherReport && !otherLocation.trim()) return;
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

  // ── File Upload ──────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setUploadedPhotoUrl(result);
      setImageMode('upload');
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected if removed
    e.target.value = '';
  };

  // ── Camera Capture ───────────────────────────────────────────────────────────
  const handleCameraCapture = (dataUrl: string) => {
    setUploadedPhotoUrl(dataUrl);
    setImageMode('camera');
    setShowCamera(false);
  };

  const handleRemovePhoto = () => {
    setUploadedPhotoUrl(isSpecialReport ? '' : getProblemCategoryImage(category));
    setImageMode('sample');
    setUploadError(null);
    setShowCamera(false);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setBackendSyncMessage(null);
    setSubmissionError(null);
    const submittedAt = new Date();
    const submittedDate = submittedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const submittedTime = submittedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const reportDescription = isFoodReport
      ? `Selected Day: ${selectedDay ?? ''}\nLunch Menu: ${selectedDay ? WEEKLY_MENU[selectedDay] : ''}\nComplaint / Description: ${description}\nStudent Name: ${reporterName}\nSection: ${section}\nDate: ${submittedDate}\nTime: ${submittedTime}`
      : isOtherReport
      ? `Problem Description: ${description}\nLocation: ${otherLocation}\nReporter/Student Name: ${reporterName}\nSection: ${section}\nDate: ${submittedDate}\nTime: ${submittedTime}`
      : description || `Reported ${category} at ${exactSpot}.`;
    const reportData = {
      title: isFoodReport ? `Food Complaint - ${selectedDay ?? 'Lunch'}` : title || `${category} Issue`,
      category,
      description: reportDescription,
      locationType: isFoodReport ? 'Canteen' : selectedLocationType,
      building: isFoodReport ? 'Canteen' : isOtherReport ? otherLocation || 'Other Location' : building,
      floor: roomNumber.startsWith('2') ? 'Floor 2' : 'Floor 1',
      classroomNumber: !isSpecialReport && selectedLocationType === 'Classroom' ? roomNumber : undefined,
      section: section || undefined,
      exactLocation: isFoodReport ? 'Food / Canteen' : isOtherReport ? otherLocation : exactSpot,
      priority,
      reportedBy: {
        id: currentUser.id,
        name: isSpecialReport ? reporterName : currentUser.name,
        role: isSpecialReport ? 'Student' : currentUser.role === 'teacher' ? 'Teacher' : 'Staff Member',
        email: currentUser.email,
        phone: currentUser.phone,
      },
      images: uploadedPhotoUrl
        ? [
            {
              id: `img-${Date.now()}`,
              url: uploadedPhotoUrl,
              type: 'reported' as const,
              uploadedAt: 'Just now',
            },
          ]
        : [],
      beforeImage: uploadedPhotoUrl || undefined,
      source: 'human' as const,
    };

    const token = getApiToken();
    if (token) {
      let savedIssue: Record<string, unknown>;
      try {
        const isUploadedImage = uploadedPhotoUrl.startsWith('data:image/');
        const imageUrl = isUploadedImage ? await uploadReportImage(uploadedPhotoUrl, token) : undefined;
        const apiPayload: Record<string, unknown> = {
          title: reportData.title,
          description: reportData.description,
          location: reportData.exactLocation,
          category: reportData.category,
          priority: reportData.priority.toUpperCase(),
          locationType: reportData.locationType,
          building: reportData.building,
          floor: reportData.floor,
          classroom: reportData.classroomNumber,
          section,
          reporterPhone: reportData.reportedBy.phone,
          imageUrl,
        };
        if (isFoodReport) {
          apiPayload.selectedDay = selectedDay;
          apiPayload.lunchMenu = selectedDay ? WEEKLY_MENU[selectedDay] : '';
          apiPayload.studentName = reporterName;
        }
        const result = await createApiReport(token, apiPayload, isFoodReport);
        savedIssue = result.issue;
        setBackendSyncMessage('Report saved to the school server.');
      } catch (error) {
        const status = (error as Error & { status?: number }).status;
        if (status) {
          setSubmissionError((error as Error).message || 'The report could not be saved.');
          setIsSubmitting(false);
          return;
        }
        const localReport = addProblemReport(reportData, true);
        setSubmittedReport(localReport);
        setBackendSyncMessage('The server is unavailable. Your report is saved in this demo session only.');
        setIsSubmitting(false);
        return;
      }
      const created = addProblemReport(reportData);
      setSubmittedReport({ ...created, id: String(savedIssue.id ?? created.id), issueId: String(savedIssue.issueNumber ?? created.issueId) });
      void refreshLiveData().catch(() => undefined);
    } else {
      setSubmittedReport(addProblemReport(reportData, true));
    }
    setIsSubmitting(false);
  };

  // If submitted successfully, show confirmation screen
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
          {backendSyncMessage && <p role="status" className="text-xs text-slate-600 mt-2">{backendSyncMessage}</p>}
        </div>

        {/* Issue ID Badge */}
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
          {submittedReport.beforeImage && (
            <div className="pt-1">
              <span className="text-slate-500 block mb-1">Attached Photo:</span>
              <img
                src={submittedReport.beforeImage}
                alt="Evidence"
                className="w-full h-24 object-cover rounded-xl border border-slate-200"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={() => {
              selectForAiAnalysis({
                id: submittedReport.issueId,
                itemType: 'problem',
                title: submittedReport.title,
                category: submittedReport.category,
                location: submittedReport.exactLocation,
                description: submittedReport.description,
                severity: submittedReport.priority,
                imageUrl: submittedReport.beforeImage,
              });
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Run AI Safety Diagnostic</span>
          </button>
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
              setImageMode('sample');
              setUploadedPhotoUrl(getProblemCategoryImage('Broken Fan'));
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

            {qrClassroom && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Classroom detected from QR code</strong>
                  <p className="mt-0.5">{qrClassroom.roomNumber} • {qrClassroom.buildingName} • Floor {qrClassroom.floor}</p>
                  <p className="mt-1 text-[11px] text-emerald-700">The classroom is locked to this QR location for the report.</p>
                </div>
              </div>
            )}

            {qrLookupAttempted && !qrClassroom && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                This classroom QR code is invalid or no longer registered. You can continue by selecting a classroom manually.
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {LOCATIONS.map((loc) => {
                const Icon = loc.icon;
                const isSelected = selectedLocationType === loc.type;

                return (
                  <button
                    key={loc.type}
                    type="button"
                    disabled={Boolean(qrClassroom)}
                    onClick={() => {
                      setSelectedLocationType(loc.type);
                      setSelectedDay(null);
                      setDescription('');
                      setImageMode('sample');
                      setShowCamera(false);
                      if (loc.type === 'Food') {
                        setCategory('Food Complaint');
                        setTitle('Food Complaint');
                        setExactSpot('Food / Canteen');
                        setBuilding('Canteen');
                        setOtherLocation('');
                        setUploadedPhotoUrl('');
                        setImageMode('sample');
                      } else if (loc.type === 'Others') {
                        setCategory('Other');
                        setTitle('');
                        setOtherLocation('');
                        setExactSpot('');
                        setUploadedPhotoUrl('');
                        setImageMode('sample');
                      } else if (loc.type === 'Classroom') {
                        setCategory(LOCATION_PROBLEMS.Classroom?.[0] ?? 'Broken Fan');
                        setExactSpot(`Block A → Floor 1 → Classroom 103`);
                        setOtherLocation('');
                        setUploadedPhotoUrl(getProblemCategoryImage(LOCATION_PROBLEMS.Classroom?.[0]));
                      } else {
                        setExactSpot(`${loc.label} Zone`);
                        setOtherLocation('');
                        const firstCategory = LOCATION_PROBLEMS[loc.type]?.[0] ?? 'Other';
                        setCategory(firstCategory);
                        setUploadedPhotoUrl(getProblemCategoryImage(firstCategory));
                      }
                      if (loc.type !== 'Food' && loc.type !== 'Others') {
                        setTitle('');
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
                    disabled={Boolean(qrClassroom)}
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
                    disabled={Boolean(qrClassroom)}
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
              <h3 className="text-base font-bold text-slate-900">
                {isFoodReport ? 'Step 2: Weekly Lunch Menu' : 'Step 2: Select Problem Category'}
              </h3>
              <p className="text-xs text-slate-500">
                {isFoodReport ? `Lunch starts at ${LUNCH_TIME}. Select a day to view its menu.` : 'Choose the primary category that best describes the malfunction.'}
              </p>
            </div>

            {isFoodReport ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {(Object.keys(WEEKLY_MENU) as (keyof typeof WEEKLY_MENU)[]).map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`p-4 rounded-xl border text-left font-semibold text-sm transition ${selectedDay === day ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {selectedDay && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-1">
                    <div className="text-sm font-bold text-emerald-900">{selectedDay} Lunch</div>
                    <p className="text-sm text-emerald-800">{WEEKLY_MENU[selectedDay]}</p>
                    <p className="text-xs font-semibold text-emerald-700">Lunch starts at {LUNCH_TIME}</p>
                  </div>
                )}
              </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {(LOCATION_PROBLEMS[selectedLocationType] ?? []).map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setTitle(qrClassroom ? `${cat} in ${qrClassroom.roomNumber}` : `${cat} issue`);
                      // Only reset to sample if current mode is sample
                      if (imageMode === 'sample') {
                        setUploadedPhotoUrl(getProblemCategoryImage(cat));
                      }
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
            )}
          </div>
        )}

        {/* STEP 3: Add Details */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isFoodReport ? 'Step 3: Food Complaint / Feedback' : isOtherReport ? 'Step 3: Describe the Problem' : 'Step 3: Add Details &amp; Priority'}
              </h3>
              <p className="text-xs text-slate-500">
                {isSpecialReport ? 'Date and time are recorded automatically when you submit.' : 'Provide title, detailed symptoms, and urgency level.'}
              </p>
            </div>

            {isSpecialReport ? (
              <div className="space-y-4">
                {isFoodReport && selectedDay && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                    <strong>{selectedDay} • {LUNCH_TIME}</strong>
                    <p className="mt-1">{WEEKLY_MENU[selectedDay]}</p>
                  </div>
                )}
                {isOtherReport && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      placeholder="Building, room, or area"
                      value={otherLocation}
                      onChange={(event) => {
                        setOtherLocation(event.target.value);
                        setExactSpot(event.target.value);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isFoodReport ? 'Food Complaint / Feedback *' : 'Problem Description *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder={isFoodReport ? 'Describe your food complaint or feedback...' : 'Describe the problem...'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Student Name *</label>
                    <input required value={reporterName} onChange={(event) => setReporterName(event.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Section *</label>
                    <input required value={section} onChange={(event) => setSection(event.target.value)} placeholder="e.g. 8-A" className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                    <input readOnly value={displayDate} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                    <input readOnly value={displayTime} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50" />
                  </div>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* STEP 4: Upload Evidence — Camera + Upload + Sample Gallery */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Step 4: {isSpecialReport ? 'Optional Image' : 'Upload Evidence Photo'}
              </h3>
              <p className="text-xs text-slate-500">
                Visual proof helps maintenance technicians bring the exact replacement parts.
                Supports JPG, JPEG, PNG, and WEBP.
              </p>
            </div>

            {/* Camera live panel */}
            {showCamera ? (
              <CameraCapturePanel
                onCapture={handleCameraCapture}
                onCancel={() => setShowCamera(false)}
              />
            ) : (
              <>
                {/* Action Buttons Row */}
                <div className="flex flex-wrap gap-3">
                  {/* Take Photo */}
                  <button
                    type="button"
                    onClick={() => {
                      setUploadError(null);
                      setShowCamera(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>

                  {/* Upload from gallery/file */}
                  <button
                    type="button"
                    onClick={() => {
                      setUploadError(null);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
                  >
                    <ImagePlus className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>

                  {/* Remove / Retake — only shown when user has captured/uploaded a custom image */}
                  {(imageMode === 'camera' || imageMode === 'upload') && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* File validation error */}
                {uploadError && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <p className="text-xs text-rose-800 font-semibold">{uploadError}</p>
                  </div>
                )}

                {/* Image Preview */}
                {(imageMode === 'camera' || imageMode === 'upload') ? (
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4" />
                      {imageMode === 'camera' ? 'Photo captured from camera' : 'Image uploaded from device'}
                    </div>
                    <div className="relative w-full max-w-md">
                      <img
                        src={uploadedPhotoUrl}
                        alt="Captured evidence"
                        className="w-full rounded-xl border border-emerald-200 object-cover max-h-56"
                      />
                      {/* Retake / re-upload overlays */}
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        {imageMode === 'camera' && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageMode('sample');
                              setShowCamera(true);
                              setUploadedPhotoUrl(getProblemCategoryImage(category));
                            }}
                            title="Retake photo"
                            className="w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        {imageMode === 'upload' && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Replace image"
                            className="w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          title="Remove photo"
                          className="w-8 h-8 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-emerald-600 text-center">
                      This photo will be saved with your report and visible to the maintenance team.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Sample Gallery (fallback when no camera/upload) */}
                    <div className="p-4 rounded-2xl border border-dashed border-blue-300 bg-blue-50/40 text-center space-y-2">
                      <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                      <div className="text-xs font-bold text-slate-800">
                        Or select a photo from the sample evidence gallery
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Click any photo below to attach it to this work order
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {SAMPLE_EVIDENCE_PHOTOS.map((photo) => {
                        const isSelected = uploadedPhotoUrl === photo.url;
                        return (
                          <div
                            key={photo.id}
                            onClick={() => {
                              setUploadedPhotoUrl(photo.url);
                              setImageMode('sample');
                            }}
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
                  </>
                )}

                {/* Currently attached preview (sample mode) */}
                {imageMode === 'sample' && uploadedPhotoUrl && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <img
                      src={uploadedPhotoUrl}
                      alt="Selected evidence"
                      className="w-16 h-12 rounded-lg object-cover border border-slate-300"
                      onError={(event) => {
                        event.currentTarget.src = getProblemCategoryImage(category);
                      }}
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-800 block">Attached Evidence (Sample)</span>
                      <span className="text-slate-500 text-[11px]">Use Take Photo or Upload Image to attach a real photo</span>
                    </div>
                  </div>
                )}
              </>
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
                    disabled={isFoodReport}
                    onChange={(e) => {
                      setExactSpot(e.target.value);
                      if (isOtherReport) setOtherLocation(e.target.value);
                    }}
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

              <div className="pt-2 flex items-start gap-3">
                {uploadedPhotoUrl && (
                  <div className="flex flex-col items-center gap-1">
                    <img
                      src={uploadedPhotoUrl}
                      alt="Evidence"
                      className="w-20 h-16 rounded-lg object-cover border"
                    />
                    <span className="text-[10px] text-slate-400 text-center">
                      {imageMode === 'camera' ? '📷 Camera' : imageMode === 'upload' ? '📁 Uploaded' : '🖼 Sample'}
                    </span>
                  </div>
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
          {submissionError && <p role="alert" className="text-xs text-rose-700">{submissionError}</p>}
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
              disabled={
                (currentStep === 4 && showCamera) ||
                (currentStep === 2 && isFoodReport && !selectedDay) ||
                (currentStep === 3 && isSpecialReport && (
                  !description.trim() ||
                  !reporterName.trim() ||
                  !section.trim() ||
                  (isOtherReport && !otherLocation.trim())
                ))
              }
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
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
