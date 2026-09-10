import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  UserCheck, 
  Loader2, 
  CheckCheck, 
  Archive, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { IncidentStatus, SosStatus, ResourceStatus } from '../../types';

type AnyStatus = IncidentStatus | SosStatus | ResourceStatus;

interface StatusBadgeProps {
  status: AnyStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const getStatusConfig = (st: AnyStatus) => {
    switch (st) {
      // Incident statuses
      case 'REPORTED':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: <FileText className="w-3 h-3" />,
          label: 'REPORTED',
        };
      case 'PENDING VERIFICATION':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: <Clock className="w-3 h-3" />,
          label: 'PENDING VERIFICATION',
        };
      case 'VERIFIED':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          icon: <ShieldCheck className="w-3 h-3" />,
          label: 'VERIFIED',
        };
      case 'ASSIGNED':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          icon: <UserCheck className="w-3 h-3" />,
          label: 'ASSIGNED',
        };
      case 'IN PROGRESS':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-300',
          icon: <Loader2 className="w-3 h-3 animate-spin text-orange-600" />,
          label: 'IN PROGRESS',
        };
      case 'RESOLVED':
        return {
          bg: 'bg-green-50 text-green-800 border-green-300',
          icon: <CheckCircle className="w-3 h-3 text-green-600" />,
          label: 'RESOLVED',
        };
      case 'CLOSED':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: <Archive className="w-3 h-3" />,
          label: 'CLOSED',
        };

      // SOS statuses
      case 'NEW':
        return {
          bg: 'bg-red-100 text-red-800 border-red-300 font-extrabold',
          icon: <AlertCircle className="w-3 h-3 text-red-600 animate-pulse" />,
          label: 'NEW SOS',
        };
      case 'ACKNOWLEDGED':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <Clock className="w-3 h-3" />,
          label: 'ACKNOWLEDGED',
        };

      // Resource statuses
      case 'AVAILABLE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: <CheckCircle className="w-3 h-3 text-emerald-600" />,
          label: 'AVAILABLE',
        };
      case 'DEPLOYED':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-300',
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          label: 'DEPLOYED',
        };
      case 'UNAVAILABLE':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-300',
          icon: <Archive className="w-3 h-3" />,
          label: 'UNAVAILABLE',
        };
      case 'MAINTENANCE':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: <Clock className="w-3 h-3" />,
          label: 'MAINTENANCE',
        };

      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: <CheckCheck className="w-3 h-3" />,
          label: st,
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px] gap-1' : 'px-2 py-0.5 text-[11px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold tracking-wide rounded border ${config.bg} ${sizeClasses} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
