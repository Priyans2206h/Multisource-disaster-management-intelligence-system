import React from 'react';
import { 
  AlertTriangle, 
  Siren, 
  Clock, 
  Truck, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Radio
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { KpiCard } from '../common/KpiCard';
import { SeverityBadge } from '../common/SeverityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { DisasterMap } from '../map/DisasterMap';
import { AdBanner } from '../common/AdBanner';

export const OverviewDashboard: React.FC = () => {
  const {
    incidents,
    sosRequests,
    resources,
    activeIncidentsCount,
    criticalIncidentsCount,
    pendingVerificationCount,
    activeSosCount,
    availableResourcesCount,
    selectIncident,
    setActiveNav,
  } = useDisaster();

  // Urgent triage items: Active SOS + Unverified reports
  const pendingIncidents = incidents.filter(
    (i) => i.status === 'REPORTED' || i.status === 'PENDING VERIFICATION'
  );
  const activeSosList = sosRequests.filter((s) => s.status !== 'RESOLVED');

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-background">
      {/* KPI Summary Row (Matching design.MD Section 7) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        <KpiCard
          label="ACTIVE INCIDENTS"
          count={activeIncidentsCount}
          subtext="Across Ahmedabad district"
          accentColor="blue"
          icon={<AlertTriangle className="w-5 h-5" />}
          onClick={() => setActiveNav('incidents')}
        />
        <KpiCard
          label="ACTIVE SOS"
          count={activeSosCount}
          badgeText={activeSosCount > 0 ? 'URGENT' : undefined}
          subtext="Citizen beacons requiring rescue"
          accentColor="red"
          icon={<Siren className="w-5 h-5 text-red-500 animate-pulse" />}
          onClick={() => setActiveNav('sos')}
        />
        <KpiCard
          label="CRITICAL INCIDENTS"
          count={criticalIncidentsCount}
          subtext="Life-safety high priority"
          accentColor="orange"
          icon={<ShieldAlert className="w-5 h-5 text-orange-500" />}
          onClick={() => setActiveNav('incidents')}
        />
        <KpiCard
          label="PENDING VERIFICATION"
          count={pendingVerificationCount}
          subtext="Crowdsourced community input"
          accentColor="amber"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          onClick={() => setActiveNav('incidents')}
        />
        <KpiCard
          label="AVAILABLE RESOURCES"
          count={availableResourcesCount}
          subtext={`Out of ${resources.length} total units`}
          accentColor="green"
          icon={<Truck className="w-5 h-5 text-emerald-500" />}
          onClick={() => setActiveNav('resources')}
        />
      </div>

      {/* Middle Grid: Live Operations Map & Rapid Triage Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
        {/* Left: Operations Map */}
        <div className="lg:col-span-7 bg-surface rounded-xl border border-slate-200 overflow-hidden shadow-subtle flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Live Geospatial Operations Console
              </h3>
            </div>
            <button
              onClick={() => setActiveNav('map')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Full Screen Map <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 relative min-h-[380px]">
            <DisasterMap height="100%" />
          </div>
        </div>

        {/* Right: Urgent Action & Triage Feed */}
        <div className="lg:col-span-5 bg-surface rounded-xl border border-slate-200 shadow-subtle flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Siren className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Urgent Action Queue ({activeSosList.length + pendingIncidents.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Prioritized</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[460px]">
            {/* Active SOS items */}
            {activeSosList.map((sos) => (
              <div
                key={sos.id}
                onClick={() => {
                  if (sos.incidentId) selectIncident(sos.incidentId);
                }}
                className="p-3 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-50 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-600 text-white">
                      SOS #{sos.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{sos.userName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                    {sos.peopleCount} trapped
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium line-clamp-2">"{sos.description}"</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <span>{sos.locationName}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNav('sos');
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Dispatch →
                  </button>
                </div>
              </div>
            ))}

            {/* Pending Verification items */}
            {pendingIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => selectIncident(inc.id)}
                className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                      #{inc.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{inc.type}</span>
                  </div>
                  <SeverityBadge severity={inc.severity} size="sm" />
                </div>
                <p className="text-xs text-slate-700 font-medium line-clamp-1">{inc.title}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span>{inc.locationName}</span>
                  </span>
                  <span className="text-amber-800 font-semibold">Review Report →</span>
                </div>
              </div>
            ))}

            {activeSosList.length === 0 && pendingIncidents.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <span>No urgent SOS or unverified items in queue.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Advertisement Placement (Coordinator Console) */}
      <AdBanner variant="leaderboard" />
    </div>
  );
};
