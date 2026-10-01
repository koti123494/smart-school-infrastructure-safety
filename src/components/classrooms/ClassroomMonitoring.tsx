import React, { useState, useEffect } from 'react';
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
  Pencil,
  Trash2,
  X,
  Building,
  Layers,
  Image as ImageIcon,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { getClassroomImage } from '../../data/imageLibrary';
import { ClassroomDetailModal } from './ClassroomDetailModal';
import { Classroom, SafetyStatus } from '../../types';

const STORAGE_KEY = 'qis_classrooms';

interface RoomFormData {
  roomNumber: string;
  buildingName: string;
  floor: number;
  studentCapacity: number;
  type: string;
  imageUrl: string;
  status: SafetyStatus;
}

const DEFAULT_FORM: RoomFormData = {
  roomNumber: '',
  buildingName: 'Block A',
  floor: 1,
  studentCapacity: 45,
  type: 'Classroom',
  imageUrl: '',
  status: 'safe',
};

export const ClassroomMonitoring: React.FC = () => {
  const {
    classrooms: contextClassrooms,
    selectedClassroomId,
    setSelectedClassroomId,
    setActiveTab,
  } = useApp();

  // Local state for classrooms with localStorage persistence
  const [rooms, setRooms] = useState<Classroom[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load classrooms from localStorage', e);
    }
    return contextClassrooms;
  });

  // Filter, Search, and Sort state
  const [filterBlock, setFilterBlock] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortByCapacity, setSortByCapacity] = useState<'default' | 'asc' | 'desc'>('default');

  // Modal state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RoomFormData>(DEFAULT_FORM);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    } catch (e) {
      console.error('Failed to save classrooms to localStorage', e);
    }
  }, [rooms]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingRoomId(null);
    setFormData(DEFAULT_FORM);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (room: Classroom) => {
    setEditingRoomId(room.id);
    setFormData({
      roomNumber: room.roomNumber,
      buildingName: room.buildingName || 'Block A',
      floor: room.floor || 1,
      studentCapacity: room.studentCapacity || 45,
      type: room.type || 'Classroom',
      imageUrl: room.imageUrl || '',
      status: room.status || 'safe',
    });
    setIsModalOpen(true);
  };

  // Delete Room
  const handleDelete = (id: string, roomName: string) => {
    if (window.confirm(`Are you sure you want to delete ${roomName}? This action cannot be undone.`)) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
      showToast('Room Deleted Successfully');
    }
  };

  // Save Room (Add / Edit)
  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomNumber.trim()) {
      alert('Please enter a room number.');
      return;
    }

    if (formData.studentCapacity <= 0) {
      alert('Capacity must be greater than 0.');
      return;
    }

    if (editingRoomId) {
      // Edit existing room
      setRooms((prev) =>
        prev.map((r) =>
          r.id === editingRoomId
            ? {
                ...r,
                roomNumber: formData.roomNumber.trim(),
                buildingName: formData.buildingName,
                buildingId: formData.buildingName === 'Block A' ? 'bld-block-a' : formData.buildingName === 'Block B' ? 'bld-block-b' : 'bld-block-c',
                floor: Number(formData.floor),
                studentCapacity: Number(formData.studentCapacity),
                status: formData.status,
                type: formData.type,
                imageUrl: formData.imageUrl.trim() || undefined,
              }
            : r
        )
      );
      showToast('Room Updated Successfully');
    } else {
      // Add new room
      const newRoom: Classroom = {
        id: `rm-${Date.now()}`,
        roomNumber: formData.roomNumber.trim(),
        buildingId: formData.buildingName === 'Block A' ? 'bld-block-a' : formData.buildingName === 'Block B' ? 'bld-block-b' : 'bld-block-c',
        buildingName: formData.buildingName,
        floor: Number(formData.floor),
        studentCapacity: Number(formData.studentCapacity),
        currentStudents: Math.floor(Number(formData.studentCapacity) * 0.85),
        status: formData.status,
        temperature: formData.status === 'critical' ? 38 : formData.status === 'warning' ? 31 : 26,
        smokeStatus: formData.status === 'critical' ? 'Alert' : 'Normal',
        electricalStatus: formData.status === 'critical' ? 'Overload' : formData.status === 'warning' ? 'Warning' : 'Normal',
        waterLeakageStatus: 'None',
        openIssuesCount: formData.status === 'critical' ? 2 : formData.status === 'warning' ? 1 : 0,
        lastInspectionDate: new Date().toISOString().split('T')[0],
        assignedTeacher: 'Faculty In-Charge',
        sensorIds: [`TMP-${formData.roomNumber}`, `SMK-${formData.roomNumber}`],
        type: formData.type,
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      setRooms((prev) => [newRoom, ...prev]);
      showToast('Room Added Successfully');
    }

    setIsModalOpen(false);
  };

  // Filtered & Sorted Classrooms
  const filteredClassrooms = rooms
    .filter((room) => {
      // Block filter
      if (filterBlock !== 'all' && !room.buildingName.toLowerCase().includes(filterBlock.toLowerCase())) {
        return false;
      }
      // Status filter
      if (filterStatus !== 'all' && room.status !== filterStatus) {
        return false;
      }
      // Real-time search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          room.roomNumber.toLowerCase().includes(q) ||
          room.buildingName.toLowerCase().includes(q) ||
          (room.type && room.type.toLowerCase().includes(q)) ||
          (room.assignedTeacher && room.assignedTeacher.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortByCapacity === 'asc') return a.studentCapacity - b.studentCapacity;
      if (sortByCapacity === 'desc') return b.studentCapacity - a.studentCapacity;
      return 0;
    });

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-sm shadow-xl shadow-emerald-950/20 border border-emerald-400 slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Classrooms Infrastructure &amp; Environment
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {rooms.length} Units Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time environmental telemetry, student occupancy, electrical load &amp; open work tickets per room.
          </p>
        </div>

        {/* Action Buttons: Add New Room & Report Classroom Problem */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            id="add-new-room-btn"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Room</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report-problem')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Classroom Problem</span>
          </button>
        </div>
      </div>

      {/* Filter, Search, and Sort Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="classroom-search-input"
            placeholder="Search room (e.g. 101, Block A, Lab)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Block Filter */}
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Blocks</option>
            <option value="Block A">Block A</option>
            <option value="Block B">Block B</option>
            <option value="Block C">Block C</option>
          </select>

          {/* Status Buttons: All, Safe, Warning, Critical */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('safe')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                filterStatus === 'safe'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Safe
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('warning')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                filterStatus === 'warning'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Warning
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('critical')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                filterStatus === 'critical'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Critical
            </button>
          </div>

          {/* Sort By Capacity */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortByCapacity}
              onChange={(e) => setSortByCapacity(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="default">Sort: Default</option>
              <option value="asc">Capacity: Low to High</option>
              <option value="desc">Capacity: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classroom Cards Grid */}
      {filteredClassrooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Classrooms Match Your Filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, block selection, or status filters, or add a new room.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterBlock('all');
              setFilterStatus('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl hover:bg-blue-100 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {filteredClassrooms.map((room) => {
            const isAlertStatus = room.status === 'critical' || room.status === 'warning';
            return (
              <div
                key={room.id}
                onClick={() => setSelectedClassroomId(room.id)}
                className={`group bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl flex flex-col justify-between relative cursor-pointer border ${
                  isAlertStatus
                    ? 'animate-pulseGlow border-rose-500'
                    : 'border-slate-200 hover:border-emerald-400'
                }`}
              >
                {/* Image & Header Overlay */}
                <div className="relative h-36 overflow-hidden bg-slate-100">
                  <img
                    src={room.imageUrl || getClassroomImage(room.roomNumber)}
                    alt={room.roomNumber}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(event) => {
                      event.currentTarget.src =
                        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/20 to-transparent" />

                  {/* Top Left: Icon & Room Type */}
                  <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-white/95 text-blue-700 flex items-center justify-center font-bold text-xs shadow-sm">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    {room.type && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                        {room.type}
                      </span>
                    )}
                  </div>

                  {/* Top Right: Status Badge AND Edit / Delete Action Buttons */}
                  <div className="absolute right-3 top-3 flex items-center gap-1.5">
                    <StatusBadge status={room.status} size="sm" />

                    {/* Edit Button (Pencil Icon) */}
                    <button
                      type="button"
                      title="Edit Room"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(room);
                      }}
                      className="w-7 h-7 rounded-lg bg-white/95 hover:bg-blue-600 text-slate-700 hover:text-white flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button (Trash Icon) */}
                    <button
                      type="button"
                      title="Delete Room"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(room.id, room.roomNumber);
                      }}
                      className="w-7 h-7 rounded-lg bg-white/95 hover:bg-rose-600 text-slate-700 hover:text-white flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  {/* Title and Block Info */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                      {room.roomNumber}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {room.buildingName} • Floor {room.floor}
                    </p>
                  </div>

                  {/* Occupancy Indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Capacity:
                    </span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {room.currentStudents} / {room.studentCapacity}
                    </span>
                  </div>

                  {/* Telemetry Matrix */}
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
                  </div>

                  {/* Footer link */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                    <span>Inspect Room Telemetry</span>
                    <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Classroom Detail Inspection Modal */}
      {selectedClassroomId && (
        <ClassroomDetailModal
          classroomId={selectedClassroomId}
          onClose={() => setSelectedClassroomId(null)}
        />
      )}

      {/* Add / Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-300 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold">
                  {editingRoomId ? 'Edit Classroom / Unit' : 'Add New Classroom / Unit'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              {/* Room Number & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Room Number / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classroom 105"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 45"
                    value={formData.studentCapacity}
                    onChange={(e) => setFormData({ ...formData, studentCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Block & Floor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Block *
                  </label>
                  <select
                    value={formData.buildingName}
                    onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Floor *
                  </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value={0}>Ground Floor</option>
                    <option value={1}>1st Floor</option>
                    <option value={2}>2nd Floor</option>
                  </select>
                </div>
              </div>

              {/* Type & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Lab">Lab</option>
                    <option value="Library">Library</option>
                    <option value="Staff Room">Staff Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Safety Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SafetyStatus })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="safe">Safe (Nominal)</option>
                    <option value="warning">Warning (Maintenance Needed)</option>
                    <option value="critical">Critical (Immediate Hazard)</option>
                  </select>
                </div>
              </div>

              {/* Custom Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Leave blank to use default QIS high-resolution campus photo.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-room-modal-btn"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition active:scale-95"
                >
                  {editingRoomId ? 'Update Room' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomMonitoring;
