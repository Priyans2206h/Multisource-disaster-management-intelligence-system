import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { Severity } from '../../types';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md', className = '' }) => {
  const configs: Record<Severity, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
    CRITICAL: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />,
      label: 'CRITICAL',
    },
    HIGH: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: <AlertCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />,
      label: 'HIGH',
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <AlertCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />,
      label: 'MEDIUM',
    },
    LOW: {
      bg: 'bg-green-50 text-green-700 border-green-200',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />,
      label: 'LOW',
    },
    UNVERIFIED: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: <HelpCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />,
      label: 'UNVERIFIED',
    },
  };

  const config = configs[severity] || configs.UNVERIFIED;
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2 py-0.5 text-[11px] gap-1.5',
    lg: 'px-3 py-1 text-xs gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wider rounded border ${config.bg} ${sizeClasses[size]} ${className}`}
      title={`Severity: ${config.label}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
