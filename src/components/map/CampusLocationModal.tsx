import React from 'react';
import { X, MapPin, Activity, AlertTriangle, Cpu, Wrench, PlusCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';

interface CampusLocationModalProps {
  buildingId: string | null;
  onClose: () => void;
}

export const CampusLocationModal: React.FC<CampusLocationModalProps> = ({ buildingId, onClose }) => {
  const { buildings, sensors, problems, classrooms, setSelectedIssueId, setSelectedClassroomId, setActiveTab } = useApp();

  if (!buildingId) return null;

  const building = buildings.find((b) => b.id === buildingId);
  if (!building) return null;

  // Filter sensors located in this building
  const buildingSensors = sensors.filter(
    (s) =>
      s.buildingName.toLowerCase().includes(building.name.toLowerCase()) ||
      s.location.toLowerCase().includes(building.name.toLowerCase()) ||
      (building.id === 'bld-block-a' && s.location.includes('Block A')) ||
      (building.id === 'bld-block-b' && s.location.includes('Block B')) ||
      (building.id === 'bld-science' && (s.location.includes('Lab') || s.buildingName.includes('Science'))) ||
      (building.id === 'bld-electrical' && s.location.includes('Electrical')) ||
      (building.id === 'bld-water' && s.location.includes('Water'))
  );

  // Filter issues in this building
  const buildingIssues = problems.filter(
    (p) =>
      p.building.toLowerCase().includes(building.name.toLowerCase()) ||
      p.exactLocation.toLowerCase().includes(building.name.toLowerCase()) ||
      (building.id === 'bld-block-a' && p.building.includes('Block A')) ||
      (building.id === 'bld-block-b' && p.building.includes('Block B')) ||
      (building.id === 'bld-science' && p.building.includes('Science')) ||
      (building.id === 'bld-sports' && p.building.includes('Sports'))
  );

  // Classrooms in this building
  const buildingRooms = classrooms.filter((c) => c.buildingId === building.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{building.name}</h3>
                <StatusBadge status={building.status} size="sm" />
              </div>
              <p className="text-xs text-slate-300 mt-1">{building.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs text-slate-500">Floors</div>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {building.floors > 0 ? building.floors : 'Ground Level'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs text-slate-500">IoT Sensors Active</div>
              <div className="text-lg font-bold text-emerald-600 font-mono mt-0.5">
                {buildingSensors.length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs text-slate-500">Open Tickets</div>
              <div className="text-lg font-bold text-amber-600 font-mono mt-0.5">
                {buildingIssues.filter((i) => i.status !== 'RESOLVED').length}
              </div>
            </div>
          </div>

          {/* Rooms in this building if applicable */}
          {buildingRooms.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Classrooms &amp; Laboratories ({buildingRooms.length})</span>
                <span className="text-[11px] text-slate-400 font-normal">Click room for telemetry</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {buildingRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedClassroomId(room.id);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{room.roomNumber}</span>
                      <StatusBadge status={room.status} size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2 font-mono">
                      {room.temperature}°C • {room.smokeStatus} Smoke
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Sensors in this Building */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-600" />
              Live Telemetry &amp; Connected Sensors ({buildingSensors.length})
            </h4>
            {buildingSensors.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No direct sensors mapped to this node yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {buildingSensors.map((sensor) => (
                  <div
                    key={sensor.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                          {sensor.sensorCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[150px]">
                          {sensor.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{sensor.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        {sensor.currentValue}
                      </div>
                      <StatusBadge status={sensor.status} size="sm" className="mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Open Issues in this Building */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-600" />
              Issues Reported in this Location ({buildingIssues.length})
            </h4>
            {buildingIssues.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero open issues. All facilities in this location are functioning normally.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {buildingIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => {
                      setSelectedIssueId(issue.id);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {issue.issueId}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{issue.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{issue.exactLocation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={issue.status} size="sm" />
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-between items-center border-t border-slate-200">
            <span className="text-xs text-slate-500">Need maintenance in this zone?</span>
            <button
              onClick={() => {
                setActiveTab('report-problem');
                onClose();
              }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue at {building.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
