import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Phone, 
  RotateCcw,
  HeartHandshake,
  Radio
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { StatusBadge } from '../common/StatusBadge';
import { ResourceStatus, ResourceType } from '../../types';

export const ResourcesView: React.FC = () => {
  const {
    resources,
    incidents,
    ngoOrganizations,
    releaseResource,
    assignResourceToIncident,
    selectIncident,
    setActiveNav,
  } = useDisaster();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const [assignModalResourceId, setAssignModalResourceId] = useState<string | null>(null);
  const [targetIncidentId, setTargetIncidentId] = useState<string>('');

  const filteredResources = resources.filter((res) => {
    if (filterType !== 'ALL' && res.type !== filterType) return false;
    if (filterStatus !== 'ALL' && res.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        res.name.toLowerCase().includes(q) ||
        res.locationZone.toLowerCase().includes(q) ||
        res.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAssignSubmit = (resourceId: string) => {
    if (!targetIncidentId) return;
    assignResourceToIncident(targetIncidentId, resourceId);
    setAssignModalResourceId(null);
    setTargetIncidentId('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5 bg-background">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Resource Management</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
            Available: <strong>{resources.filter((r) => r.status === 'AVAILABLE').length}</strong> / {resources.length}
          </span>
        </div>
      </div>

      {/* Verified NGO Humanitarian Taskforces (Headquarters Direct Partners) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
              Verified NGO Humanitarian Taskforces (HQ Direct Operational Partners)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
            {ngoOrganizations.length} Taskforces Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {ngoOrganizations.map((ngo) => (
            <div
              key={ngo.id}
              className="bg-surface rounded-xl border border-slate-200 p-3.5 shadow-subtle flex flex-col justify-between hover:border-purple-300 transition-all space-y-2.5"
            >
              <div>
                <div className="flex items-start justify-between gap-1.5">
                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2">
                    {ngo.name}
                  </h4>
                  <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                    {ngo.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-1">
                  Base: {ngo.headquartersZone}
                </div>
                <div className="text-[10px] text-purple-700 font-bold mt-0.5">
                  {ngo.activeSquads} Active Field Squads
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
                <div className="text-slate-600 font-medium truncate">
                  POC: {ngo.contactPoc}
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{ngo.phone}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1 pt-1">
                  {ngo.specializations.slice(0, 2).map((spec, i) => (
                    <span key={i} className="text-[9px] bg-purple-50 text-purple-800 px-1.5 py-0.2 rounded border border-purple-150 truncate max-w-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface p-3.5 rounded-xl border border-slate-200 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources by name or zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="DEPLOYED">Deployed</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Unit Types</option>
            <option value="rescue_team">Rescue Teams & Boats</option>
            <option value="ambulance">Medical Ambulances</option>
            <option value="fire_unit">Fire & Hazmat Units</option>
            <option value="police">Police Patrols</option>
            <option value="supplies">Rations & Supplies</option>
          </select>
        </div>
      </div>

      {/* Resources Table (Per design.MD Section 13) */}
      <div className="bg-surface rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location Zone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Incident</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResources.map((res) => {
                const isAssignedOrDeployed = res.status === 'ASSIGNED' || res.status === 'DEPLOYED';

                return (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{res.name}</div>
                      <div className="text-[10px] text-slate-400">ID: {res.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 uppercase text-[10px]">
                      {res.type.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {res.locationZone}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={res.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      {res.assignedIncidentId ? (
                        <button
                          onClick={() => {
                            selectIncident(res.assignedIncidentId!);
                            setActiveNav('incidents');
                          }}
                          className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Incident #{res.assignedIncidentId}
                        </button>
                      ) : (
                        <span className="text-slate-400 font-normal">---</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{res.contact}</td>
                    <td className="py-3.5 px-4 text-right">
                      {isAssignedOrDeployed ? (
                        <button
                          onClick={() => releaseResource(res.id)}
                          className="text-[10px] font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 px-2.5 py-1 rounded transition-colors"
                        >
                          Release
                        </button>
                      ) : (
                        <button
                          onClick={() => setAssignModalResourceId(res.id)}
                          className="text-[10px] font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 px-2.5 py-1 rounded transition-colors"
                        >
                          Assign Unit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fast Assign Modal */}
      {assignModalResourceId && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Assign Resource to Active Incident
            </h3>
            <p className="text-xs text-slate-600">
              Select an ongoing emergency incident that requires this unit:
            </p>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Active Incident:
              </label>
              <select
                value={targetIncidentId}
                onChange={(e) => setTargetIncidentId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold"
              >
                <option value="">-- Choose Incident --</option>
                {incidents
                  .filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED')
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      #{i.id} - {i.type} [{i.severity}] ({i.locationName})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAssignModalResourceId(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!targetIncidentId}
                onClick={() => handleAssignSubmit(assignModalResourceId)}
                className="px-4 py-1.5 bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
