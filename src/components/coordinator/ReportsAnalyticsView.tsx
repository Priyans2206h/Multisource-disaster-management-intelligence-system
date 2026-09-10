import React from 'react';
import { BarChart3, Clock, CheckCircle2, ShieldAlert, Users, FileText } from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';

export const ReportsAnalyticsView: React.FC = () => {
  const { incidents, auditLogs, resources, sosRequests } = useDisaster();

  // Category counts
  const categoryCounts: Record<string, number> = {};
  incidents.forEach((i) => {
    categoryCounts[i.type] = (categoryCounts[i.type] || 0) + 1;
  });

  // Severity counts
  const severityCounts: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    UNVERIFIED: 0,
  };
  incidents.forEach((i) => {
    if (severityCounts[i.severity] !== undefined) {
      severityCounts[i.severity]++;
    }
  });

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-background">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Operations Analytics & Audit Log</h2>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-surface p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Response Time</span>
          <div className="text-2xl font-black text-slate-900 mt-1">1m 45s</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Meets Target (&lt;2m)
          </span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Verification Rate</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {Math.round((incidents.filter((i) => i.verified).length / incidents.length) * 100)}%
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Human-in-the-loop triage</span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Resource Utilization</span>
          <div className="text-2xl font-black text-orange-600 mt-1">
            {Math.round(
              (resources.filter((r) => r.status === 'DEPLOYED' || r.status === 'ASSIGNED').length /
                resources.length) *
                100
            )}
            %
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Active deployments</span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Citizens Assisted</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {incidents.reduce((acc, i) => acc + i.affectedPeople, 0)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Across active zones</span>
        </div>
      </div>

      {/* Distribution Charts (Pure accessible HTML/CSS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-surface p-5 rounded-xl border border-slate-200 shadow-subtle space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Incident Severity Breakdown
          </h3>
          <div className="space-y-2 text-xs">
            {Object.entries(severityCounts).map(([sev, count]) => {
              const pct = Math.round((count / incidents.length) * 100) || 0;
              const barColor =
                sev === 'CRITICAL'
                  ? 'bg-red-600'
                  : sev === 'HIGH'
                  ? 'bg-orange-500'
                  : sev === 'MEDIUM'
                  ? 'bg-amber-500'
                  : sev === 'LOW'
                  ? 'bg-emerald-600'
                  : 'bg-slate-400';

              return (
                <div key={sev} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                    <span>{sev}</span>
                    <span>
                      {count} incidents ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-surface p-5 rounded-xl border border-slate-200 shadow-subtle space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Incidents by Disaster Category
          </h3>
          <div className="space-y-2 text-xs">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / incidents.length) * 100) || 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                    <span>{cat}</span>
                    <span>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table (PRD Feature F6 Requirement) */}
      <div className="bg-surface rounded-xl border border-slate-200 overflow-hidden shadow-subtle space-y-3 p-5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Official Coordinator Audit Trail (PRD F6 Requirement)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Operational Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-800">{log.actor}</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">{log.role}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700 text-[11px]">{log.action}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{log.targetId}</td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
