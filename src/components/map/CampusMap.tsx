import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  Info,
  Maximize2,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Droplets,
  Zap,
  Building2,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Building, SafetyStatus } from '../../types';
import { CampusLocationModal } from './CampusLocationModal';

export const CampusMap: React.FC = () => {
  const { currentSchool, buildings, setSelectedBuildingId, selectedBuildingId } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'safe' | 'warning' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuildings = buildings.filter((b) => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (searchQuery && !b.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBorder = (status: SafetyStatus) => {
    switch (status) {
      case 'critical':
        return 'border-rose-500 bg-rose-500/10 text-rose-300 ring-2 ring-rose-500/50';
      case 'warning':
        return 'border-amber-500 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/40';
      case 'safe':
      default:
        return 'border-emerald-500/60 bg-emerald-500/5 text-emerald-300 hover:border-emerald-400';
    }
  };

  const getStatusDot = (status: SafetyStatus) => {
    switch (status) {
      case 'critical':
        return 'bg-rose-500 animate-ping';
      case 'warning':
        return 'bg-amber-500 animate-pulse';
      case 'safe':
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              School Infrastructure Campus Map
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Interactive Blueprint
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual geospatial layout of {currentSchool.name}. Click any building or facility zone to view live telemetry and open maintenance orders.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search facility zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-44 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {(['all', 'safe', 'warning', 'critical'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition ${
                  filterStatus === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="relative bg-slate-950 rounded-3xl border border-slate-800 p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[580px] flex flex-col justify-between">
        {/* Subtle Blueprint Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Campus Map Legend */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-4">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              Zone Status Indicators:
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              🟢 Safe (Normal)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              🟠 Warning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              🔴 Critical Alert
            </span>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            *Click on any building to view sensors, classrooms &amp; maintenance tickets
          </span>
        </div>

        {/* Blueprint Layout Area */}
        <div className="relative z-10 my-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Sports Ground & Athletics */}
          <div
            onClick={() => setSelectedBuildingId('bld-sports')}
            className={`md:col-span-8 p-4 rounded-2xl border cursor-pointer transition transform hover:scale-[1.01] ${getStatusBorder(
              buildings.find((b) => b.id === 'bld-sports')?.status || 'safe'
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="font-bold text-sm text-white">Playground &amp; Athletic Track</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                SPT-01 • Outdoor
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Football Ground, 200m Running Track, Basketball Courts &amp; Play Shed
            </p>
          </div>

          {/* Water Facilities & Overhead Tank */}
          <div
            onClick={() => setSelectedBuildingId('bld-water')}
            className={`md:col-span-4 p-4 rounded-2xl border cursor-pointer transition transform hover:scale-[1.01] ${getStatusBorder(
              buildings.find((b) => b.id === 'bld-water')?.status || 'safe'
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-sm text-white">Water Tank &amp; Pumps</span>
              </div>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-400">50,000L Reservoir &amp; Commercial RO Filter Plant</p>
          </div>

          {/* Main Administration Building */}
          <div
            onClick={() => setSelectedBuildingId('bld-main')}
            className={`md:col-span-6 p-5 rounded-2xl border cursor-pointer transition transform hover:scale-[1.01] ${getStatusBorder(
              buildings.find((b) => b.id === 'bld-main')?.status || 'safe'
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-sm text-white">Main Administration Building</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300">
                2 Floors • Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Principal Office, Administrative Desks, Server Hub, and Teachers Staff Room.
            </p>
          </div>

          {/* Central Electrical Substation */}
          <div
            onClick={() => setSelectedBuildingId('bld-electrical')}
            className={`md:col-span-6 p-5 rounded-2xl border cursor-pointer transition transform hover:scale-[1.01] ${getStatusBorder(
              buildings.find((b) => b.id === 'bld-electrical')?.status || 'warning'
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold text-sm text-amber-300">
                  Electrical Room &amp; Substation
                </span>
              </div>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400">
              Main HT Panel, Solar Hybrid Grid Inverters, 125kVA Backup Diesel Generator
            </p>
          </div>

          {/* Block A Classrooms (Junior Wing) */}
          <div
            onClick={() => setSelectedBuildingId('bld-block-a')}
            className={`md:col-span-4 p-5 rounded-2xl border cursor-pointer transition transform hover:scale-[1.01] ${getStatusBorder(
              buildings.find((b) => b.id === 'bld-block-a')?.status || 'warning'
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-bold text-sm text-white">Block A (Classrooms)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/50 text-amber-300">
                Warning in 103/204
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Rooms 101-104 (Floor 1), Rooms 201-204 (Floor 2), Interconnecting Corridors
            </p>
          </div>

          {/* Block B Classrooms (Senior Wing) + Washroom Complex */}
          <div
            onClick={() => setSelectedBuildingId('bld-block-b')}
            className={`md:col-span-4 p-5 rounded-2xl border cursor-pointer transition transform hover:scale-[1.01] ${getStatusBorder(
              buildings.find((b) => b.id === 'bld-block-b')?.status || 'safe'
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-sm text-white">Block B (Senior Wing)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Rooms 301-404
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Senior Secondary Classrooms, Ground Floor Washroom Complex (Leak Sensor Active)
            </p>
          </div>

          {/* Science & STEM Block (Laboratories) */}
          <div
            onClick={() => setSelectedBuildingId('bld-science')}
            className={`md:col-span-4 p-5 rounded-2xl border cursor-pointer transition transform hover:scale-[1.01] ${getStatusBorder(
              buildings.find((b) => b.id === 'bld-science')?.status || 'critical'
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold text-sm text-rose-300">
                  Science &amp; STEM Block
                </span>
              </div>
              <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
            </div>
            <p className="text-xs text-slate-400">
              Physics Lab, Chemistry Lab (Smoke Detected), Biology &amp; Computer Labs
            </p>
          </div>

          {/* Central Library */}
          <div
            onClick={() => setSelectedBuildingId('bld-library')}
            className={`md:col-span-4 p-4 rounded-2xl border cursor-pointer transition transform hover:scale-[1.01] ${getStatusBorder(
              buildings.find((b) => b.id === 'bld-library')?.status || 'safe'
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white">Central Library</span>
              <span className="text-[10px] font-mono text-emerald-400">AQI: 42 (Good)</span>
            </div>
            <p className="text-xs text-slate-400">Digital Archive &amp; Reading Room</p>
          </div>

          {/* Canteen & Dining Pavilion */}
          <div
            onClick={() => setSelectedBuildingId('bld-canteen')}
            className={`md:col-span-4 p-4 rounded-2xl border cursor-pointer transition transform hover:scale-[1.01] ${getStatusBorder(
              buildings.find((b) => b.id === 'bld-canteen')?.status || 'safe'
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white">Canteen &amp; Dining Hall</span>
              <span className="text-[10px] font-mono text-slate-300">Clean Food Safety</span>
            </div>
            <p className="text-xs text-slate-400">Student Kitchen &amp; Clean Drinking Water Station</p>
          </div>

          {/* School Main Entrance & Security Gate */}
          <div
            onClick={() => setSelectedBuildingId('bld-entrance')}
            className={`md:col-span-4 p-4 rounded-2xl border cursor-pointer transition transform hover:scale-[1.01] ${getStatusBorder(
              buildings.find((b) => b.id === 'bld-entrance')?.status || 'safe'
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white">School Entrance &amp; Gate</span>
              <span className="text-[10px] font-mono text-emerald-400">Barriers Normal</span>
            </div>
            <p className="text-xs text-slate-400">Main Gate, Security Post &amp; Visitor RFID Kiosk</p>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Campus Total Acreage: 18.5 Acres • Geo-Fenced IoT Mesh Active</span>
          <span className="text-blue-400 font-mono">GPS: 15.5057° N, 80.0499° E</span>
        </div>
      </div>

      {/* Drilldown Modal when a building is clicked */}
      <CampusLocationModal
        buildingId={selectedBuildingId}
        onClose={() => setSelectedBuildingId(null)}
      />
    </div>
  );
};
