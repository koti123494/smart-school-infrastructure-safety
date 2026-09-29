import React, { useState, useRef, useMemo } from 'react';
import {
  MapPin,
  Layers,
  Info,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Droplets,
  Zap,
  Building2,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Siren,
  AlertTriangle,
  X,
  ChevronRight,
  GraduationCap,
  FlaskConical,
  BookOpen,
  UtensilsCrossed,
  Trees,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  Activity,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Building, SafetyStatus, ProblemReport, SafetyAlert, EmergencyIncident } from '../../types';
import { CampusLocationModal } from './CampusLocationModal';

// Static spatial metadata for rooms, labs, exits, and safety points
interface CampusRoomSpot {
  id: string;
  name: string;
  code: string;
  type: 'classroom' | 'lab' | 'library' | 'canteen' | 'utility' | 'sports';
  buildingId: string;
  buildingName: string;
  floor: number;
  x: number;
  y: number;
  w: number;
  h: number;
  status: 'safe' | 'warning' | 'critical';
  details: string;
}

interface SafetyPoint {
  id: string;
  type: 'exit' | 'fire' | 'electrical' | 'water' | 'muster';
  name: string;
  buildingId: string;
  location: string;
  x: number;
  y: number;
  details: string;
}

const STATIC_ROOMS: CampusRoomSpot[] = [
  // Block A Rooms
  { id: 'rm-101', name: 'Classroom 101', code: '101', type: 'classroom', buildingId: 'bld-block-a', buildingName: 'Block A', floor: 1, x: 45, y: 260, w: 65, h: 55, status: 'safe', details: 'Junior Wing • Grade 9-A • 42 Students' },
  { id: 'rm-102', name: 'Classroom 102', code: '102', type: 'classroom', buildingId: 'bld-block-a', buildingName: 'Block A', floor: 1, x: 120, y: 260, w: 65, h: 55, status: 'safe', details: 'Junior Wing • Grade 9-B • 40 Students' },
  { id: 'rm-103', name: 'Classroom 103', code: '103', type: 'classroom', buildingId: 'bld-block-a', buildingName: 'Block A', floor: 1, x: 195, y: 260, w: 65, h: 55, status: 'warning', details: 'Ceiling Fan #2 Malfunction • Grade 10-A' },
  { id: 'rm-104', name: 'Classroom 104', code: '104', type: 'classroom', buildingId: 'bld-block-a', buildingName: 'Block A', floor: 1, x: 270, y: 260, w: 65, h: 55, status: 'safe', details: 'Junior Wing • Grade 10-B • Smart Board Active' },
  { id: 'rm-201', name: 'Classrooms 201-204 (Floor 2)', code: 'FL2-A', type: 'classroom', buildingId: 'bld-block-a', buildingName: 'Block A', floor: 2, x: 45, y: 325, w: 290, h: 45, status: 'safe', details: 'Senior Wing Upper Deck • Normal Environment' },

  // Block B Rooms
  { id: 'rm-301', name: 'Classroom 301', code: '301', type: 'classroom', buildingId: 'bld-block-b', buildingName: 'Block B', floor: 1, x: 395, y: 260, w: 70, h: 55, status: 'safe', details: 'Grade 11-Science • Smart Panel' },
  { id: 'rm-302', name: 'Classroom 302', code: '302', type: 'classroom', buildingId: 'bld-block-b', buildingName: 'Block B', floor: 1, x: 475, y: 260, w: 70, h: 55, status: 'safe', details: 'Grade 11-Commerce • 38 Students' },
  { id: 'rm-303', name: 'Classroom 303', code: '303', type: 'classroom', buildingId: 'bld-block-b', buildingName: 'Block B', floor: 1, x: 555, y: 260, w: 70, h: 55, status: 'safe', details: 'Grade 12-Arts • 35 Students' },
  { id: 'rm-304', name: 'Classroom 304', code: '304', type: 'classroom', buildingId: 'bld-block-b', buildingName: 'Block B', floor: 1, x: 635, y: 260, w: 70, h: 55, status: 'safe', details: 'Grade 12-Science • 44 Students' },
  { id: 'rm-wash-b', name: 'Washroom Complex (Block B)', code: 'WSH-B', type: 'utility', buildingId: 'bld-block-b', buildingName: 'Block B', floor: 1, x: 475, y: 330, w: 150, h: 45, status: 'warning', details: 'Drainage & Moisture Sensor Active' },

  // Science Labs
  { id: 'lab-physics', name: 'Physics Laboratory', code: 'LAB-PHY', type: 'lab', buildingId: 'bld-science', buildingName: 'Science Block', floor: 1, x: 45, y: 470, w: 135, h: 60, status: 'warning', details: 'Apparatus Bay • Circuit Breaker Monitored' },
  { id: 'lab-chem', name: 'Chemistry Lab 2', code: 'LAB-CHM', type: 'lab', buildingId: 'bld-science', buildingName: 'Science Block', floor: 1, x: 195, y: 470, w: 140, h: 60, status: 'critical', details: 'Ionization Smoke Detector Active • Fume Hoods' },
  { id: 'lab-bio', name: 'Biology & Biotech Lab', code: 'LAB-BIO', type: 'lab', buildingId: 'bld-science', buildingName: 'Science Block', floor: 2, x: 45, y: 540, w: 135, h: 55, status: 'safe', details: 'Microscopy Bay • Specimen Cold Storage' },
  { id: 'lab-cs', name: 'Computer Science Lab 1', code: 'LAB-CS', type: 'lab', buildingId: 'bld-science', buildingName: 'Science Block', floor: 2, x: 195, y: 540, w: 140, h: 55, status: 'safe', details: '45 Thin-Client Workstations • UPS Backed' },

  // Library & Canteen
  { id: 'rm-lib', name: 'Central Reading Hall & Stacks', code: 'LIB-01', type: 'library', buildingId: 'bld-library', buildingName: 'Central Library', floor: 1, x: 395, y: 470, w: 180, h: 125, status: 'safe', details: '15,000 Volumes • Digital Media Kiosks' },
  { id: 'rm-can', name: 'Dining Hall & Service Kitchen', code: 'CAN-01', type: 'canteen', buildingId: 'bld-canteen', buildingName: 'Canteen', floor: 1, x: 625, y: 470, w: 150, h: 125, status: 'safe', details: 'Hygienic Food Counter • Pure Water Refill' },

  // Sports & Utilities
  { id: 'rm-sports', name: 'Athletic Track & Sports Grounds', code: 'SPT-01', type: 'sports', buildingId: 'bld-sports', buildingName: 'Sports Ground', floor: 0, x: 45, y: 55, w: 290, h: 110, status: 'safe', details: '200m Track, Football Field & Courts' },
  { id: 'rm-elec-sub', name: 'HT Busbar & Substation Panel', code: 'SUB-01', type: 'utility', buildingId: 'bld-electrical', buildingName: 'Substation', floor: 1, x: 765, y: 260, w: 190, h: 65, status: 'warning', details: '34.8A Overload Detected • Solar Inverter' },
  { id: 'rm-water-res', name: 'Overhead Reservoir & RO Plant', code: 'WTR-01', type: 'utility', buildingId: 'bld-water', buildingName: 'Water Plant', floor: 1, x: 765, y: 65, w: 190, h: 70, status: 'safe', details: '50,000L Reservoir • Pressure 3.2 Bar' },
  { id: 'rm-gate-sec', name: 'Security Post & Visitor RFID', code: 'GATE-01', type: 'utility', buildingId: 'bld-entrance', buildingName: 'Main Entrance', floor: 1, x: 825, y: 470, w: 130, h: 125, status: 'safe', details: 'Boom Barriers • Access Control Kiosk' },
];

const SAFETY_POINTS: SafetyPoint[] = [
  { id: 'exit-north', type: 'exit', name: 'North Emergency Exit', buildingId: 'bld-sports', location: 'Behind Athletic Field Gate 2', x: 180, y: 25, details: 'Wide dual-leaf panic gate leading to North Access Road' },
  { id: 'exit-west', type: 'exit', name: 'West Fire Exit (Block A)', buildingId: 'bld-block-a', location: 'Block A Western Staircase', x: 25, y: 310, details: 'Fire-rated stairwell direct to open garden assembly' },
  { id: 'exit-east', type: 'exit', name: 'East Evacuation Exit (Block B)', buildingId: 'bld-block-b', location: 'Block B Eastern Hallway', x: 725, y: 310, details: 'Push-bar emergency door leading to eastern boundary' },
  { id: 'exit-chem', type: 'exit', name: 'Emergency Lab Exit & Shower', buildingId: 'bld-science', location: 'Chemistry Lab External Door', x: 345, y: 500, details: 'Quick-release blast door with chemical neutralization shower' },
  { id: 'exit-south', type: 'exit', name: 'South Main Campus Gate', buildingId: 'bld-entrance', location: 'Main Highway Entrance', x: 890, y: 615, details: 'Primary vehicle and emergency brigade ingress point' },

  { id: 'fire-p1', type: 'fire', name: 'Fire Hydrant & Foam Station A1', buildingId: 'bld-block-a', location: 'Block A Ground Floor Corridor', x: 180, y: 235, details: 'Class A/B Foam Extinguisher + 30m Canvas Hose Reel' },
  { id: 'fire-p2', type: 'fire', name: 'Fire Hose Station B1', buildingId: 'bld-block-b', location: 'Block B Central Foyer', x: 540, y: 235, details: 'Automatic pressure booster line + 5kg CO2 Extinguisher' },
  { id: 'fire-p3', type: 'fire', name: 'Science Block Chemical Suppression', buildingId: 'bld-science', location: 'Between Physics & Chemistry Labs', x: 180, y: 445, details: 'Dry chemical powder extinguisher & fire containment blanket' },
  { id: 'fire-p4', type: 'fire', name: 'Substation CO2 Gas Suppression System', buildingId: 'bld-electrical', location: 'HT Panel Vault', x: 860, y: 235, details: 'Automatic Inergen/CO2 flooding system for high-voltage arcs' },
  { id: 'fire-p5', type: 'fire', name: 'Canteen Kitchen Fire Station', buildingId: 'bld-canteen', location: 'Cooking & Gas Storage Area', x: 700, y: 445, details: 'Wet chemical fire extinguisher for cooking oils & grease' },

  { id: 'util-elec', type: 'electrical', name: 'Substation Transformer Feeder', buildingId: 'bld-electrical', location: 'Substation Feeder 2 Panel', x: 910, y: 290, details: 'High voltage 415V distribution board' },
  { id: 'util-wtr', type: 'water', name: 'Central Water Header Valve', buildingId: 'bld-water', location: 'Water Plant Isolation Manifold', x: 910, y: 100, details: 'Main campus water supply shutoff valve' },
  { id: 'muster-1', type: 'muster', name: 'Emergency Muster Point Alpha', buildingId: 'bld-sports', location: 'Athletic Field Center', x: 180, y: 105, details: 'Primary campus open-sky assembly zone for all students' },
  { id: 'muster-2', type: 'muster', name: 'Emergency Muster Point Bravo', buildingId: 'bld-entrance', location: 'South Courtyard', x: 890, y: 535, details: 'Secondary muster zone for Admin & Canteen staff' },
];

export const CampusMap: React.FC = () => {
  const {
    currentSchool,
    buildings,
    classrooms,
    problems,
    alerts,
    emergencies,
    setSelectedBuildingId,
    selectedBuildingId,
    setSelectedIssueId,
    setSelectedClassroomId,
    setActiveTab,
    selectForAiAnalysis,
    theme,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayerFilter, setActiveLayerFilter] = useState<'all' | 'buildings' | 'rooms' | 'problems' | 'alerts' | 'safety'>('all');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Selected item inspector state
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'building' | 'room' | 'problem' | 'alert' | 'emergency' | 'safety_point';
    data: any;
  } | null>(null);

  // SVG canvas container ref
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Pan / Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary button
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedEntity(null);
  };

  // Search suggestions
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    const matches: Array<{
      id: string;
      label: string;
      category: string;
      x: number;
      y: number;
      entity: { type: 'building' | 'room' | 'problem' | 'alert' | 'emergency'; data: any };
    }> = [];

    // Search buildings
    buildings.forEach((b) => {
      if (b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)) {
        matches.push({
          id: b.id,
          label: b.name,
          category: 'Building',
          x: (b.coordinates.x / 100) * 1000,
          y: (b.coordinates.y / 100) * 680,
          entity: { type: 'building', data: b },
        });
      }
    });

    // Search rooms & labs
    STATIC_ROOMS.forEach((r) => {
      if (r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)) {
        matches.push({
          id: r.id,
          label: `${r.name} (${r.buildingName})`,
          category: r.type === 'lab' ? 'Laboratory' : r.type === 'library' ? 'Library' : 'Classroom',
          x: r.x + r.w / 2,
          y: r.y + r.h / 2,
          entity: { type: 'room', data: r },
        });
      }
    });

    // Search problems
    problems.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.exactLocation.toLowerCase().includes(q) || p.issueId.toLowerCase().includes(q)) {
        matches.push({
          id: p.id,
          label: `Problem: ${p.title} (${p.exactLocation})`,
          category: 'Problem Issue',
          x: 200,
          y: 300,
          entity: { type: 'problem', data: p },
        });
      }
    });

    // Search alerts
    alerts.forEach((a) => {
      if (a.title.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)) {
        matches.push({
          id: a.id,
          label: `Alert: ${a.title} (${a.location})`,
          category: 'Safety Alert',
          x: 250,
          y: 490,
          entity: { type: 'alert', data: a },
        });
      }
    });

    return matches.slice(0, 6);
  }, [searchQuery, buildings, problems, alerts]);

  const handleSelectSearchResult = (result: (typeof searchResults)[0]) => {
    setSelectedEntity(result.entity);
    setSearchQuery('');
    // Center pan near the target
    setPan({
      x: 500 - result.x * zoom,
      y: 340 - result.y * zoom,
    });
  };

  // Helper to get active problem markers positioned near buildings/rooms
  const problemMarkers = useMemo(() => {
    return problems.map((p, idx) => {
      let x = 240;
      let y = 290;
      const loc = (p.exactLocation + p.building).toLowerCase();

      if (loc.includes('103') || loc.includes('fan')) {
        x = 225;
        y = 285;
      } else if (loc.includes('physics') || loc.includes('spark') || loc.includes('wire')) {
        x = 110;
        y = 500;
      } else if (loc.includes('block b') || loc.includes('leak') || loc.includes('corridor')) {
        x = 550;
        y = 350;
      } else if (loc.includes('sports') || loc.includes('playground')) {
        x = 190;
        y = 100;
      } else if (loc.includes('chem') || loc.includes('science')) {
        x = 260;
        y = 500;
      } else {
        x = 420 + (idx * 40) % 200;
        y = 100 + (idx * 30) % 80;
      }

      return { ...p, mapX: x, mapY: y };
    });
  }, [problems]);

  // Helper to get alert markers positioned accurately
  const alertMarkers = useMemo(() => {
    return alerts.map((a, idx) => {
      let x = 260;
      let y = 500;
      const loc = (a.location + a.title).toLowerCase();

      if (loc.includes('smoke') || loc.includes('chem') || loc.includes('lab')) {
        x = 265;
        y = 500;
      } else if (loc.includes('substation') || loc.includes('electric') || loc.includes('feeder')) {
        x = 830;
        y = 295;
      } else if (loc.includes('water') || loc.includes('leak')) {
        x = 550;
        y = 350;
      } else {
        x = 500 + (idx * 50) % 150;
        y = 120 + (idx * 40) % 100;
      }

      return { ...a, mapX: x, mapY: y };
    });
  }, [alerts]);

  // Helper to get emergency markers positioned accurately
  const emergencyMarkers = useMemo(() => {
    return emergencies
      .filter((e) => e.status !== 'Resolved' && e.status !== 'Verified')
      .map((e) => {
        let x = 270;
        let y = 510;
        const loc = (e.location + e.title + e.type).toLowerCase();

        if (loc.includes('chem') || loc.includes('fire') || loc.includes('smoke')) {
          x = 260;
          y = 500;
        } else if (loc.includes('substation') || loc.includes('arc') || loc.includes('electric')) {
          x = 850;
          y = 295;
        } else if (loc.includes('water') || loc.includes('burst')) {
          x = 530;
          y = 345;
        } else if (loc.includes('sports') || loc.includes('medical')) {
          x = 180;
          y = 110;
        }

        return { ...e, mapX: x, mapY: y };
      });
  }, [emergencies]);

  const isDarkMode = theme === 'dark';

  return (
    <div className="space-y-6">
      {/* Top Header Card with Interactive Search & Layer Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Interactive School Campus Map
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Live Spatial Blueprint
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Geospatial monitoring of {currentSchool.name}. Visualizes classrooms, science laboratories, emergency exits, fire points, real-time safety alerts, and open maintenance tickets.
            </p>
          </div>

          {/* Search Location Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search room, lab, or hazard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {/* Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full p-2.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{result.label}</div>
                      <div className="text-[10px] text-slate-400">{result.category}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Layer Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-600 dark:text-slate-300">Map Layers:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Layers' },
              { id: 'buildings', label: 'Buildings & Blocks' },
              { id: 'rooms', label: 'Classrooms & Labs' },
              { id: 'problems', label: `Problems (${problems.length})` },
              { id: 'alerts', label: `Safety Alerts (${alerts.length})` },
              { id: 'safety', label: 'Exits & Fire Safety' },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayerFilter(layer.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  activeLayerFilter === layer.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas Container */}
      <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl bg-slate-950 min-h-[620px] flex flex-col justify-between select-none">
        {/* Floating Zoom & Canvas Controls */}
        <div className="absolute top-4 right-4 z-30 flex flex-col items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-lg p-1 space-y-1">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Reset View (100%)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Compass / Orientation Badge */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl px-3 py-1.5 text-xs text-slate-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span className="font-bold text-white">N</span>
          <span className="text-[11px] text-slate-400">Orientation</span>
        </div>

        {/* Interactive SVG Surface */}
        <div
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`w-full h-full min-h-[580px] overflow-hidden flex items-center justify-center ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <svg
            viewBox="0 0 1000 680"
            className="w-full h-full max-h-[660px] transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />
              </pattern>
              <linearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#022c22" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Background Grid */}
            <rect width="1000" height="680" fill="#020617" />
            <rect width="1000" height="680" fill="url(#grid)" />

            {/* Evacuation Walkway Vectors (Dashed Paths) */}
            <g stroke="#334155" strokeWidth="12" strokeLinecap="round" opacity="0.4">
              {/* Central Avenue */}
              <line x1="360" y1="40" x2="360" y2="620" />
              <line x1="735" y1="40" x2="735" y2="620" />
              <line x1="40" y1="205" x2="960" y2="205" />
              <line x1="40" y1="415" x2="960" y2="415" />
            </g>

            {/* 1. BUILDINGS & BLOCKS */}
            {(activeLayerFilter === 'all' || activeLayerFilter === 'buildings') && (
              <g id="buildings-layer">
                {/* Sports Ground & Athletics */}
                <g
                  onClick={() => setSelectedEntity({ type: 'building', data: buildings.find((b) => b.id === 'bld-sports') || buildings[0] })}
                  className="cursor-pointer group"
                >
                  <rect x="30" y="30" width="320" height="160" rx="20" fill="url(#grassGrad)" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
                  {/* Running Track Oval */}
                  <ellipse cx="190" cy="110" rx="120" ry="55" fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.4" />
                  <ellipse cx="190" cy="110" rx="80" ry="35" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" />
                  <text x="50" y="55" fill="#34d399" fontSize="13" fontWeight="bold">
                    🏃 Sports Ground &amp; 200m Track
                  </text>
                  <text x="50" y="72" fill="#94a3b8" fontSize="10">
                    Football, Volleyball, Athletics Field
                  </text>
                </g>

                {/* Main Administration Building */}
                <g
                  onClick={() => setSelectedEntity({ type: 'building', data: buildings.find((b) => b.id === 'bld-main') || buildings[0] })}
                  className="cursor-pointer group"
                >
                  <rect x="380" y="30" width="340" height="160" rx="18" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                  <text x="400" y="55" fill="#60a5fa" fontSize="13" fontWeight="bold">
                    🏛️ Main Administration Building
                  </text>
                  <text x="400" y="72" fill="#94a3b8" fontSize="10">
                    Principal Office, Server Hub &amp; Staff Lounges
                  </text>
                </g>

                {/* Water Treatment & Overhead Reservoir */}
                <g
                  onClick={() => setSelectedEntity({ type: 'building', data: buildings.find((b) => b.id === 'bld-water') || buildings[0] })}
                  className="cursor-pointer group"
                >
                  <rect x="750" y="30" width="220" height="160" rx="18" fill="#0c4a6e" fillOpacity="0.4" stroke="#0ea5e9" strokeWidth="2" />
                  <text x="770" y="55" fill="#38bdf8" fontSize="13" fontWeight="bold">
                    💧 Water Tank &amp; RO Plant
                  </text>
                  <text x="770" y="72" fill="#94a3b8" fontSize="10">
                    50kL Reservoir • Booster Pumps
                  </text>
                </g>

                {/* Block A (Junior Wing) */}
                <g
                  onClick={() => setSelectedEntity({ type: 'building', data: buildings.find((b) => b.id === 'bld-block-a') || buildings[0] })}
                  className="cursor-pointer group"
                >
                  <rect x="30" y="220" width="320" height="180" rx="18" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                  <text x="50" y="245" fill="#fbbf24" fontSize="13" fontWeight="bold">
                    🏫 Block A (Junior Wing)
                  </text>
                  <text x="50" y="258" fill="#94a3b8" fontSize="9">
                    Classrooms 101-104 (Floor 1) • 201-204 (Floor 2)
                  </text>
                </g>

                {/* Block B (Senior Wing) */}
                <g
                  onClick={() => setSelectedEntity({ type: 'building', data: buildings.find((b) => b.id === 'bld-block-b') || buildings[0] })}
                  className="cursor-pointer group"
                >
                  <rect x="380" y="220" width="340" height="180" rx="18" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                  <text x="400" y="245" fill="#60a5fa" fontSize="13" fontWeight="bold">
                    🏫 Block B (Senior Wing)
                  </text>
                  <text x="400" y="258" fill="#94a3b8" fontSize="9">
                    Classrooms 301-304 • Washroom Complex
                  </text>
                </g>

                {/* Central Electrical Substation */}
                <g
                  onClick={() => setSelectedEntity({ type: 'building', data: buildings.find((b) => b.id === 'bld-electrical') || buildings[0] })}
                  className="cursor-pointer group"
                >
                  <rect x="750" y="220" width="220" height="180" rx="18" fill="#451a03" fillOpacity="0.4" stroke="#f59e0b" strokeWidth="2" />
                  <text x="770" y="245" fill="#fcd34d" fontSize="13" fontWeight="bold">
                    ⚡ Central Substation &amp; Gen
                  </text>
                  <text x="770" y="258" fill="#94a3b8" fontSize="9">
                    Main HT Panel • 125kVA Backup Gen
                  </text>
                </g>

                {/* Science & STEM Laboratories Block */}
                <g
                  onClick={() => setSelectedEntity({ type: 'building', data: buildings.find((b) => b.id === 'bld-science') || buildings[0] })}
                  className="cursor-pointer group"
                >
                  <rect x="30" y="430" width="320" height="180" rx="18" fill="#4c0519" fillOpacity="0.4" stroke="#f43f5e" strokeWidth="2" />
                  <text x="50" y="455" fill="#fda4af" fontSize="13" fontWeight="bold">
                    🔬 Science &amp; STEM Block
                  </text>
                  <text x="50" y="468" fill="#94a3b8" fontSize="9">
                    Physics, Chemistry 2, Biology, CS Labs
                  </text>
                </g>

                {/* Central Library */}
                <g
                  onClick={() => setSelectedEntity({ type: 'building', data: buildings.find((b) => b.id === 'bld-library') || buildings[0] })}
                  className="cursor-pointer group"
                >
                  <rect x="380" y="430" width="210" height="180" rx="18" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                  <text x="400" y="455" fill="#6ee7b7" fontSize="13" fontWeight="bold">
                    📚 Central Library
                  </text>
                  <text x="400" y="468" fill="#94a3b8" fontSize="9">
                    Digital Media Archive &amp; Reading Room
                  </text>
                </g>

                {/* Canteen & Dining Pavilion */}
                <g
                  onClick={() => setSelectedEntity({ type: 'building', data: buildings.find((b) => b.id === 'bld-canteen') || buildings[0] })}
                  className="cursor-pointer group"
                >
                  <rect x="610" y="430" width="180" height="180" rx="18" fill="#0f172a" stroke="#f97316" strokeWidth="2" />
                  <text x="625" y="455" fill="#fdba74" fontSize="13" fontWeight="bold">
                    🍽️ Canteen &amp; Dining
                  </text>
                  <text x="625" y="468" fill="#94a3b8" fontSize="9">
                    Kitchen &amp; Clean Water Kiosk
                  </text>
                </g>

                {/* School Main Entrance & Security Gate */}
                <g
                  onClick={() => setSelectedEntity({ type: 'building', data: buildings.find((b) => b.id === 'bld-entrance') || buildings[0] })}
                  className="cursor-pointer group"
                >
                  <rect x="810" y="430" width="160" height="180" rx="18" fill="#0f172a" stroke="#8b5cf6" strokeWidth="2" />
                  <text x="825" y="455" fill="#c4b5fd" fontSize="13" fontWeight="bold">
                    🛡️ Main Gate
                  </text>
                  <text x="825" y="468" fill="#94a3b8" fontSize="9">
                    Security Post &amp; RFID RFID
                  </text>
                </g>
              </g>
            )}

            {/* 2. CLASSROOMS & ROOM CELLS */}
            {(activeLayerFilter === 'all' || activeLayerFilter === 'rooms') && (
              <g id="rooms-layer">
                {STATIC_ROOMS.map((room) => {
                  const isSelected = selectedEntity?.type === 'room' && selectedEntity?.data.id === room.id;
                  const strokeColor =
                    room.status === 'critical' ? '#f43f5e' : room.status === 'warning' ? '#f59e0b' : '#334155';

                  return (
                    <g
                      key={room.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntity({ type: 'room', data: room });
                      }}
                      className="cursor-pointer group transition-all"
                    >
                      <rect
                        x={room.x}
                        y={room.y}
                        width={room.w}
                        height={room.h}
                        rx="10"
                        fill={isSelected ? '#1e3a8a' : '#1e293b'}
                        stroke={isSelected ? '#60a5fa' : strokeColor}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        className="transition-colors group-hover:fill-slate-700"
                      />
                      <text
                        x={room.x + room.w / 2}
                        y={room.y + room.h / 2 - 2}
                        fill="#f8fafc"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {room.code}
                      </text>
                      <text
                        x={room.x + room.w / 2}
                        y={room.y + room.h / 2 + 12}
                        fill="#94a3b8"
                        fontSize="8"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {room.type}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* 3. SAFETY POINTS (Exits, Fire Hydrants, Utilities, Muster) */}
            {(activeLayerFilter === 'all' || activeLayerFilter === 'safety') && (
              <g id="safety-layer">
                {SAFETY_POINTS.map((pt) => {
                  const isExit = pt.type === 'exit';
                  const isFire = pt.type === 'fire';
                  const isMuster = pt.type === 'muster';

                  return (
                    <g
                      key={pt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntity({ type: 'safety_point', data: pt });
                      }}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill={isExit ? '#065f46' : isFire ? '#881337' : isMuster ? '#1e3a8a' : '#78350f'}
                        stroke={isExit ? '#10b981' : isFire ? '#f43f5e' : isMuster ? '#60a5fa' : '#f59e0b'}
                        strokeWidth="2"
                      />
                      <text
                        x={pt.x}
                        y={pt.y + 4}
                        fontSize="11"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontWeight="bold"
                      >
                        {isExit ? '🚪' : isFire ? '🧯' : isMuster ? '⛳' : '⚡'}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* 4. ACTIVE PROBLEM MARKERS */}
            {(activeLayerFilter === 'all' || activeLayerFilter === 'problems') && (
              <g id="problems-layer">
                {problemMarkers.map((prob) => (
                  <g
                    key={prob.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity({ type: 'problem', data: prob });
                    }}
                    className="cursor-pointer group"
                  >
                    <circle cx={prob.mapX} cy={prob.mapY} r="16" fill="#f59e0b" fillOpacity="0.25" className="animate-pulse" />
                    <circle cx={prob.mapX} cy={prob.mapY} r="10" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                    <text x={prob.mapX} y={prob.mapY + 3.5} fontSize="9" textAnchor="middle" fill="#ffffff" fontWeight="black">
                      ⚠️
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* 5. ACTIVE SAFETY ALERTS */}
            {(activeLayerFilter === 'all' || activeLayerFilter === 'alerts') && (
              <g id="alerts-layer">
                {alertMarkers.map((alt) => (
                  <g
                    key={alt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity({ type: 'alert', data: alt });
                    }}
                    className="cursor-pointer group"
                  >
                    <circle cx={alt.mapX} cy={alt.mapY} r="20" fill="#f43f5e" fillOpacity="0.3" className="animate-ping" />
                    <circle cx={alt.mapX} cy={alt.mapY} r="12" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                    <text x={alt.mapX} y={alt.mapY + 4} fontSize="10" textAnchor="middle" fill="#ffffff" fontWeight="black">
                      🛡️
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* 6. EMERGENCY RESPONSE INCIDENTS */}
            {(activeLayerFilter === 'all' || activeLayerFilter === 'alerts') && (
              <g id="emergencies-layer">
                {emergencyMarkers.map((emg) => (
                  <g
                    key={emg.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity({ type: 'emergency', data: emg });
                    }}
                    className="cursor-pointer group"
                  >
                    <circle cx={emg.mapX} cy={emg.mapY} r="26" fill="#dc2626" fillOpacity="0.4" className="animate-ping" />
                    <circle cx={emg.mapX} cy={emg.mapY} r="14" fill="#991b1b" stroke="#ffffff" strokeWidth="2.5" />
                    <text x={emg.mapX} y={emg.mapY + 4} fontSize="11" textAnchor="middle" fill="#ffffff" fontWeight="bold">
                      🚨
                    </text>
                  </g>
                ))}
              </g>
            )}
          </svg>
        </div>

        {/* Bottom Interactive Legend */}
        <div className="relative z-20 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              Legend:
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Normal Area</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <span>Problem Issue (⚠️)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <span>Safety Alert (🛡️)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-700 animate-bounce" />
              <span>Emergency (🚨)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-400 font-bold">🚪</span>
              <span>Emergency Exit</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-rose-400 font-bold">🧯</span>
              <span>Fire Point</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-blue-400 font-bold">⛳</span>
              <span>Muster Point</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Click any building, room, or marker to open live telemetry &amp; action dispatch.
          </div>
        </div>
      </div>

      {/* Slide-in Quick Entity Detail Inspector Card (When user clicks on any map item) */}
      {selectedEntity && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 animate-fadeIn space-y-4">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                {selectedEntity.type === 'problem' && <Wrench className="w-4 h-4" />}
                {selectedEntity.type === 'alert' && <Flame className="w-4 h-4 text-rose-500" />}
                {selectedEntity.type === 'emergency' && <Siren className="w-4 h-4 text-red-600 animate-spin" />}
                {selectedEntity.type === 'room' && <GraduationCap className="w-4 h-4 text-indigo-500" />}
                {selectedEntity.type === 'building' && <Building2 className="w-4 h-4 text-emerald-500" />}
                {selectedEntity.type === 'safety_point' && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {selectedEntity.type.replace('_', ' ')}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedEntity.data.name || selectedEntity.data.title}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {selectedEntity.data.description || selectedEntity.data.details || selectedEntity.data.message}
          </p>

          {/* Quick Context Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            {/* If Problem */}
            {selectedEntity.type === 'problem' && (
              <>
                <button
                  onClick={() => {
                    setSelectedIssueId(selectedEntity.data.id);
                    setActiveTab('issues');
                  }}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Issue #{selectedEntity.data.issueId}</span>
                </button>
                <button
                  onClick={() => {
                    selectForAiAnalysis({
                      id: selectedEntity.data.issueId,
                      itemType: 'problem',
                      title: selectedEntity.data.title,
                      category: selectedEntity.data.category,
                      location: selectedEntity.data.exactLocation,
                      description: selectedEntity.data.description,
                      severity: selectedEntity.data.priority,
                    });
                  }}
                  className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Analyze with AI Safety Assistant</span>
                </button>
              </>
            )}

            {/* If Safety Alert */}
            {selectedEntity.type === 'alert' && (
              <>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Open Safety Alert Center</span>
                </button>
                <button
                  onClick={() => {
                    selectForAiAnalysis({
                      id: selectedEntity.data.id,
                      itemType: 'alert',
                      title: selectedEntity.data.title,
                      category: selectedEntity.data.type || 'Safety Alert',
                      location: selectedEntity.data.location,
                      description: selectedEntity.data.message,
                      severity: selectedEntity.data.severity,
                    });
                  }}
                  className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Safety Advice</span>
                </button>
              </>
            )}

            {/* If Emergency */}
            {selectedEntity.type === 'emergency' && (
              <button
                onClick={() => setActiveTab('emergency-response')}
                className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-1.5"
              >
                <Siren className="w-4 h-4 animate-spin" />
                <span>Open in Emergency Response Center</span>
              </button>
            )}

            {/* If Classroom or Lab */}
            {selectedEntity.type === 'room' && (
              <>
                <button
                  onClick={() => {
                    setSelectedClassroomId(selectedEntity.data.id);
                    setActiveTab('classrooms');
                  }}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>View Classroom Telemetry</span>
                </button>
                <button
                  onClick={() => setActiveTab('report-problem')}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Report Problem in this Room</span>
                </button>
              </>
            )}

            {/* If Building */}
            {selectedEntity.type === 'building' && (
              <button
                onClick={() => setSelectedBuildingId(selectedEntity.data.id)}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>View Full Building Blueprint</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Drilldown Modal when a building is clicked */}
      <CampusLocationModal
        buildingId={selectedBuildingId}
        onClose={() => setSelectedBuildingId(null)}
      />
    </div>
  );
};
