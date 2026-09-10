import React from 'react';

interface KpiCardProps {
  label: string;
  count: number | string;
  subtext?: string;
  badgeText?: string;
  accentColor?: 'red' | 'orange' | 'amber' | 'blue' | 'green' | 'slate';
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  count,
  subtext,
  badgeText,
  accentColor = 'blue',
  icon,
  active = false,
  onClick,
}) => {
  const accentStyles = {
    red: {
      border: active ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 hover:border-red-300',
      numColor: 'text-red-600',
      barColor: 'bg-red-600',
      badge: 'bg-red-50 text-red-700 border-red-200',
    },
    orange: {
      border: active ? 'border-orange-500 ring-2 ring-orange-100' : 'border-slate-200 hover:border-orange-300',
      numColor: 'text-orange-600',
      barColor: 'bg-orange-600',
      badge: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    amber: {
      border: active ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200 hover:border-amber-300',
      numColor: 'text-amber-600',
      barColor: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    blue: {
      border: active ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300',
      numColor: 'text-blue-600',
      barColor: 'bg-blue-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    green: {
      border: active ? 'border-green-500 ring-2 ring-green-100' : 'border-slate-200 hover:border-green-300',
      numColor: 'text-green-600',
      barColor: 'bg-green-600',
      badge: 'bg-green-50 text-green-700 border-green-200',
    },
    slate: {
      border: active ? 'border-slate-400 ring-2 ring-slate-100' : 'border-slate-200 hover:border-slate-300',
      numColor: 'text-slate-800',
      barColor: 'bg-slate-400',
      badge: 'bg-slate-50 text-slate-700 border-slate-200',
    },
  };

  const style = accentStyles[accentColor];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative bg-surface rounded-xl border p-4 text-left transition-all duration-150 flex flex-col justify-between shadow-subtle ${style.border} ${
        onClick ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      }`}
    >
      {/* Top accent indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${style.barColor}`} />

      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{label}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className={`text-3xl font-extrabold tracking-tight ${style.numColor}`}>{count}</span>
        {badgeText && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${style.badge}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-slate-500 mt-2 line-clamp-1">{subtext}</p>}
    </button>
  );
};
