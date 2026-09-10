import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { EmergencyAlert } from '../../types';

interface AlertBannerProps {
  alert: EmergencyAlert;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const severityConfigs = {
    CRITICAL: {
      border: 'border-red-500 bg-red-50 text-red-900',
      badge: 'bg-red-600 text-white',
      icon: <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 animate-pulse" />,
    },
    HIGH: {
      border: 'border-orange-500 bg-orange-50 text-orange-900',
      badge: 'bg-orange-600 text-white',
      icon: <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />,
    },
    MEDIUM: {
      border: 'border-amber-500 bg-amber-50 text-amber-900',
      badge: 'bg-amber-600 text-white',
      icon: <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    },
    INFO: {
      border: 'border-blue-500 bg-blue-50 text-blue-900',
      badge: 'bg-blue-600 text-white',
      icon: <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0" />,
    },
  };

  const config = severityConfigs[alert.severity] || severityConfigs.CRITICAL;

  return (
    <div className={`rounded-xl border-l-4 border shadow-subtle p-4 ${config.border} transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {config.icon}
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${config.badge}`}>
                OFFICIAL {alert.severity} ALERT
              </span>
              <span className="text-xs font-semibold text-slate-700">
                Issued {alert.issuedAt} • Expires {alert.expiresAt}
              </span>
              <span className="text-xs text-slate-500 font-medium">({alert.issuedBy})</span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 leading-tight">{alert.title}</h4>
            <p className="text-xs text-slate-800 leading-relaxed font-normal">{alert.message}</p>

            {expanded && alert.instructions && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs bg-white/70 p-3 rounded-lg">
                <p className="font-bold text-slate-900 mb-1.5 uppercase text-[11px] tracking-wider">
                  Mandatory Instructions:
                </p>
                <div className="whitespace-pre-line text-slate-800 font-medium space-y-1">
                  {alert.instructions}
                </div>
                <div className="mt-2 text-[11px] text-slate-600">
                  <span className="font-semibold">Target Area:</span> {alert.geographicArea}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {alert.instructions && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white/80 hover:bg-white border border-slate-300 rounded-md flex items-center gap-1 shadow-sm"
            >
              {expanded ? (
                <>
                  Less <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Action Protocol <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold px-1"
              title="Dismiss banner"
            >
              &times;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
