import React, { useState } from 'react';
import {
  Siren,
  AlertTriangle,
  Flame,
  Zap,
  Droplets,
  HeartPulse,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Filter,
  Sparkles,
  Phone,
  Radio,
  FileText,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmergencyIncident, EmergencyStatus, EmergencyType } from '../../types';

export const EmergencyResponseCenter: React.FC = () => {
  const {
    emergencies,
    emergencyTeams,
    acknowledgeEmergency,
    assignEmergencyTeam,
    updateEmergencyStatus,
    resolveEmergency,
    verifyEmergency,
    triggerDemoEmergency,
    selectForAiAnalysis,
  } = useApp();

  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [assigningTeamForId, setAssigningTeamForId] = useState<string | null>(null);

  // Statistics
  const totalCount = emergencies.length;
  const activeCount = emergencies.filter(
    (e) => e.status !== 'Resolved' && e.status !== 'Verified'
  ).length;
  const criticalCount = emergencies.filter(
    (e) => e.priority === 'critical' && e.status !== 'Resolved' && e.status !== 'Verified'
  ).length;
  const resolvedCount = emergencies.filter((e) => e.status === 'Resolved' || e.status === 'Verified').length;
  const respondingTeamsCount = emergencyTeams.filter((t) => t.status === 'Responding' || t.status === 'On Scene').length;

  const filteredEmergencies = emergencies.filter((e) => {
    if (selectedTypeFilter !== 'all' && e.type !== selectedTypeFilter) return false;
    if (selectedStatusFilter !== 'all') {
      if (selectedStatusFilter === 'active') {
        if (e.status === 'Resolved' || e.status === 'Verified') return false;
      } else if (e.status !== selectedStatusFilter) {
        return false;
      }
    }
    return true;
  });

  const getEmergencyIcon = (type: EmergencyType) => {
    switch (type) {
      case 'Fire':
      case 'Smoke':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'Electrical':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Water Leakage':
        return <Droplets className="w-5 h-5 text-sky-500" />;
      case 'Medical':
        return <HeartPulse className="w-5 h-5 text-emerald-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: EmergencyStatus) => {
    switch (status) {
      case 'Reported':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
            Reported
          </span>
        );
      case 'Acknowledged':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            Acknowledged
          </span>
        );
      case 'Team Assigned':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            Team Assigned
          </span>
        );
      case 'Responding':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
            Responding
          </span>
        );
      case 'On Scene':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
            On Scene
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            Resolved
          </span>
        );
      case 'Verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            Verified & Closed
          </span>
        );
    }
  };

  const handleResolveSubmit = (id: string) => {
    if (!resolutionNotes.trim()) return;
    resolveEmergency(id, resolutionNotes.trim());
    setResolvingId(null);
    setResolutionNotes('');
  };

  const handleAiAnalyze = (incident: EmergencyIncident) => {
    selectForAiAnalysis({
      id: incident.emergencyCode,
      itemType: 'emergency',
      title: incident.title,
      category: incident.type,
      location: incident.location,
      description: incident.description,
      severity: incident.priority,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-rose-200 text-sm font-semibold tracking-wide uppercase">
            <Siren className="w-5 h-5 text-rose-200 animate-spin" />
            Campus Emergency Response Center (ERC)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Real-Time Emergency Dispatch & Incident Control
          </h1>
          <p className="text-rose-100/90 text-sm mt-1 max-w-2xl">
            Live coordination center for active school infrastructure emergencies, response team mobilization, and AI-assisted safety mitigation protocols.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </div>
          <div>
            <div className="text-xs text-rose-200 font-medium">ERC System Status</div>
            <div className="text-sm font-bold text-white">
              {activeCount > 0 ? `${activeCount} Active Incidents` : 'All Clear • Monitoring'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Logged</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{totalCount}</div>
          <div className="text-xs text-slate-400 mt-0.5">All tracked incidents</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/70 rounded-xl p-4 shadow-sm bg-rose-50/30 dark:bg-rose-950/20">
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>Active Incidents</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{activeCount}</div>
          <div className="text-xs text-rose-500/80 mt-0.5">Pending resolution</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-rose-500">Critical Priority</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{criticalCount}</div>
          <div className="text-xs text-slate-400 mt-0.5">High severity flags</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Responding Teams</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">{respondingTeamsCount}</div>
          <div className="text-xs text-slate-400 mt-0.5">Units en route / on site</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved / Verified</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{resolvedCount}</div>
          <div className="text-xs text-slate-400 mt-0.5">Closed safely</div>
        </div>
      </div>

      {/* Demo Simulation Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-850 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Emergency Scenario Simulator (DEMO)
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Trigger mock emergency drill events to test dispatch protocols, alerts, and AI safety assistant.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerDemoEmergency('fire')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              Simulate Fire/Smoke
            </button>
            <button
              onClick={() => triggerDemoEmergency('electrical')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Simulate Electrical Arc
            </button>
            <button
              onClick={() => triggerDemoEmergency('water')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Droplets className="w-3.5 h-3.5" />
              Simulate Water Burst
            </button>
            <button
              onClick={() => triggerDemoEmergency('medical')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              Simulate Medical
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Emergencies on Left, Response Teams on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Emergency Incidents */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filter:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="Reported">Reported</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="Team Assigned">Team Assigned</option>
                <option value="Responding">Responding</option>
                <option value="On Scene">On Scene</option>
                <option value="Resolved">Resolved</option>
                <option value="Verified">Verified</option>
              </select>

              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Types</option>
                <option value="Fire">Fire</option>
                <option value="Smoke">Smoke</option>
                <option value="Electrical">Electrical</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Medical">Medical</option>
                <option value="Security">Security</option>
                <option value="Structural">Structural</option>
              </select>
            </div>
          </div>

          {/* Incidents List */}
          {filteredEmergencies.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No Incidents Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                There are no incidents matching your current filter criteria. Use the simulator buttons above to trigger a test emergency.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmergencies.map((incident) => {
                const isExpanded = expandedIncidentId === incident.id;
                const isResolving = resolvingId === incident.id;
                const isAssigningTeam = assigningTeamForId === incident.id;

                return (
                  <div
                    key={incident.id}
                    className={`bg-white dark:bg-slate-900 border transition-all rounded-2xl overflow-hidden shadow-sm ${
                      incident.priority === 'critical' && incident.status !== 'Resolved' && incident.status !== 'Verified'
                        ? 'border-rose-300 dark:border-rose-900 ring-1 ring-rose-400/30'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                            {getEmergencyIcon(incident.type)}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                {incident.emergencyCode}
                              </span>
                              {getPriorityBadge(incident.priority)}
                              {getStatusBadge(incident.status)}
                              {incident.isDemo && (
                                <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded">
                                  DEMO
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                              {incident.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {incident.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {incident.reportedAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* AI Safety Advice Button */}
                        <button
                          onClick={() => handleAiAnalyze(incident)}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 shrink-0 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          AI Safety Advice
                        </button>
                      </div>

                      {/* Incident Description */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        {incident.description}
                      </p>

                      {/* Assigned Team Info */}
                      {incident.assignedTeamName && (
                        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 px-3 py-2 rounded-lg">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>
                            Assigned Team: <strong className="text-blue-700 dark:text-blue-300">{incident.assignedTeamName}</strong>
                          </span>
                        </div>
                      )}

                      {/* Resolution Notes If Resolved */}
                      {incident.resolutionNotes && (
                        <div className="mt-3 flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-3 py-2 rounded-lg">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Resolution Report:</strong> {incident.resolutionNotes}
                          </div>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {incident.status === 'Reported' && (
                            <button
                              onClick={() => acknowledgeEmergency(incident.id)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                            >
                              Acknowledge
                            </button>
                          )}

                          {incident.status !== 'Resolved' && incident.status !== 'Verified' && !incident.assignedTeamId && (
                            <button
                              onClick={() => setAssigningTeamForId(isAssigningTeam ? null : incident.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <Users className="w-3.5 h-3.5" />
                              Assign Response Team
                            </button>
                          )}

                          {incident.assignedTeamId && incident.status === 'Team Assigned' && (
                            <button
                              onClick={() => updateEmergencyStatus(incident.id, 'Responding', 'Response team is actively en route.')}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                            >
                              Mark Responding
                            </button>
                          )}

                          {incident.status === 'Responding' && (
                            <button
                              onClick={() => updateEmergencyStatus(incident.id, 'On Scene', 'Response team has arrived on scene and initiated mitigation.')}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                            >
                              Mark On Scene
                            </button>
                          )}

                          {incident.status !== 'Resolved' && incident.status !== 'Verified' && (
                            <button
                              onClick={() => setResolvingId(isResolving ? null : incident.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Resolve Incident
                            </button>
                          )}

                          {incident.status === 'Resolved' && (
                            <button
                              onClick={() => verifyEmergency(incident.id)}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              Verify & Close
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => setExpandedIncidentId(isExpanded ? null : incident.id)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {isExpanded ? 'Hide Timeline' : `Timeline (${incident.timeline.length})`}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </div>

                      {/* Team Assignment Dropdown Panel */}
                      {isAssigningTeam && (
                        <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2">
                          <div className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center justify-between">
                            <span>Select Response Team to Dispatch:</span>
                            <button onClick={() => setAssigningTeamForId(null)} className="text-slate-400 hover:text-slate-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {emergencyTeams.map((team) => (
                              <button
                                key={team.id}
                                onClick={() => {
                                  assignEmergencyTeam(incident.id, team.id);
                                  setAssigningTeamForId(null);
                                }}
                                className="p-2 text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-lg text-xs transition-all flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-bold text-slate-800 dark:text-slate-200">{team.name}</div>
                                  <div className="text-[11px] text-slate-500">{team.specialty} • Lead: {team.leadName}</div>
                                </div>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  team.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {team.status}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resolution Input Box */}
                      {isResolving && (
                        <div className="mt-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-2">
                          <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            Provide Incident Resolution Notes:
                          </div>
                          <textarea
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            placeholder="Detail actions taken, inspection results, and safety clearance..."
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setResolvingId(null)}
                              className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleResolveSubmit(incident.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                            >
                              Confirm Resolution
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Expanded Timeline */}
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Incident Dispatch Timeline & Audit Trail
                          </div>
                          <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                            {incident.timeline.map((entry) => (
                              <div key={entry.id} className="relative text-xs">
                                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900" />
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                  {entry.status} • <span className="text-slate-500 font-normal">{entry.timestamp}</span>
                                </div>
                                <div className="text-slate-600 dark:text-slate-400 mt-0.5">{entry.note}</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">By: {entry.updatedBy}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Response Teams Status */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Emergency Response Teams
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {emergencyTeams.length} Teams
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active campus first responder units on emergency standby.
            </p>

            <div className="space-y-3">
              {emergencyTeams.map((team) => (
                <div
                  key={team.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {team.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        team.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : team.status === 'Responding'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {team.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div>Specialty: <strong className="text-slate-700 dark:text-slate-300">{team.specialty}</strong></div>
                    <div>Lead: <strong className="text-slate-700 dark:text-slate-300">{team.leadName}</strong></div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {team.contactNumber}
                    </div>
                    <div>Est. SLA: <strong className="text-slate-700 dark:text-slate-300">{team.responseTimeMinutes}m</strong></div>
                  </div>

                  {team.currentAssignment && (
                    <div className="text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded">
                      Dispatching to: {team.currentAssignment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
