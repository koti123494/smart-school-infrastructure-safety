import React from 'react';
import { SafetyStatus, PriorityLevel, IssueStatus } from '../../types';

export type BadgeStatus =
  | SafetyStatus
  | PriorityLevel
  | IssueStatus
  | 'online'
  | 'offline'
  | 'active'
  | 'acknowledged'
  | 'info';

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const norm = String(status).toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let hasPulse = false;

  switch (norm) {
    case 'SAFE':
    case 'RESOLVED':
    case 'ONLINE':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;

    case 'WARNING':
    case 'IN PROGRESS':
    case 'MEDIUM':
    case 'ACKNOWLEDGED':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
      break;

    case 'CRITICAL':
    case 'HIGH':
    case 'ACTIVE':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-500';
      hasPulse = true;
      break;

    case 'REPORTED':
    case 'ASSIGNED':
    case 'INFO':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      dotColor = 'bg-blue-500';
      break;

    case 'LOW':
      colorClasses = 'bg-slate-50 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      break;

    case 'OFFLINE':
      colorClasses = 'bg-gray-100 text-gray-500 border-gray-200';
      dotColor = 'bg-gray-400';
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {hasPulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75 animate-ping`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      <span>{norm}</span>
    </span>
  );
};
