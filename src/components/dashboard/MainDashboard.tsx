import React from 'react';
import {
  GraduationCap,
  Cpu,
  AlertOctagon,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Flame,
  Thermometer,
  Droplets,
  Zap,
  BatteryCharging,
  ArrowRight,
  TrendingUp,
  MapPin,
  PlusCircle,
  FileText,
  Activity,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { schoolImages, getProblemCategoryImage } from '../../data/imageLibrary';

export const MainDashboard: React.FC = () => {
  const {
    currentSchool,
    currentUser,
    campusSafetyStatus,
    classrooms,
    sensors,
    problems,
    alerts,
    backendConnected,
    liveAnalytics,
    setActiveTab,
    setSelectedIssueId,
    aiAssistantResponse,
    generateAiAdvice,
    demoScenario,
  } = useApp();

  // Metrics computation
  const totalClassrooms = classrooms.length;
  const activeSensors = sensors.filter((s) => s.status !== 'offline').length;
  const openProblems = backendConnected && liveAnalytics ? liveAnalytics.open : problems.filter((p) => p.status !== 'RESOLVED' && p.status !== 'VERIFIED').length;
  const criticalAlerts = backendConnected && liveAnalytics ? liveAnalytics.critical : alerts.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length;
  const inProgressIssues = problems.filter((p) => p.status === 'IN PROGRESS').length;
  const resolvedIssues = backendConnected && liveAnalytics ? liveAnalytics.resolved : problems.filter((p) => p.status === 'RESOLVED' || p.status === 'VERIFIED').length;

  // Real-time sensor indicators
  const smokeSensors = sensors.filter((s) => s.type === 'smoke');
  const hasSmokeAlert = smokeSensors.some((s) => s.status === 'critical' || s.status === 'warning');

  const tempSensors = sensors.filter((s) => s.type === 'temperature');
  const avgTemp = (
    tempSensors.reduce((acc, curr) => acc + curr.numericValue, 0) / (tempSensors.length || 1)
  ).toFixed(1);
  const hasTempWarning = tempSensors.some((s) => s.status === 'warning' || s.status === 'critical');

  const waterSensors = sensors.filter((s) => s.type === 'water');
  const hasWaterLeak = waterSensors.some((s) => s.status === 'critical' || s.status === 'warning');

  const elecSensors = sensors.filter((s) => s.type === 'electrical');
  const hasElecWarning = elecSensors.some((s) => s.status === 'critical' || s.status === 'warning');

  return (
    <div className="space-y-6">
      {/* Header Banner (Requirement 4) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Good Morning, {currentUser.role === 'admin' ? 'Administrator' : currentUser.name}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Operations Center
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <strong className="text-slate-800">{currentSchool.name}</strong> • {currentSchool.location}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider shadow-sm ${
              campusSafetyStatus === 'safe'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : campusSafetyStatus === 'warning'
                ? 'bg-amber-50 text-amber-800 border-amber-300 glow-amber'
                : 'bg-rose-50 text-rose-800 border-rose-300 glow-red animate-pulse'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                campusSafetyStatus === 'safe'
                  ? 'bg-emerald-500'
                  : campusSafetyStatus === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-rose-500 animate-ping'
              }`}
            />
            <span>Campus Safety Status: {campusSafetyStatus}</span>
          </div>

          <button
            onClick={() => setActiveTab('report-problem')}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Problem</span>
          </button>
        </div>
      </div>

      {/* Dashboard Stat Cards (Requirement 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Total Classrooms */}
        <div
          onClick={() => setActiveTab(backendConnected ? 'issues' : 'classrooms')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-blue-600 transition">
            <span className="text-xs font-semibold text-slate-600">{backendConnected ? 'Total Issues' : 'Total Classrooms'}</span>
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {backendConnected && liveAnalytics ? liveAnalytics.total : backendConnected ? '—' : totalClassrooms}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{backendConnected ? 'All database records' : 'Across 4 Blocks'}</p>
        </div>

        {/* Card 2: Active IoT Sensors */}
        <div
          onClick={() => setActiveTab('iot-sensors')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-600 transition">
            <span className="text-xs font-semibold text-slate-600">Active IoT Sensors</span>
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
            {backendConnected ? '—' : activeSensors}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1 flex items-center gap-1">
            {backendConnected ? 'No live sensor API' : <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />100% Online Telemetry</>}
          </p>
        </div>

        {/* Card 3: Open Problems */}
        <div
          onClick={() => setActiveTab('issues')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-amber-600 transition">
            <span className="text-xs font-semibold text-slate-600">Open Problems</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {openProblems}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending inspection/work</p>
        </div>

        {/* Card 4: Critical Alerts */}
        <div
          onClick={() => setActiveTab('alerts')}
          className={`bg-white p-4 rounded-2xl border transition cursor-pointer group ${
            criticalAlerts > 0 ? 'border-rose-300 bg-rose-50/40 glow-red' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-rose-600 transition">
            <span className="text-xs font-semibold text-rose-700">{backendConnected ? 'Critical Issues' : 'Critical Alerts'}</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono flex items-center gap-2">
            {criticalAlerts}
            {criticalAlerts > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <p className="text-[11px] text-rose-600/90 mt-1 font-medium">Immediate SLA response</p>
        </div>

        {/* Card 5: In Progress */}
        <div
          onClick={() => setActiveTab('maintenance')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-blue-600 transition">
            <span className="text-xs font-semibold text-slate-600">Issues In Progress</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2 font-mono">
            {inProgressIssues}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Assigned to field staff</p>
        </div>

        {/* Card 6: Resolved Issues */}
        <div
          onClick={() => setActiveTab('issues')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-600 transition">
            <span className="text-xs font-semibold text-slate-600">Resolved Issues</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            {resolvedIssues}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1">Verified resolutions</p>
        </div>
      </div>

      {aiAssistantResponse && (
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700">
                <Activity className="w-4 h-4" />
                AI Safety Assistant
              </div>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{aiAssistantResponse.title}</h3>
            </div>
            <div className="text-xs px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200 font-semibold">
              {aiAssistantResponse.demoMode ? 'Demo Mode / Fallback' : 'AI-assisted'}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
            <div className="rounded-xl bg-white/80 p-3 border border-sky-200"><span className="block text-[11px] font-bold uppercase text-slate-500">Possible Cause</span><span className="mt-1 block">{aiAssistantResponse.possibleCause}</span></div>
            <div className="rounded-xl bg-white/80 p-3 border border-sky-200"><span className="block text-[11px] font-bold uppercase text-slate-500">Risk</span><span className="mt-1 block">{aiAssistantResponse.risk}</span></div>
            <div className="rounded-xl bg-white/80 p-3 border border-sky-200"><span className="block text-[11px] font-bold uppercase text-slate-500">Recommended Action</span><span className="mt-1 block">{aiAssistantResponse.recommendedAction}</span></div>
            <div className="rounded-xl bg-white/80 p-3 border border-sky-200"><span className="block text-[11px] font-bold uppercase text-slate-500">Maintenance Suggestion</span><span className="mt-1 block">{aiAssistantResponse.maintenanceSuggestion}</span></div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-600">Priority: <span className="text-sky-700">{aiAssistantResponse.priority}</span></span>
            <button
              onClick={() => generateAiAdvice({ title: 'Live Monitoring Review', description: 'Temperature spike and ventilation issue observed in classroom', location: 'Block A', category: 'Electrical', severity: 'medium' })}
              className="px-3 py-1.5 rounded-lg bg-sky-700 text-white text-xs font-semibold hover:bg-sky-800 transition"
            >
              Refresh AI Advisory
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-100 rounded-2xl border border-slate-200 p-4 text-xs text-slate-600 flex items-center justify-between gap-3 flex-wrap">
        <span><strong>Demo scenario:</strong> {demoScenario}</span>
        <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-700">AI fallback active; no keys exposed to frontend</span>
      </div>

      {/* Section 5: Real-Time Safety Monitoring & Live Campus Monitoring */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Live Campus Monitoring
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current status of critical school infrastructure telemetries across blocks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('campus-map')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Campus Map</span>
            </button>
            <button
              onClick={() => setActiveTab('live-monitoring')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>Detailed Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 5 Infrastructure Monitoring Cards (Requirement 5) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Smoke Detection */}
          <div
            className={`p-4 rounded-xl border transition ${
              hasSmokeAlert
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50/40 border-emerald-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">Smoke Detection</span>
              <div
                className={`p-1.5 rounded-lg ${
                  hasSmokeAlert ? 'bg-rose-200 text-rose-700 animate-bounce' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold mt-1">
              Status:{' '}
              <span className={hasSmokeAlert ? 'text-rose-700 font-extrabold uppercase' : 'text-emerald-700'}>
                {hasSmokeAlert ? 'ELEVATED IN LAB' : 'Normal'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {hasSmokeAlert ? 'Chemistry Lab optical sensor spike' : 'Zero particulate buildup across blocks'}
            </p>
          </div>

          {/* 2. Temperature */}
          <div
            className={`p-4 rounded-xl border transition ${
              hasTempWarning
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">Temperature</span>
              <div
                className={`p-1.5 rounded-lg ${
                  hasTempWarning ? 'bg-amber-200 text-amber-800' : 'bg-blue-100 text-blue-700'
                }`}
              >
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold mt-1">
              Current: <span className="font-mono">{avgTemp}°C</span>
            </div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">
              Status:{' '}
              <span className={hasTempWarning ? 'text-amber-700 font-bold' : 'text-emerald-600 font-semibold'}>
                {hasTempWarning ? 'Warning (Room 204)' : 'Normal'}
              </span>
            </div>
          </div>

          {/* 3. Water Leakage */}
          <div
            className={`p-4 rounded-xl border transition ${
              hasWaterLeak
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">Water Leakage</span>
              <div
                className={`p-1.5 rounded-lg ${
                  hasWaterLeak ? 'bg-rose-200 text-rose-700 animate-pulse' : 'bg-cyan-100 text-cyan-700'
                }`}
              >
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold mt-1">
              Status:{' '}
              <span className={hasWaterLeak ? 'text-rose-700 font-extrabold uppercase' : 'text-emerald-700'}>
                {hasWaterLeak ? 'Leakage Detected' : 'No Leakage Detected'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {hasWaterLeak ? 'Block B washroom riser triggered' : 'Washrooms & roofs dry'}
            </p>
          </div>

          {/* 4. Electrical System */}
          <div
            className={`p-4 rounded-xl border transition ${
              hasElecWarning
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">Electrical System</span>
              <div
                className={`p-1.5 rounded-lg ${
                  hasElecWarning ? 'bg-amber-200 text-amber-800' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold mt-1">
              Status:{' '}
              <span className={hasElecWarning ? 'text-amber-700 font-bold' : 'text-emerald-700'}>
                {hasElecWarning ? 'Warning (Substation CT)' : 'Normal'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">14.2A current • Balanced phase</p>
          </div>

          {/* 5. Power Supply */}
          <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 text-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">Power Supply</span>
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <BatteryCharging className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold mt-1">
              Status: <span className="text-emerald-700">Stable</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">230V Mains + Solar Hybrid Active</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Live Activity Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Activity Feed (Requirement 5) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Campus Activity Feed</h3>
              <p className="text-xs text-slate-500">Chronological stream of sensor events and facility logs</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live WebSocket Stream
            </span>
          </div>

          <div className="space-y-4">
            {/* Feed items matching prompt specification */}
            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
              <div className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-mono text-xs font-bold whitespace-nowrap">
                10:32 AM
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800">
                  Temperature sensor detected increased temperature in Block A (Room 204: 31.8°C).
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400">Sensor TMP-204</span>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 rounded">HVAC Thermal Warning</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => setSelectedIssueId('pr-124')}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <div className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-mono text-xs font-bold whitespace-nowrap">
                10:28 AM
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800">
                  Teacher Priya Sharma reported broken classroom fan in Classroom 103.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    SCH-2026-00124
                  </span>
                  <span className="text-[10px] text-slate-400">Block A • Floor 1</span>
                  <span className="text-[10px] text-blue-600 hover:underline font-medium">Click to inspect →</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => setSelectedIssueId('pr-002')}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <div className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold whitespace-nowrap">
                10:21 AM
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800">
                  Maintenance task SCH-002 assigned to Plumbing Team (M. Nagaraju).
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    SCH-002
                  </span>
                  <span className="text-[10px] text-slate-400">Washroom Complex Block B</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
              <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold whitespace-nowrap">
                10:15 AM
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800">
                  Automatic solar hybrid inverter engaged for grid peak-shaving.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400">Substation Sub-panel</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 rounded">Efficiency Optimal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Operational Shortcuts & Hotspot Alert */}
        <div className="lg:col-span-4 space-y-4">
          {/* Recurring Hotspot Alert Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-700" />
                Recurring Hotspot
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full">
                High Risk
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">Block A – Classroom 103 Fan Failure</h4>
            <p className="text-xs text-slate-600 mt-1">
              Reported 5 times in the last 3 months.
            </p>
            <div className="mt-3 p-2.5 rounded-xl bg-white/80 border border-amber-300/60 text-xs text-slate-700">
              <strong className="text-amber-900 block mb-0.5">Recommendation:</strong>
              Inspect or replace complete fan assembly instead of repeated repairs.
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="mt-3 text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              <span>View Predictive Risk Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Quick Admin Actions
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('campus-map')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition flex items-center justify-between text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Open Interactive Campus Map</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('issues')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition flex items-center justify-between text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Manage Work Order Queue</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveTab('alerts')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-300 transition flex items-center justify-between text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Safety Escalation Ladder</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
