import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  MapPin, 
  Users, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { SeverityBadge } from '../common/SeverityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { DisasterCategory, IncidentStatus, Severity } from '../../types';

export const IncidentsView: React.FC = () => {
  const {
    incidents,
    selectedIncidentId,
    selectIncident,
    verifyIncident,
    rejectIncident,
    updateIncidentStatus,
  } = useDisaster();

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState<string>('');

  // New incident modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<DisasterCategory>('Flood');
  const [newSeverity, setNewSeverity] = useState<Severity>('HIGH');
  const [newLocation, setNewLocation] = useState<string>('Ahmedabad, Gujarat');
  const [newAffected, setNewAffected] = useState<number>(10);
  const [newDesc, setNewDesc] = useState<string>('');

  const { submitCitizenReport } = useDisaster();

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    submitCitizenReport({
      type: newType,
      description: newDesc || newTitle,
      latitude: 23.025 + (Math.random() - 0.5) * 0.05,
      longitude: 72.570 + (Math.random() - 0.5) * 0.05,
      locationName: newLocation,
      affectedPeople: newAffected,
    });

    setIsModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false;
    if (filterCategory !== 'ALL' && inc.type !== filterCategory) return false;
    if (localSearch) {
      const q = localSearch.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q) ||
        inc.id.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5 bg-background">
      {/* Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Incident Management</h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Incident
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface p-3.5 rounded-xl border border-slate-200 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter incidents by keyword..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Severity */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="PENDING VERIFICATION">Pending Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Flood">Flood</option>
            <option value="Fire">Fire</option>
            <option value="Building Collapse">Building Collapse</option>
            <option value="Road Accident">Road Accident</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Cyclone">Cyclone</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-surface rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Affected</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map((inc) => {
                const isSelected = selectedIncidentId === inc.id;
                return (
                  <tr
                    key={inc.id}
                    onClick={() => selectIncident(inc.id)}
                    className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/50 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-black text-slate-900">#{inc.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{inc.type}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={inc.severity} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold text-slate-900">{inc.locationName}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{inc.title}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {inc.affectedPeople}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inc.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      {inc.verified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" /> UNVERIFIED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {!inc.verified && (
                          <button
                            onClick={() => verifyIncident(inc.id, 'HIGH')}
                            className="text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded shadow-sm"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => selectIncident(inc.id)}
                          className="text-[10px] font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded border border-slate-200"
                        >
                          Details →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredIncidents.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No incidents found matching the selected filter criteria.
          </div>
        )}
      </div>

      {/* Manual Incident Creator Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Verified Disaster Incident"
        subtitle="Manually create an official incident record in the operations system"
      >
        <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Incident Title / Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Canal embankment overflow flooding residential colony"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Disaster Category *
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as DisasterCategory)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
              >
                <option value="Flood">Flood</option>
                <option value="Fire">Fire</option>
                <option value="Building Collapse">Building Collapse</option>
                <option value="Road Accident">Road Accident</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Cyclone">Cyclone</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Initial Severity *
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as Severity)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Location Name *
              </label>
              <input
                type="text"
                required
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Estimated People Affected
              </label>
              <input
                type="number"
                min="0"
                value={newAffected}
                onChange={(e) => setNewAffected(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Detailed Description & Ground Observations
            </label>
            <textarea
              rows={3}
              placeholder="Provide ground access notes, depth of water, required rescue equipment..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm"
            >
              Save Incident
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
