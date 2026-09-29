import React, { useState } from 'react';
import {
  GraduationCap,
  Thermometer,
  Flame,
  Zap,
  Droplets,
  Search,
  Filter,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { getClassroomImage } from '../../data/imageLibrary';
import { ClassroomDetailModal } from './ClassroomDetailModal';

export const ClassroomMonitoring: React.FC = () => {
  const {
    classrooms,
    selectedClassroomId,
    setSelectedClassroomId,
    setActiveTab,
  } = useApp();

  const [filterBlock, setFilterBlock] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredClassrooms = classrooms.filter((room) => {
    if (filterBlock !== 'all' && !room.buildingName.toLowerCase().includes(filterBlock.toLowerCase())) {
      return false;
    }
    if (filterStatus !== 'all' && room.status !== filterStatus) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        room.roomNumber.toLowerCase().includes(q) ||
        room.buildingName.toLowerCase().includes(q) ||
        (room.assignedTeacher && room.assignedTeacher.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Classrooms Infrastructure &amp; Environment
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {classrooms.length} Monitored Units
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time environmental telemetry, student occupancy, electrical load &amp; open work tickets per room.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('report-problem')}
          className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Classroom Problem</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search room (e.g. 101, Block A, teacher)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Block filter */}
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Blocks</option>
            <option value="Block A">Block A (Junior)</option>
            <option value="Block B">Block B (Senior)</option>
            <option value="Science">Science Block</option>
          </select>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {(['all', 'safe', 'warning', 'critical'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Classroom Cards Grid (Requirement 7) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredClassrooms.map((room) => {
          return (
            <div
              key={room.id}
              onClick={() => setSelectedClassroomId(room.id)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={getClassroomImage(room.roomNumber)}
                  alt={room.roomNumber}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.src = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/90 text-blue-700 flex items-center justify-center font-bold text-xs shadow-sm">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div className="absolute right-3 top-3">
                  <StatusBadge status={room.status} size="sm" />
                </div>
              </div>

              <div className="p-5">
                {/* Header: Title and Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {room.roomNumber}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {room.buildingName} • Floor {room.floor}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Occupancy */}
                <div className="mt-3 flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Students:
                  </span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {room.currentStudents} / {room.studentCapacity}
                  </span>
                </div>

                {/* Telemetry Matrix matching prompt specs (Requirement 7) */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-500" />
                      Temperature
                    </div>
                    <div className="font-bold text-slate-800 font-mono mt-0.5">
                      {room.temperature}°C
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-slate-400" />
                      Smoke
                    </div>
                    <div
                      className={`font-bold font-mono mt-0.5 ${
                        room.smokeStatus !== 'Normal' ? 'text-rose-600 font-extrabold' : 'text-slate-800'
                      }`}
                    >
                      {room.smokeStatus}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      Electrical
                    </div>
                    <div
                      className={`font-bold font-mono mt-0.5 ${
                        room.electricalStatus !== 'Normal' ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      {room.electricalStatus}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-500" />
                      Water Leakage
                    </div>
                    <div
                      className={`font-bold font-mono mt-0.5 ${
                        room.waterLeakageStatus !== 'None' ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {room.waterLeakageStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Open Issues:{' '}
                  <strong className={room.openIssuesCount > 0 ? 'text-amber-600 font-mono' : 'text-emerald-600 font-mono'}>
                    {room.openIssuesCount}
                  </strong>
                </span>

                <span className="text-blue-600 group-hover:translate-x-1 transition font-semibold flex items-center gap-0.5 text-[11px]">
                  Details
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Classroom Detail Modal */}
      <ClassroomDetailModal
        classroomId={selectedClassroomId}
        onClose={() => setSelectedClassroomId(null)}
      />
    </div>
  );
};
