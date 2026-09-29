import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Flame,
  Zap,
  Droplets,
  Fan,
  Wrench,
  Building,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Camera,
  Bot,
  Info,
  ChevronDown,
  Layers,
  Send,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AiSafetyAnalysis } from '../../types';

export const AiSafetyAssistant: React.FC = () => {
  const {
    problems,
    alerts,
    emergencies,
    currentAiAnalysis,
    isAiAnalyzing,
    aiAnalysisError,
    selectedAiItem,
    runAiSafetyAnalysis,
    simulateAiQuotaError,
    setSimulateAiQuotaError,
    setActiveTab,
    assignIssue,
    teams,
  } = useApp();

  const [activeTabSelect, setActiveTabSelect] = useState<'presets' | 'problems' | 'alerts' | 'emergencies' | 'custom'>('presets');
  const [copied, setCopied] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fan');

  // Custom problem form state
  const [customTitle, setCustomTitle] = useState('');
  const [customLocation, setCustomLocation] = useState('Classroom B102');
  const [customCategory, setCustomCategory] = useState('Electrical');
  const [customDescription, setCustomDescription] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');

  // 4 Core Required Test Scenarios
  const TEST_SCENARIOS = [
    {
      id: 'fan',
      name: 'Broken Fan',
      title: 'Ceiling Fan Broken & Making Grinding Noise',
      location: 'Classroom A101',
      category: 'Electrical',
      severity: 'Medium',
      description: 'Classroom ceiling fan is vibrating aggressively, making abnormal grinding sounds, and fails to reach standard RPM. Motor casing feels unusually hot.',
      icon: Fan,
      color: 'amber',
      badge: 'Medium Risk',
    },
    {
      id: 'electrical',
      name: 'Electrical Problem',
      title: 'Exposed Sparking Wire on Classroom Switchboard',
      location: 'Block A, Physics Lab 1',
      category: 'Electrical',
      severity: 'Critical',
      description: 'Switchboard faceplate cracked with visible sparking and scorched plastic smell when teacher turned on projection power socket.',
      icon: Zap,
      color: 'rose',
      badge: 'Critical Hazard',
    },
    {
      id: 'water',
      name: 'Water Leakage',
      title: 'Continuous Ceiling Water Seepage & Pipe Rupture',
      location: 'Corridor Outside Classroom B204',
      category: 'Plumbing',
      severity: 'High',
      description: 'Water leaking steadily from ceiling junction above hallway corridor. Large puddle spreading across high-traffic student passage near light fixture.',
      icon: Droplets,
      color: 'sky',
      badge: 'High Slip/Electric Risk',
    },
    {
      id: 'fire',
      name: 'Fire / Smoke Alert',
      title: 'Acrid Smoke & Heat Spike in Storage Room',
      location: 'Science Block, Ground Floor Chemical Store',
      category: 'Fire Safety',
      severity: 'Critical',
      description: 'Optical smoke detector triggered alarm. Thick gray smoke visible beneath ventilation louver with rapid thermal rise detected by ambient sensor.',
      icon: Flame,
      color: 'red',
      badge: 'Immediate Evac Required',
    },
  ];

  const handleRunPreset = (scenarioId: string) => {
    setSelectedPresetId(scenarioId);
    const scenario = TEST_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    runAiSafetyAnalysis({
      id: `test-${scenario.id}`,
      itemType: 'problem',
      title: scenario.title,
      location: scenario.location,
      category: scenario.category,
      description: scenario.description,
      severity: scenario.severity,
    });
  };

  const handleSelectProblem = (prob: typeof problems[0]) => {
    runAiSafetyAnalysis({
      id: prob.issueId,
      itemType: 'problem',
      title: prob.title,
      location: prob.exactLocation,
      category: prob.category,
      description: prob.description,
      severity: prob.priority,
      imageUrl: prob.beforeImage || prob.images[0]?.url,
    });
  };

  const handleSelectAlert = (alt: typeof alerts[0]) => {
    runAiSafetyAnalysis({
      id: alt.id,
      itemType: 'alert',
      title: alt.title,
      location: alt.location,
      category: alt.title,
      description: alt.message,
      severity: alt.severity,
    });
  };

  const handleSelectEmergency = (emg: typeof emergencies[0]) => {
    runAiSafetyAnalysis({
      id: emg.emergencyCode,
      itemType: 'emergency',
      title: emg.title,
      location: emg.location,
      category: emg.type,
      description: emg.description,
      severity: emg.priority,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customDescription.trim()) return;

    runAiSafetyAnalysis({
      id: `custom-${Date.now()}`,
      itemType: 'problem',
      title: customTitle.trim(),
      location: customLocation.trim(),
      category: customCategory,
      description: customDescription.trim(),
      imageUrl: customImageUrl.trim() || undefined,
    });
  };

  const handleCopyAnalysis = () => {
    if (!currentAiAnalysis) return;
    const text = `AI SAFETY ANALYSIS BRIEFING
Problem: ${currentAiAnalysis.title}
Location: ${currentAiAnalysis.location}
Category: ${currentAiAnalysis.category}
Severity: ${currentAiAnalysis.severity}
----------------------------------------
Possible Cause:
${currentAiAnalysis.possibleCause}

Recommended Action:
${currentAiAnalysis.recommendedAction}

Responsible Department:
${currentAiAnalysis.responsibleDepartment}

Immediate Safety Precaution:
${currentAiAnalysis.immediateSafetyPrecaution}
----------------------------------------
Generated by Smart School AI Safety Assistant on ${currentAiAnalysis.analyzedAt}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (severity: AiSafetyAnalysis['severity']) => {
    switch (severity) {
      case 'Critical':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            CRITICAL SEVERITY
          </div>
        );
      case 'High':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-md">
            <AlertTriangle className="w-3.5 h-3.5" />
            HIGH SEVERITY
          </div>
        );
      case 'Medium':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-md">
            <Info className="w-3.5 h-3.5" />
            MEDIUM SEVERITY
          </div>
        );
      case 'Low':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            LOW SEVERITY
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top AI Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-purple-200">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>Multi-Modal AI Safety Intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] text-emerald-300">Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              AI Safety Assistant
            </h1>
            <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
              Instant diagnostic intelligence for school hazards. Select any problem report, safety alert, or emergency incident to automatically analyze root causes, severity levels, department routing, and immediate life-safety precautions.
            </p>
          </div>

          {/* Right Controls: Quota Simulation & Security Indicator */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs text-purple-200">
                <span className="font-bold text-white block">API Fault Tolerance</span>
                <span className="text-[11px] text-purple-300">Test quota / outage safety</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateAiQuotaError}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSimulateAiQuotaError(checked);
                    if (checked && currentAiAnalysis) {
                      runAiSafetyAnalysis({
                        title: currentAiAnalysis.title,
                        location: currentAiAnalysis.location,
                        category: currentAiAnalysis.category,
                        description: currentAiAnalysis.description || '',
                      });
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="pt-2 border-t border-white/15 text-[11px] text-purple-200/80 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-exposure secure credentials</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Test Scenarios Bar (Requirement: Broken Fan, Electrical, Water, Fire/Smoke) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Quick Test Scenarios (Standard Benchmarks)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-click standard tests for the four primary school safety hazard categories.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click any scenario to evaluate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEST_SCENARIOS.map((scenario) => {
            const Icon = scenario.icon;
            const isSelected = selectedPresetId === scenario.id;

            return (
              <button
                key={scenario.id}
                onClick={() => handleRunPreset(scenario.id)}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-600 dark:border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-purple-600/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        scenario.color === 'amber'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : scenario.color === 'rose'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : scenario.color === 'sky'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{scenario.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {scenario.location}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{scenario.badge}</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5">
                    Analyze <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Incident Selection Source Drawer */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Select Issue or Alert to Analyze</span>
            </h3>
          </div>

          {/* Navigation Pill Tabs for Input Source */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTabSelect('presets')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                activeTabSelect === 'presets'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setActiveTabSelect('problems')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                activeTabSelect === 'problems'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Issues ({problems.length})
            </button>
            <button
              onClick={() => setActiveTabSelect('alerts')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                activeTabSelect === 'alerts'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setActiveTabSelect('emergencies')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                activeTabSelect === 'emergencies'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ERC ({emergencies.length})
            </button>
            <button
              onClick={() => setActiveTabSelect('custom')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                activeTabSelect === 'custom'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Tab 1: Presets Detail */}
          {activeTabSelect === 'presets' && (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {TEST_SCENARIOS.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => handleRunPreset(sc.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedPresetId === sc.id
                      ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">{sc.title}</strong>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {sc.severity}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1 line-clamp-2">{sc.description}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{sc.location}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">Click to Analyze →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Existing Problems */}
          {activeTabSelect === 'problems' && (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {problems.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => handleSelectProblem(prob)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-purple-400 cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400">{prob.issueId}</span>
                      <strong className="text-slate-800 dark:text-slate-200">{prob.title}</strong>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                      {prob.priority}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1 line-clamp-2">{prob.description}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {prob.exactLocation}
                    </span>
                    {(prob.beforeImage || (prob.images && prob.images.length > 0)) && (
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                        <Camera className="w-3 h-3" />
                        Has Photo
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Safety Alerts */}
          {activeTabSelect === 'alerts' && (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {alerts.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => handleSelectAlert(alt)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-purple-400 cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-800 dark:text-slate-200">{alt.title}</strong>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      alt.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {alt.severity}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1 line-clamp-2">{alt.message}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{alt.location}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">Analyze Alert →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Emergency Incidents */}
          {activeTabSelect === 'emergencies' && (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {emergencies.map((emg) => (
                <div
                  key={emg.id}
                  onClick={() => handleSelectEmergency(emg)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-purple-400 cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-rose-500 font-bold">{emg.emergencyCode}</span>
                      <strong className="text-slate-800 dark:text-slate-200">{emg.title}</strong>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 uppercase">
                      {emg.type}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1 line-clamp-2">{emg.description}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{emg.location}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">Analyze ERC →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: Custom Query Form */}
          {activeTabSelect === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Issue Title / Symptom
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Broken Fan, Sparking Socket, Water Dripping..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Structural">Structural</option>
                    <option value="Fire Safety">Fire Safety</option>
                    <option value="IT Hardware">IT Hardware</option>
                    <option value="Medical">Medical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Observed Description
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Describe sounds, smells, physical damage, or student risk..."
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Image URL (Optional Computer Vision Input)
                </label>
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://... image of broken equipment"
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-sm hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Run AI Diagnostic Analysis
              </button>
            </form>
          )}
        </div>

        {/* Right Column (7 cols): AI Analysis Result Cards */}
        <div className="lg:col-span-7 space-y-4">
          {/* Outage / Quota Error State Handling (Mandatory Requirement) */}
          {aiAnalysisError ? (
            <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl p-6 text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-300">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-100">
                AI Service Notice
              </h3>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 max-w-md mx-auto">
                {aiAnalysisError}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                All school infrastructure tracking, dispatch teams, alerts, and issue management continue to operate normally.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSimulateAiQuotaError(false);
                    if (currentAiAnalysis) {
                      runAiSafetyAnalysis({
                        title: currentAiAnalysis.title,
                        location: currentAiAnalysis.location,
                        category: currentAiAnalysis.category,
                        description: currentAiAnalysis.description || '',
                      });
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Retry AI Analysis
                </button>
              </div>
            </div>
          ) : isAiAnalyzing ? (
            /* Loading State with Subtle Brain Animation */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/30">
                  <Bot className="w-8 h-8 animate-bounce" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Generating AI Safety Diagnostic...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Cross-referencing school safety compliance codes, electrical risk models, and immediate mitigation guidelines.
                </p>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                <span>Evaluating Spatial Risk & Department Routing</span>
              </div>
            </div>
          ) : currentAiAnalysis ? (
            /* Rich Analysis Result Card */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header with Title, Location, and Clear Severity Indicator */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      {currentAiAnalysis.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {currentAiAnalysis.location}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {currentAiAnalysis.title}
                  </h2>
                </div>

                <div className="shrink-0">
                  {getSeverityBadge(currentAiAnalysis.severity)}
                </div>
              </div>

              {/* Immediate Safety Precaution (Top Highlight Card) */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Immediate Safety Precaution</span>
                </div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-100 leading-snug">
                  {currentAiAnalysis.immediateSafetyPrecaution}
                </p>
              </div>

              {/* 4 Core Insight Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Possible Cause */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 space-y-1.5">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Possible Cause</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {currentAiAnalysis.possibleCause}
                  </p>
                </div>

                {/* 2. Responsible Department */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 space-y-1.5">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Responsible Department</span>
                  </div>
                  <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    {currentAiAnalysis.responsibleDepartment}
                  </div>
                  <div className="text-xs text-slate-500">
                    Automated dispatch routing enabled for this specialty team.
                  </div>
                </div>

                {/* 3. Recommended Action */}
                <div className="sm:col-span-2 p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-1.5">
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Recommended Action</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {currentAiAnalysis.recommendedAction}
                  </p>
                </div>

                {/* 4. Risk Assessment */}
                {currentAiAnalysis.riskAssessment && (
                  <div className="sm:col-span-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 space-y-1.5">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      <span>Life Safety & Risk Assessment</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentAiAnalysis.riskAssessment}
                    </p>
                  </div>
                )}
              </div>

              {/* Maintenance Suggestion Accordion / Footer */}
              {currentAiAnalysis.maintenanceSuggestion && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
                  <Wrench className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-800 dark:text-slate-200">Preventive Maintenance Checklist:</strong>{' '}
                    {currentAiAnalysis.maintenanceSuggestion}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyAnalysis}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied Briefing' : 'Copy Briefing'}
                  </button>

                  <button
                    onClick={() => setActiveTab('issues')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                  >
                    View in Issue Management
                  </button>

                  <button
                    onClick={() => setActiveTab('emergency-response')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Open in ERC
                  </button>
                </div>

                <div className="text-[11px] text-slate-400">
                  Diagnostic timestamp: {currentAiAnalysis.analyzedAt}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <Bot className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Incident Selected
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Select one of the quick test scenarios on the left or click any reported issue or safety alert to run an immediate AI safety analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
