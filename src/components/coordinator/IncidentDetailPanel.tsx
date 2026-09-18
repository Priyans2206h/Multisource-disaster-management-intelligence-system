import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Truck, 
  ExternalLink,
  ChevronRight,
  Send,
  Trash2,
  HeartHandshake,
  Radio
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { SeverityBadge } from '../common/SeverityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { IncidentStatus, Severity } from '../../types';

interface IncidentDetailPanelProps {
  onClose: () => void;
}

export const IncidentDetailPanel: React.FC<IncidentDetailPanelProps> = ({ onClose }) => {
  const {
    selectedIncident,
    selectedCity,
    activeCityInfo,
    activeLocalityInfo,
    resources,
    ngoOrganizations,
    dispatchIncidentToNgo,
    verifyIncident,
    updateIncidentStatus,
    updateIncidentSeverity,
    assignResourceToIncident,
    releaseResource,
    rejectIncident,
  } = useDisaster();

  const [assigningResource, setAssigningResource] = useState<boolean>(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [dispatchingNgo, setDispatchingNgo] = useState<boolean>(false);
  const [selectedNgoId, setSelectedNgoId] = useState<string>('');
  const [ngoInstructions, setNgoInstructions] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [targetStatus, setTargetStatus] = useState<IncidentStatus>('IN PROGRESS');

  if (!selectedIncident) return null;

  // Primary showcase incident dynamically mirrors the active operational locality and city
  const isLocalitySyncIncident = selectedIncident.id === '104';
  const displayLocationName = (isLocalitySyncIncident && activeLocalityInfo)
    ? `${activeLocalityInfo.name}, ${selectedCity}, ${activeCityInfo?.state || 'Gujarat'}`
    : selectedIncident.locationName;
  const displayLatitude = (isLocalitySyncIncident && activeLocalityInfo)
    ? activeLocalityInfo.latitude
    : selectedIncident.latitude;
  const displayLongitude = (isLocalitySyncIncident && activeLocalityInfo)
    ? activeLocalityInfo.longitude
    : selectedIncident.longitude;

  // Available resources to assign
  const availableResources = resources.filter((r) => r.status === 'AVAILABLE');
  // Currently assigned resource objects
  const assignedResourcesList = resources.filter((r) =>
    selectedIncident.assignedResourceIds.includes(r.id)
  );

  const handleAssign = () => {
    if (!selectedResourceId) return;
    assignResourceToIncident(selectedIncident.id, selectedResourceId);
    setSelectedResourceId('');
    setAssigningResource(false);
  };

  const handleNgoDispatch = () => {
    if (!selectedNgoId) return;
    const targetNgo = ngoOrganizations.find((n) => n.id === selectedNgoId);
    if (!targetNgo) return;
    dispatchIncidentToNgo(
      selectedIncident.id, 
      targetNgo.id, 
      targetNgo.name, 
      ngoInstructions || 'Immediate relief, triage, and on-site rescue mission.'
    );
    setSelectedNgoId('');
    setNgoInstructions('');
    setDispatchingNgo(false);
  };

  const handleStatusUpdate = () => {
    updateIncidentStatus(selectedIncident.id, targetStatus, statusNote);
    setShowStatusModal(false);
    setStatusNote('');
  };

  return (
    <>
      {/* Mobile Backdrop on < lg */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 lg:hidden"
      />

      <aside className="fixed lg:static inset-x-0 bottom-0 top-16 lg:top-auto z-40 lg:z-20 w-full sm:w-[420px] lg:w-[380px] right-0 bg-surface border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col flex-shrink-0 shadow-2xl lg:shadow-xl overflow-hidden animate-in slide-in-from-bottom lg:slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black tracking-wider text-slate-500 uppercase">
              INCIDENT #{selectedIncident.id}
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase px-1.5 py-0.5 bg-slate-200 rounded">
              {selectedIncident.type}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <SeverityBadge severity={selectedIncident.severity} size="sm" />
            <StatusBadge status={selectedIncident.status} size="sm" />
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-1.5 rounded-lg transition-colors"
          title="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Title */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            {selectedIncident.title}
          </h3>
        </div>

        {/* Verification Banner if unverified */}
        {!selectedIncident.verified && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>UNVERIFIED COMMUNITY REPORT</span>
            </div>
            <p className="text-[11px] text-amber-800 mb-2">
              This report requires human coordinator verification before official dispatch.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => verifyIncident(selectedIncident.id, 'CRITICAL')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-2 rounded text-[11px] shadow-sm"
              >
                Verify Critical
              </button>
              <button
                onClick={() => verifyIncident(selectedIncident.id, 'HIGH')}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-1.5 px-2 rounded text-[11px] shadow-sm"
              >
                Verify High
              </button>
              <button
                onClick={() => rejectIncident(selectedIncident.id)}
                className="px-2 bg-white text-slate-600 hover:text-red-700 border border-slate-300 rounded text-[11px]"
                title="Reject and discard"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" /> Location
            </div>
            <div className="font-semibold text-slate-900 mt-0.5">{displayLocationName}</div>
            <div className="text-[10px] text-slate-400">
              {displayLatitude.toFixed(4)}° N, {displayLongitude.toFixed(4)}° E
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-500" /> People Affected
            </div>
            <div className="font-extrabold text-slate-900 mt-0.5 text-sm">
              {selectedIncident.affectedPeople} residents
            </div>
            <div className="text-[10px] text-slate-500">Source: {selectedIncident.source}</div>
          </div>
        </div>

        {/* Evidence Photo if present */}
        {selectedIncident.evidenceUrl && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Citizen Photo Evidence
            </span>
            <div className="rounded-lg overflow-hidden border border-slate-200 max-h-36 bg-slate-100">
              <img
                src={selectedIncident.evidenceUrl}
                alt="Incident evidence"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Situation Description
          </span>
          <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
            {selectedIncident.description}
          </p>
        </div>

        {/* Direct NGO Partner (HQ Link) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
              Assigned NGO Taskforce
            </span>
            {selectedIncident.assignedNgoName && (
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                selectedIncident.ngoMissionStatus === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : selectedIncident.ngoMissionStatus === 'ON_SITE'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-purple-100 text-purple-800 border-purple-300'
              }`}>
                {selectedIncident.ngoMissionStatus || 'DISPATCHED'}
              </span>
            )}
          </div>

          {selectedIncident.assignedNgoName && !dispatchingNgo ? (
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-xs">{selectedIncident.assignedNgoName}</span>
                <button
                  onClick={() => setDispatchingNgo(true)}
                  className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline"
                >
                  Change
                </button>
              </div>
              {selectedIncident.ngoInstructions && (
                <p className="text-[11px] text-slate-600">
                  <strong className="text-purple-900 font-semibold">Directive: </strong>
                  {selectedIncident.ngoInstructions}
                </p>
              )}
              {selectedIncident.ngoSitrep && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-1.5 text-[11px] text-emerald-900 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-600 flex-shrink-0 animate-pulse" />
                  <span><strong>Field SITREP:</strong> {selectedIncident.ngoSitrep}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <select
                  value={selectedNgoId}
                  onChange={(e) => setSelectedNgoId(e.target.value)}
                  className="flex-1 text-xs p-1.5 bg-white border border-purple-300 rounded font-medium text-slate-800"
                >
                  <option value="">-- Select NGO Taskforce --</option>
                  {ngoOrganizations.map((ngo) => (
                    <option key={ngo.id} value={ngo.id}>
                      {ngo.name} ({ngo.headquartersZone})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleNgoDispatch}
                  disabled={!selectedNgoId}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-1.5 px-3 rounded text-xs shadow-sm"
                >
                  Dispatch
                </button>
                {selectedIncident.assignedNgoName && (
                  <button
                    onClick={() => setDispatchingNgo(false)}
                    className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Assigned Resources */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned Resources ({assignedResourcesList.length})
            </span>
            <button
              onClick={() => setAssigningResource(!assigningResource)}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-[11px]"
            >
              <Plus className="w-3 h-3" /> Assign Resource
            </button>
          </div>

          {assigningResource && (
            <div className="mb-3 p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
              <label className="text-[10px] font-bold text-blue-900 uppercase">
                Select Available Unit:
              </label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800"
              >
                <option value="">-- Choose Unit --</option>
                {availableResources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.locationZone}) - {r.type}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAssign}
                  disabled={!selectedResourceId}
                  className="flex-1 bg-blue-600 disabled:opacity-50 text-white font-bold py-1 rounded text-xs shadow-sm"
                >
                  Confirm Dispatch
                </button>
                <button
                  onClick={() => setAssigningResource(false)}
                  className="px-2 bg-slate-200 text-slate-700 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {assignedResourcesList.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center text-slate-500 text-[11px]">
              No resources dispatched yet.
            </div>
          ) : (
            <div className="space-y-1.5">
              {assignedResourcesList.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-slate-600" />
                    <div>
                      <div className="font-bold text-slate-900">{r.name}</div>
                      <div className="text-[10px] text-slate-500">Status: {r.status} • {r.contact}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => releaseResource(r.id)}
                    className="text-slate-400 hover:text-red-600 text-[10px] font-bold px-1.5 py-0.5 border border-slate-200 rounded bg-white"
                    title="Release resource back to available pool"
                  >
                    Release
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Incident Timeline
          </span>
          <div className="relative pl-4 space-y-3 border-l-2 border-slate-200 ml-1">
            {selectedIncident.timeline.map((evt, idx) => (
              <div key={evt.id || idx} className="relative">
                <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-800">{evt.label}</span>
                  <span className="text-[10px] text-slate-400">{evt.time}</span>
                </div>
                {evt.note && <p className="text-[11px] text-slate-600 mt-0.5">{evt.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
        <button
          onClick={() => setShowStatusModal(true)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
        >
          Update Lifecycle Status
        </button>

        {selectedIncident.status !== 'RESOLVED' && (
          <button
            onClick={() => updateIncidentStatus(selectedIncident.id, 'RESOLVED', 'Issue verified resolved on site.')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg text-xs shadow-sm transition-colors"
            title="Mark as Resolved"
          >
            Resolve
          </button>
        )}
      </div>

      {/* Status Transition Dialog Modal */}
      {showStatusModal && (
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-xs shadow-2xl border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Change Incident Status</h4>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">New Status:</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as IncidentStatus)}
                className="w-full mt-1 p-2 text-xs border border-slate-300 rounded font-bold text-slate-800"
              >
                <option value="VERIFIED">VERIFIED</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Status Note:</label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Describe progress or field updates..."
                rows={2}
                className="w-full mt-1 p-2 text-xs border border-slate-300 rounded text-slate-800"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleStatusUpdate}
                className="flex-1 bg-blue-600 text-white font-bold py-1.5 rounded text-xs"
              >
                Save
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-3 bg-slate-200 text-slate-700 rounded text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  </>
);
};
