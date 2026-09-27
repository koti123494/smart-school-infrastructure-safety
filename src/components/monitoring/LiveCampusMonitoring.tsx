import React from 'react';
import {
  Activity,
  Flame,
  Thermometer,
  Droplets,
  Zap,
  BatteryCharging,
  Radio,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';

export const LiveCampusMonitoring: React.FC = () => {
  const {
    sensors,
    alerts,
    problems,
    currentSchool,
    setSelectedIssueId,
    setActiveTab,
  } = useApp();

  const smokeSensors = sensors.filter((s) => s.type === 'smoke');
  const tempSensors = sensors.filter((s) => s.type === 'temperature');
  const waterSensors = sensors.filter((s) => s.type === 'water');
  const elecSensors = sensors.filter((s) => s.type === 'electrical');

  const hasSmokeAlert = smokeSensors.some((s) => s.status === 'critical' || s.status === 'warning');
  const hasWaterLeak = waterSensors.some((s) => s.status === 'critical' || s.status === 'warning');
  const hasElecWarning = elecSensors.some((s) => s.status === 'critical' || s.status === 'warning');
  const hasTempWarning = tempSensors.some((s) => s.status === 'warning' || s.status === 'critical');

  const avgTemp = (
    tempSensors.reduce((acc, curr) => acc + curr.numericValue, 0) / (tempSensors.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Live Campus Infrastructure Monitoring
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Continuous streaming surveillance of life-safety detectors, environmental climate, and power grid nodes at {currentSchool.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>MQTT Broker: 48 Nodes Streaming</span>
        </div>
      </div>

      {/* 5 Core Infrastructure Monitoring Cards (Requirement 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Smoke Detection */}
        <div
          className={`p-5 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
            hasSmokeAlert
              ? 'border-rose-300 bg-rose-50/60 glow-red'
              : 'border-emerald-200 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700">Smoke Detection</span>
              <div
                className={`p-2 rounded-xl ${
                  hasSmokeAlert ? 'bg-rose-100 text-rose-700 animate-bounce' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              Status:{' '}
              <span className={hasSmokeAlert ? 'text-rose-700 font-black' : 'text-emerald-700'}>
                {hasSmokeAlert ? 'ELEVATED (Lab 2)' : 'Normal'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {hasSmokeAlert
                ? 'Optical smoke sensor triggered in Chemistry Laboratory.'
                : 'All optical sensors reading 0-4 ppm baseline clean.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-mono text-slate-400">8 Smoke Nodes</span>
            <span className={hasSmokeAlert ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
              {hasSmokeAlert ? '🔴 Critical' : '🟢 Safe'}
            </span>
          </div>
        </div>

        {/* Temperature */}
        <div
          className={`p-5 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
            hasTempWarning
              ? 'border-amber-300 bg-amber-50/60 glow-amber'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700">Temperature</span>
              <div
                className={`p-2 rounded-xl ${
                  hasTempWarning ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                <Thermometer className="w-5 h-5" />
              </div>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              Current: <span className="font-mono text-blue-700">{avgTemp}°C</span>
            </div>
            <div className="text-xs font-bold text-slate-700 mt-1">
              Status:{' '}
              <span className={hasTempWarning ? 'text-amber-700' : 'text-emerald-700'}>
                {hasTempWarning ? 'Warning (Room 204: 31.8°C)' : 'Normal'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Classroom thermostat limits set to 18°C – 30°C.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-mono text-slate-400">12 Thermal Probes</span>
            <span className={hasTempWarning ? 'text-amber-600 font-bold' : 'text-emerald-600 font-semibold'}>
              {hasTempWarning ? '🟠 Warning' : '🟢 Safe'}
            </span>
          </div>
        </div>

        {/* Water Leakage */}
        <div
          className={`p-5 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
            hasWaterLeak
              ? 'border-rose-300 bg-rose-50/60 glow-red'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700">Water Leakage</span>
              <div
                className={`p-2 rounded-xl ${
                  hasWaterLeak ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-cyan-100 text-cyan-700'
                }`}
              >
                <Droplets className="w-5 h-5" />
              </div>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              Status:{' '}
              <span className={hasWaterLeak ? 'text-rose-700 font-black' : 'text-emerald-700'}>
                {hasWaterLeak ? 'Leak Detected' : 'No Leakage Detected'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {hasWaterLeak
                ? 'Moisture probe triggered in Washroom Block B near substation.'
                : 'Roof slabs, washrooms & pump risers dry.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-mono text-slate-400">6 Hydrostatic Probes</span>
            <span className={hasWaterLeak ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
              {hasWaterLeak ? '🔴 Critical' : '🟢 Safe'}
            </span>
          </div>
        </div>

        {/* Electrical System */}
        <div
          className={`p-5 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
            hasElecWarning
              ? 'border-amber-300 bg-amber-50/60 glow-amber'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700">Electrical System</span>
              <div
                className={`p-2 rounded-xl ${
                  hasElecWarning ? 'bg-amber-100 text-amber-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              Status:{' '}
              <span className={hasElecWarning ? 'text-amber-700' : 'text-emerald-700'}>
                {hasElecWarning ? 'Warning (Feeder CT)' : 'Normal'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Current draw: 14.2A. Frequency: 50.1Hz stable with balanced 3-phase load.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-mono text-slate-400">Main Substation CT</span>
            <span className={hasElecWarning ? 'text-amber-600 font-bold' : 'text-emerald-600 font-semibold'}>
              {hasElecWarning ? '🟠 Warning' : '🟢 Safe'}
            </span>
          </div>
        </div>

        {/* Power Supply */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700">Power Supply</span>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <BatteryCharging className="w-5 h-5" />
              </div>
            </div>
            <div className="text-base font-extrabold text-slate-900">
              Status: <span className="text-emerald-700">Stable</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              230V AC Mains online. Rooftop solar generation contributing 42kW grid-tie.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-mono text-slate-400">Microgrid ATS Online</span>
            <span className="text-emerald-600 font-semibold">🟢 Safe</span>
          </div>
        </div>
      </div>

      {/* Live Activity Feed Stream (Requirement 5) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Live Activity Feed &amp; Timestamped Telemetry
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time audit log of campus automated sensor notifications and staff dispatches
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Live Timestamp Feed</span>
        </div>

        <div className="space-y-3">
          {/* Example 1 (Requirement 5) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-4 hover:bg-slate-100/70 transition">
            <div className="px-3 py-1.5 bg-rose-100 text-rose-800 rounded-lg font-mono text-xs font-bold whitespace-nowrap">
              10:32 AM
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <strong className="text-xs text-slate-900">
                  Temperature sensor detected increased temperature in Block A.
                </strong>
                <span className="px-2 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                  Warning
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Room 204 ambient thermostat TMP-204 spiked from 27°C to 31.8°C following high compressor load.
              </p>
            </div>
          </div>

          {/* Example 2 (Requirement 5) */}
          <div
            onClick={() => setSelectedIssueId('pr-124')}
            className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 flex items-start gap-4 hover:bg-blue-50 transition cursor-pointer"
          >
            <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg font-mono text-xs font-bold whitespace-nowrap">
              10:28 AM
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <strong className="text-xs text-slate-900">
                  Teacher reported broken classroom fan.
                </strong>
                <span className="font-mono text-[10px] text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-300">
                  SCH-2026-00124
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Priya Sharma filed high-priority ticket for Classroom 103 wobbly fan motor with photographic proof.
              </p>
            </div>
          </div>

          {/* Example 3 (Requirement 5) */}
          <div
            onClick={() => setSelectedIssueId('pr-002')}
            className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-start gap-4 hover:bg-emerald-50 transition cursor-pointer"
          >
            <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg font-mono text-xs font-bold whitespace-nowrap">
              10:21 AM
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <strong className="text-xs text-slate-900">
                  Maintenance task assigned to Electrical Team.
                </strong>
                <span className="px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                  Assigned
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Technician Rajesh Kumar assigned to overhaul switchboard panel for Classroom 101.
              </p>
            </div>
          </div>

          {/* Additional telemetry log */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
            <div className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-mono text-xs font-bold whitespace-nowrap">
              10:15 AM
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <strong className="text-xs text-slate-900">
                  Substation battery backup health check completed.
                </strong>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.2 rounded">
                  Routine Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                125kVA generator fuel level at 92%. Inverter battery bank internal resistance within 1.2 mΩ tolerance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
