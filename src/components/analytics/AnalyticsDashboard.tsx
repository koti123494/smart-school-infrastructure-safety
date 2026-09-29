import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  Filter,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';

export const AnalyticsDashboard: React.FC = () => {
  const { problems, recurringInsights, classrooms, setActiveTab, backendConnected, liveAnalytics } = useApp();
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | 'ytd'>('90d');

  const categoryColors = ['bg-amber-500', 'bg-cyan-500', 'bg-blue-500', 'bg-rose-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-slate-400'];
  const categoryData = backendConnected && liveAnalytics ? liveAnalytics.byCategory.map((item, index) => ({
    name: item.category,
    count: item.count,
    percentage: liveAnalytics.total ? Math.round(item.count / liveAnalytics.total * 100) : 0,
    color: categoryColors[index % categoryColors.length],
  })) : [
    { name: 'Electrical', count: 18, percentage: 32, color: 'bg-amber-500' },
    { name: 'Plumbing & Water', count: 12, percentage: 22, color: 'bg-cyan-500' },
    { name: 'Furniture & Desks', count: 9, percentage: 16, color: 'bg-blue-500' },
    { name: 'Safety & Sensors', count: 6, percentage: 11, color: 'bg-rose-500' },
    { name: 'Structural & Walls', count: 5, percentage: 9, color: 'bg-indigo-500' },
    { name: 'Internet / Wi-Fi', count: 4, percentage: 7, color: 'bg-emerald-500' },
    { name: 'Other Facilities', count: 2, percentage: 3, color: 'bg-slate-400' },
  ];

  // Breakdown by Location (Requirement 16)
  const locationColors = ['bg-blue-600', 'bg-cyan-600', 'bg-rose-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-orange-600'];
  const locationData = backendConnected && liveAnalytics ? liveAnalytics.byLocation.map((item, index) => ({
    location: item.location,
    count: item.count,
    color: locationColors[index % locationColors.length],
  })) : [
    { location: 'Classrooms (All Blocks)', count: 26, color: 'bg-blue-600' },
    { location: 'Washrooms', count: 14, color: 'bg-cyan-600' },
    { location: 'Laboratories (Science)', count: 8, color: 'bg-rose-600' },
    { location: 'Corridors & Stairs', count: 5, color: 'bg-indigo-600' },
    { location: 'Playground & Sports', count: 4, color: 'bg-emerald-600' },
    { location: 'Canteen & Dining', count: 3, color: 'bg-orange-600' },
  ];

  // Monthly Problem Trend (Requirement 16)
  const monthlyTrend = backendConnected && liveAnalytics ? liveAnalytics.monthly.map((item) => ({
    month: new Date(`${item.month}-01T00:00:00`).toLocaleDateString('en', { month: 'short', year: '2-digit' }),
    count: item.count,
  })) : [
    { month: 'Apr', count: 14 },
    { month: 'May', count: 19 },
    { month: 'Jun', count: 8 },
    { month: 'Jul', count: 24 },
    { month: 'Aug', count: 31 },
    { month: 'Sep (Current)', count: 28 },
  ];

  const maxMonthly = Math.max(1, ...monthlyTrend.map((m) => m.count));
  const maxLocation = Math.max(1, ...locationData.map((item) => item.count));
  const peakMonth = monthlyTrend.reduce((peak, month) => month.count > peak.count ? month : peak, { month: 'No data', count: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Infrastructure Analytics &amp; Predictive Risk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              BI Intelligence Suite
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyzing recurring equipment breakdowns, SLA resolution benchmarks, and predictive maintenance hotspots.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs self-start md:self-auto font-semibold">
          {(['30d', '90d', 'ytd'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg uppercase transition ${
                timeframe === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === '30d' ? 'Last 30 Days' : t === '90d' ? 'Last 90 Days' : 'Year to Date'}
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Performance Benchmarks (Requirement 16) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600">Avg Response Time</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2 font-mono">{backendConnected ? '—' : '18 mins'}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">{backendConnected ? 'Not available from live API' : '↓ 4m faster than SLA'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600">Avg Resolution Time</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">{backendConnected && liveAnalytics?.averageHours != null ? `${liveAnalytics.averageHours.toFixed(1)} hours` : backendConnected ? '—' : '2.4 hours'}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">{backendConnected ? 'Database average' : '94.2% within SLA'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600">Open Issues</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{backendConnected && liveAnalytics ? liveAnalytics.open : 12}</div>
          <p className="text-[11px] text-slate-400 mt-1">{backendConnected ? `${problems.filter((problem) => problem.status === 'IN PROGRESS').length} in progress now` : '5 in progress now'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-600">Resolved Issues</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{backendConnected && liveAnalytics ? liveAnalytics.resolved : 126}</div>
          <p className="text-[11px] text-slate-400 mt-1">Certified by faculty</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-rose-700">Overdue Issues</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono">{backendConnected ? '—' : '1'}</div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">{backendConnected ? 'Not available from live API' : 'Escalated to Supervisor'}</p>
        </div>
      </div>

      {/* Charts Row: Category Breakdown + Location Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Problems by Category (Requirement 16) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Problems by Category</h3>
            <span className="text-xs text-slate-400">Total: {backendConnected && liveAnalytics ? liveAnalytics.total : 58} incidents</span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                  <span className="font-mono text-slate-500">
                    {cat.count} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.percentage * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Problems by Location (Requirement 16) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Problems by Campus Location</h3>
            <span className="text-xs text-slate-400">Highest volume zones</span>
          </div>

          <div className="space-y-3 pt-2">
            {locationData.map((loc) => {
              const widthPct = Math.round((loc.count / maxLocation) * 100);

              return (
                <div key={loc.location} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{loc.location}</span>
                    <span className="font-mono text-slate-500">{loc.count} reports</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${loc.color}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Problems Trend Chart (Requirement 16) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Reported Issues Trend</h3>
            <p className="text-xs text-slate-500">{backendConnected ? 'Monthly issue counts from the live database' : 'Seasonal spike during monsoon &amp; high academic traffic'}</p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
            Peak: {peakMonth.month} ({peakMonth.count} Issues)
          </span>
        </div>

        <div className="pt-4 h-48 flex items-end justify-between gap-4 border-b border-slate-200 pb-2">
          {monthlyTrend.map((m) => {
            const heightPct = Math.round((m.count / maxMonthly) * 100);
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[11px] font-mono font-bold text-slate-700 group-hover:text-blue-600 transition">
                  {m.count}
                </span>
                <div className="w-full bg-slate-100 rounded-t-xl h-36 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-blue-700 to-indigo-500 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-medium text-center">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recurring Problems & AI Recommendation Engine (Requirement 16 & 17) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">
                Recurring Problems &amp; Root-Cause Analysis
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated detection of repeat failures with preventive overhaul recommendations
            </p>
          </div>

          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
            {backendConnected ? 'Live insights unavailable' : `${recurringInsights.length} Hotspots Identified`}
          </span>
        </div>

        {/* Recurring Insight Cards matching Prompt Requirement 16 & 17 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {backendConnected ? (
            <p className="text-xs text-slate-500">The live backend does not provide recurring-problem analysis.</p>
          ) : recurringInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                insight.riskLevel === 'High'
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{insight.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        insight.riskLevel === 'High'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      Risk: {insight.riskLevel}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {insight.incidentCount} incidents
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Location: <strong className="text-slate-800">{insight.location}</strong> • {insight.timeframe}
                </div>

                <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    Root Cause:
                  </div>
                  <p className="text-slate-700">{insight.rootCause}</p>
                </div>

                {/* Recommendation Box (Requirement 16) */}
                <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs">
                  <strong className="text-amber-900 block font-bold mb-0.5 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    Recommendation:
                  </strong>
                  <p className="text-amber-800">{insight.recommendation}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold font-mono">
                  Est. Savings: {insight.estimatedPreventiveSavings}
                </span>
                <button
                  onClick={() => setActiveTab('issues')}
                  className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                >
                  <span>Schedule Overhaul</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
