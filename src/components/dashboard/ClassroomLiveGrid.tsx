import React, { useState, useEffect } from 'react';

type RoomStatus = 'critical' | 'warning' | 'safe';

interface Room {
  id: string;
  name: string;
  temp: number;
  smoke: number;
  status: RoomStatus;
}

const ROOMS: Room[] = [
  { id: 'C-101', name: 'Chemistry Lab',  temp: 78, smoke: 92, status: 'critical' },
  { id: 'C-102', name: 'Physics',        temp: 32, smoke: 3,  status: 'safe'     },
  { id: 'C-103', name: 'CSE A',          temp: 45, smoke: 34, status: 'warning'  },
  { id: 'C-104', name: 'CSE B',          temp: 29, smoke: 2,  status: 'safe'     },
  { id: 'C-105', name: 'Library',        temp: 27, smoke: 1,  status: 'safe'     },
  { id: 'C-106', name: 'ECE Lab',        temp: 51, smoke: 41, status: 'warning'  },
];

const statusStyles: Record<RoomStatus, string> = {
  critical: 'bg-red-50 border-red-500 animate-pulse',
  warning:  'bg-yellow-50 border-yellow-400',
  safe:     'bg-green-50 border-green-400',
};

const statusBadge: Record<RoomStatus, string> = {
  critical: 'bg-red-600 text-white',
  warning:  'bg-yellow-500 text-white',
  safe:     'bg-green-500 text-white',
};

const statusLabel: Record<RoomStatus, string> = {
  critical: '🔴 CRITICAL',
  warning:  '🟡 WARNING',
  safe:     '🟢 SAFE',
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour12: false });
}

export const ClassroomLiveGrid: React.FC = () => {
  const [timestamp, setTimestamp] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <h2 className="text-lg font-extrabold tracking-wide text-gray-800 uppercase">
            LIVE CLASSROOM MONITOR – QIS Ongole
          </h2>
        </div>
        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          🕒 {formatTime(timestamp)}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROOMS.map((room) => (
          <div
            key={room.id}
            className={`border-2 rounded-2xl p-4 shadow-sm transition-all ${statusStyles[room.status]}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-gray-800">{room.id}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge[room.status]}`}>
                {statusLabel[room.status]}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{room.name}</p>
            <div className="flex gap-4 text-xs font-medium text-gray-700">
              <span>🌡 Temp: <strong>{room.temp}°C</strong></span>
              <span>💨 Smoke: <strong>{room.smoke}%</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassroomLiveGrid;
