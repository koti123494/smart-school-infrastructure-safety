import React from 'react';
import {
  Building,
  ShieldCheck,
  Activity,
  AlertTriangle,
  FileText,
  Wrench,
  BarChart3,
  ArrowRight,
  Radio,
  CheckCircle2,
  Users,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC = () => {
  const { currentSchool, loginAs, setActiveTab, campusSafetyStatus, sensors, problems, classrooms } = useApp();

  const totalSensors = sensors.length;
  const activeSensors = sensors.filter((s) => s.status !== 'offline').length;
  const resolvedCount = problems.filter((p) => p.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wide text-white flex items-center gap-1.5">
                SMART SCHOOL
                <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 font-semibold rounded-full border border-blue-500/30">
                  SaaS v2.4
                </span>
              </span>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Infrastructure &amp; Safety Monitoring System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow" />
              <span className="text-slate-300 font-medium">{currentSchool.name}</span>
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/25 transition flex items-center gap-1.5"
            >
              <span>Launch Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-300 text-xs font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Smart India Hackathon • Next-Gen Campus Operations</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Smart School Infrastructure &amp;{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
                Safety Monitoring
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Real-time monitoring, intelligent problem reporting, and faster infrastructure maintenance for safer schools.
              Combining IoT edge telemetry, multi-level alert escalations, and SLA task management.
            </p>

            {/* Quick Launch Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  loginAs('admin');
                  setActiveTab('dashboard');
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-xl shadow-blue-600/30 transition flex items-center gap-2"
              >
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  loginAs('teacher');
                  setActiveTab('report-problem');
                }}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-sm transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Report School Problem</span>
              </button>
              <button
                onClick={() => {
                  loginAs('maintenance');
                  setActiveTab('maintenance');
                }}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-sm transition flex items-center gap-2"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Maintenance Staff Portal</span>
              </button>
            </div>

            {/* Live Ticker Metric Strip */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white font-mono">{classrooms.length}</div>
                <div className="text-xs text-slate-400 mt-1">Classrooms Monitored</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 backdrop-blur-sm">
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {activeSensors}/{totalSensors}
                </div>
                <div className="text-xs text-slate-400 mt-1">Active IoT Sensors</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-400 font-mono">
                  {resolvedCount}
                </div>
                <div className="text-xs text-slate-400 mt-1">Resolved Issues (YTD)</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white font-mono uppercase text-sm flex items-center justify-center gap-1.5 h-8">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {campusSafetyStatus}
                </div>
                <div className="text-xs text-slate-400 mt-1">Campus Safety Status</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid (Requirement 23) */}
      <section className="py-16 bg-slate-950 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Enterprise Campus Safety Ecosystem
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Designed as a unified School Infrastructure Digital Operations Platform for school administrators, teachers, and maintenance crews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Real-Time Monitoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor school infrastructure continuously using IoT sensors for smoke, temperature, water leaks, and power loads.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Instant Alerts &amp; Escalation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive immediate notifications when safety conditions become abnormal with 3-tier automatic SLA escalation.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Smart Problem Reporting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Teachers and staff report problems with evidence photographs, exact campus map coordinates, and auto-priority tags.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Maintenance Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track every issue from report to resolution with work timers, before/after photographs, and digital audit signatures.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Infrastructure Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Identify recurring problems and high-risk hotspots using historical telemetry to enact preventive overhaul before failure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Quick Access Demos */}
      <section className="py-14 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Experience the Role-Based Views
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any role below to test the personalized interface and workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Admin Card */}
            <div
              onClick={() => {
                loginAs('admin');
                setActiveTab('dashboard');
              }}
              className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500 cursor-pointer transition shadow-lg group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300">
                  Executive
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                Administrator Dashboard
              </h3>
              <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">
                Full governance, campus map, IoT health dashboard, team dispatching, and predictive analytics.
              </p>
              <div className="text-xs text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition">
                <span>Open Admin View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Teacher Card */}
            <div
              onClick={() => {
                loginAs('teacher');
                setActiveTab('teacher-reports');
              }}
              className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500 cursor-pointer transition shadow-lg group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300">
                  Staff &amp; Faculty
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                Teacher &amp; Staff Portal
              </h3>
              <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">
                Mobile-optimized problem filing with photo uploads, live ticket progress tracking, and resolution sign-offs.
              </p>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition">
                <span>Open Teacher View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Maintenance Card */}
            <div
              onClick={() => {
                loginAs('maintenance');
                setActiveTab('maintenance');
              }}
              className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500 cursor-pointer transition shadow-lg group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                  <Wrench className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-900/60 text-amber-300">
                  Technicians
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                Maintenance Crew Portal
              </h3>
              <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">
                Task work timers, before/after photo evidence verification, spare parts logging, and instant closure.
              </p>
              <div className="text-xs text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition">
                <span>Open Crew View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-6 px-4 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-400">
              Smart School Infrastructure &amp; Safety Monitoring System
            </span>
          </div>
          <div>
            <span>Smart India Hackathon • Built with React, TypeScript &amp; IoT Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
