import React, { useState } from 'react';
import { 
  Siren, 
  Phone, 
  MapPin, 
  Users, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck, 
  Truck,
  HeartHandshake,
  ExternalLink
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

export const SosQueueView: React.FC = () => {
  const {
    sosRequests,
    resources,
    ngoOrganizations,
    acknowledgeSos,
    assignSos,
    dispatchSosToNgo,
    resolveSos,
    selectIncident,
    setActiveNav,
  } = useDisaster();

  const [selectedSosId, setSelectedSosId] = useState<string | null>(null);
  const [dispatchType, setDispatchType] = useState<'NGO' | 'RESOURCE'>('NGO');
  const [dispatchTargetId, setDispatchTargetId] = useState<string>('');

  const availableUnits = resources.filter((r) => r.status === 'AVAILABLE');

  const handleDispatch = (sosId: string) => {
    if (!dispatchTargetId) return;
    if (dispatchType === 'NGO') {
      const ngo = ngoOrganizations.find((n) => n.id === dispatchTargetId);
      if (ngo) {
        dispatchSosToNgo(sosId, ngo.name, ngo.id);
      }
    } else {
      assignSos(sosId, dispatchTargetId);
    }
    setSelectedSosId(null);
    setDispatchTargetId('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-background">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Citizen SOS Response Queue</h2>
            <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse">
              LIVE BEACONS
            </span>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Total SOS In Queue: <strong className="text-slate-900">{sosRequests.length}</strong>
        </div>
      </div>

      {/* SOS Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sosRequests.map((sos) => {
          const isNew = sos.status === 'NEW';
          const isAcknowledged = sos.status === 'ACKNOWLEDGED';
          const isAssigned = sos.status === 'ASSIGNED';
          const isResolved = sos.status === 'RESOLVED';

          return (
            <div
              key={sos.id}
              className={`rounded-xl border p-4 shadow-subtle flex flex-col justify-between transition-all bg-surface ${
                isNew
                  ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                  : isResolved
                  ? 'border-slate-200 opacity-70 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Siren className={`w-4 h-4 ${isNew ? 'text-red-600 animate-bounce' : 'text-slate-500'}`} />
                    <span className="font-extrabold text-xs text-slate-900">{sos.id}</span>
                  </div>
                  <StatusBadge status={sos.status} size="sm" />
                </div>

                {/* Citizen Details */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{sos.userName}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{sos.userPhone}</span>
                  </div>
                </div>

                {/* Location & Trapped Count */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Trapped:</span>
                    <span className="font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      {sos.peopleCount} individuals
                    </span>
                  </div>
                  <div className="flex items-start gap-1 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="font-medium line-clamp-2">{sos.locationName}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Coordinates: {sos.latitude.toFixed(4)}° N, {sos.longitude.toFixed(4)}° E
                  </div>
                </div>

                {/* Description */}
                <div className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200 leading-relaxed italic">
                  "{sos.description || 'Emergency assistance requested via 1-touch SOS beacon.'}"
                </div>

                {/* Assigned Dispatch info */}
                {sos.assignedTo && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 bg-purple-50 p-2 rounded-lg border border-purple-200">
                    <HeartHandshake className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Assigned NGO Wing: {sos.assignedTo}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2 text-xs">
                {selectedSosId === sos.id ? (
                  <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-purple-900 uppercase block">
                        Direct Mission Dispatch:
                      </label>
                      <div className="flex text-[9px] font-bold bg-purple-100 p-0.5 rounded">
                        <button
                          type="button"
                          onClick={() => { setDispatchType('NGO'); setDispatchTargetId(''); }}
                          className={`px-1.5 py-0.5 rounded ${dispatchType === 'NGO' ? 'bg-purple-600 text-white' : 'text-purple-700'}`}
                        >
                          NGO Taskforce
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDispatchType('RESOURCE'); setDispatchTargetId(''); }}
                          className={`px-1.5 py-0.5 rounded ${dispatchType === 'RESOURCE' ? 'bg-purple-600 text-white' : 'text-purple-700'}`}
                        >
                          Units
                        </button>
                      </div>
                    </div>

                    {dispatchType === 'NGO' ? (
                      <select
                        value={dispatchTargetId}
                        onChange={(e) => setDispatchTargetId(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-purple-300 rounded font-medium text-slate-800"
                      >
                        <option value="">-- Choose Verified NGO Partner --</option>
                        {ngoOrganizations.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name} ({n.headquartersZone})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={dispatchTargetId}
                        onChange={(e) => setDispatchTargetId(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800"
                      >
                        <option value="">-- Available Units --</option>
                        {availableUnits.map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.name} ({u.type})
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleDispatch(sos.id)}
                        disabled={!dispatchTargetId}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-1.5 rounded text-xs shadow-sm"
                      >
                        Dispatch {dispatchType === 'NGO' ? 'NGO Squad' : 'Unit'}
                      </button>
                      <button
                        onClick={() => { setSelectedSosId(null); setDispatchTargetId(''); }}
                        className="px-2.5 bg-slate-200 text-slate-700 rounded text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isNew && (
                      <button
                        onClick={() => acknowledgeSos(sos.id)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-2 rounded-lg transition-colors shadow-sm"
                      >
                        Acknowledge
                      </button>
                    )}

                    {!isAssigned && !isResolved && (
                      <button
                        onClick={() => setSelectedSosId(sos.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-2 rounded-lg transition-colors shadow-sm"
                      >
                        Dispatch Unit
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => resolveSos(sos.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors shadow-sm"
                        title="Mark rescue completed"
                      >
                        Rescued
                      </button>
                    )}

                    {isResolved && (
                      <span className="w-full text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-1 rounded border border-emerald-200 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Rescue Completed & Safe</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sosRequests.length === 0 && (
        <EmptyState
          title="No Active SOS Beacons"
          description="All citizen distress signals have been addressed or resolved."
        />
      )}
    </div>
  );
};
