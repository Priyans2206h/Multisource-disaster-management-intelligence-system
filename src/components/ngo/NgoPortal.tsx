import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Home, 
  Package, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Map as MapIcon, 
  Boxes,
  Send,
  ArrowLeftRight,
  Check,
  X,
  Radio,
  AlertTriangle,
  Siren
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { DisasterMap } from '../map/DisasterMap';
import { useIsMobile } from '../../hooks/useIsMobile';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal';
import { SeverityBadge } from '../common/SeverityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { NgoMissionStatus } from '../../types';

export const NgoPortal: React.FC = () => {
  const isMobile = useIsMobile(768);

  const {
    shelters,
    incidents,
    sosRequests,
    ngoOrganizations,
    selectedNgoId,
    setSelectedNgoId,
    updateNgoMissionStatus,
    sendSitrepToHq,
    updateShelterOccupancy,
    selectedCity,
    selectedLocality,
    activeLocalityInfo,
  } = useDisaster();

  // Active NGO organization
  const currentNgo = ngoOrganizations.find((n) => n.id === selectedNgoId) || ngoOrganizations[0];

  // Active tabs
  const [mobileTab, setMobileTab] = useState<'missions' | 'shelters' | 'supplies' | 'map'>('missions');
  const [desktopTab, setDesktopTab] = useState<'missions' | 'shelters' | 'supplies'>('missions');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);

  // Field SITREP text inputs keyed by mission id
  const [sitrepInputs, setSitrepInputs] = useState<{ [missionId: string]: string }>({});
  const [dispatchAlert, setDispatchAlert] = useState<string>('');

  // Local state for supply distribution counters
  const [distributedSupplies, setDistributedSupplies] = useState<{ [key: string]: number }>({
    'Clean Water (Liters)': 4200,
    'Hot Meal Packets': 2850,
    'Dry Ration Kits': 920,
    'First-Aid Kits': 340,
    'Tarpaulin & Blankets': 610,
  });

  const handleDistribute = (item: string, amount: number) => {
    setDistributedSupplies((prev) => ({
      ...prev,
      [item]: (prev[item] || 0) + amount,
    }));
    setDispatchAlert(`Logged distribution of +${amount} ${item}!`);
    setTimeout(() => setDispatchAlert(''), 3000);
  };

  const handleSendSitrep = (incidentId: string) => {
    const text = sitrepInputs[incidentId];
    if (!text || !text.trim()) return;
    sendSitrepToHq(incidentId, text.trim());
    setSitrepInputs((prev) => ({ ...prev, [incidentId]: '' }));
    setDispatchAlert(`Update sent to Headquarters!`);
    setTimeout(() => setDispatchAlert(''), 3000);
  };

  const handleAdvanceStatus = (incidentId: string, status: NgoMissionStatus) => {
    const note = status === 'ON_SITE'
      ? `NGO Squad arrived on scene at ${activeLocalityInfo?.name || selectedLocality}.`
      : status === 'COMPLETED'
      ? `Mission complete. Victims assisted and evacuated to safe shelter.`
      : `Order acknowledged by ${currentNgo.name}.`;
    updateNgoMissionStatus(incidentId, status, note);
    setDispatchAlert(`Mission updated: ${status === 'ON_SITE' ? 'Squad On-Site' : 'Completed'}`);
    setTimeout(() => setDispatchAlert(''), 3000);
  };

  // Direct HQ Missions assigned to this NGO
  const hqDirectMissions = incidents.filter(
    (inc) => inc.assignedNgoId === currentNgo.id ||
             (inc.assignedNgoName && inc.assignedNgoName.toLowerCase().includes(currentNgo.name.toLowerCase().split(' ')[0]))
  );

  // SOS beacons assigned to this NGO
  const assignedSosMissions = sosRequests.filter(
    (sos) => sos.assignedNgoId === currentNgo.id ||
             (sos.assignedTo && sos.assignedTo.toLowerCase().includes(currentNgo.name.toLowerCase().split(' ')[0]))
  );

  const totalDirectMissions = hqDirectMissions.length + assignedSosMissions.length;
  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);

  /* =========================================================================
     PHONE / MOBILE UI & UX (< 768px)
     ========================================================================= */
  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 relative">
        {/* Mobile Header */}
        <div className="bg-purple-950 text-white p-3.5 flex items-center justify-between border-b border-purple-800 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-sm flex-shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-black tracking-tight leading-none truncate">
                {currentNgo.name}
              </h1>
              <p className="text-[10px] text-purple-300 font-medium mt-0.5">
                Headquarters Relief Partner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="bg-purple-900 hover:bg-purple-800 text-purple-200 border border-purple-700 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Role</span>
            </button>
          </div>
        </div>

        {/* Global Dispatch Notification Banner */}
        {dispatchAlert && (
          <div className="bg-emerald-600 text-white text-xs px-3.5 py-2 font-bold flex items-center justify-between flex-shrink-0 animate-fade-in">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {dispatchAlert}</span>
            <button onClick={() => setDispatchAlert('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Simplified NGO Selection Strip */}
        <div className="bg-purple-900/80 border-b border-purple-800 px-3 py-1.5 flex items-center justify-between text-xs text-purple-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Active Taskforce:</span>
          <select
            value={selectedNgoId}
            onChange={(e) => setSelectedNgoId(e.target.value)}
            className="bg-purple-950 text-white text-xs font-bold rounded px-2 py-1 border border-purple-700 focus:outline-none max-w-[210px] truncate cursor-pointer"
          >
            {ngoOrganizations.map((n) => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>

        {/* Mobile Tab Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {/* TAB 1: MISSIONS */}
          {mobileTab === 'missions' && (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  HQ Direct Missions ({totalDirectMissions})
                </span>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                  Direct Command Link
                </span>
              </div>

              {totalDirectMissions === 0 ? (
                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-1 text-slate-500 text-xs">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                  <div className="font-bold text-slate-800 text-sm">No Pending Missions</div>
                  <p>All directives from Headquarters have been resolved.</p>
                </div>
              ) : (
                <>
                  {/* SOS Directives */}
                  {assignedSosMissions.map((sos) => (
                    <div key={sos.id} className="bg-white rounded-xl border border-red-200 p-3.5 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Siren className="w-3.5 h-3.5 text-red-600" />
                          <span className="text-xs font-bold text-slate-900">SOS #{sos.id} • {sos.userName}</span>
                        </div>
                        <StatusBadge status={sos.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600">
                        <MapPin className="w-3 h-3 inline text-slate-400 mr-1" />
                        {sos.locationName} • <strong className="text-red-600">{sos.peopleCount} trapped</strong>
                      </p>
                      {sos.description && (
                        <p className="text-xs italic text-slate-700 bg-slate-50 p-2 rounded">"{sos.description}"</p>
                      )}
                    </div>
                  ))}

                  {/* Incident Directives */}
                  {hqDirectMissions.map((inc) => {
                    const currentStatus = inc.ngoMissionStatus || 'DISPATCHED';
                    const isCompleted = currentStatus === 'COMPLETED';
                    const isOnSite = currentStatus === 'ON_SITE';

                    return (
                      <div
                        key={inc.id}
                        className={`bg-white rounded-xl border p-3.5 shadow-sm space-y-2.5 ${
                          isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-purple-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                                #{inc.id}
                              </span>
                              <SeverityBadge severity={inc.severity} size="sm" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">{inc.title}</h4>
                          </div>

                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            isOnSite ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            'bg-purple-100 text-purple-800 border-purple-300'
                          }`}>
                            {currentStatus}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-purple-600 flex-shrink-0" />
                          <span>{inc.locationName}</span> • <span>{inc.affectedPeople} affected</span>
                        </div>

                        {inc.ngoInstructions && (
                          <div className="bg-purple-50 p-2 rounded-lg text-xs text-purple-950">
                            <span className="font-bold text-[10px] text-purple-800 uppercase block">HQ Directive:</span>
                            <span className="mt-0.5 block">{inc.ngoInstructions}</span>
                          </div>
                        )}

                        {inc.ngoSitrep && (
                          <div className="bg-emerald-50 p-1.5 rounded text-[11px] text-emerald-950 flex items-center gap-1">
                            <Radio className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span><strong>Field SITREP:</strong> {inc.ngoSitrep}</span>
                          </div>
                        )}

                        {/* Simple 1-Click Action Progression */}
                        {!isCompleted ? (
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <div className="flex gap-2">
                              {!isOnSite ? (
                                <button
                                  onClick={() => handleAdvanceStatus(inc.id, 'ON_SITE')}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-lg text-xs shadow-sm"
                                >
                                  Squad On-Site
                                </button>
                              ) : (
                                <span className="flex-1 bg-blue-50 text-blue-800 font-bold py-1.5 rounded-lg text-xs text-center border border-blue-200">
                                  Operating On-Scene
                                </span>
                              )}

                              <button
                                onClick={() => handleAdvanceStatus(inc.id, 'COMPLETED')}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-xs shadow-sm"
                              >
                                Mission Complete
                              </button>
                            </div>

                            {/* Quick Update */}
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="Quick update to HQ..."
                                value={sitrepInputs[inc.id] || ''}
                                onChange={(e) => setSitrepInputs({ ...sitrepInputs, [inc.id]: e.target.value })}
                                className="flex-1 text-xs px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                              />
                              <button
                                onClick={() => handleSendSitrep(inc.id)}
                                disabled={!sitrepInputs[inc.id]?.trim()}
                                className="bg-purple-600 disabled:opacity-40 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm"
                              >
                                <Send className="w-3 h-3" />
                                <span>Send</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-1.5 border-t border-slate-100 text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mission Completed & Logged</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* TAB 2: SHELTERS */}
          {mobileTab === 'shelters' && (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Relief Shelters ({shelters.length})
                </span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  {totalOccupancy} / {totalCapacity} Beds Full
                </span>
              </div>

              {shelters.map((sh) => {
                const occPct = Math.min(100, Math.round((sh.currentOccupancy / sh.capacity) * 100));
                const isFull = sh.status === 'FULL' || occPct >= 95;

                return (
                  <div key={sh.id} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{sh.name}</h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">{sh.locationName}</div>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                        isFull ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isFull ? 'FULL' : 'OPEN'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-medium text-slate-600">
                        <span>Occupancy: {sh.currentOccupancy} / {sh.capacity} beds</span>
                        <span>{occPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full ${isFull ? 'bg-red-500' : occPct > 80 ? 'bg-amber-500' : 'bg-purple-600'}`}
                          style={{ width: `${occPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Beds:</span>
                        <button
                          onClick={() => updateShelterOccupancy(sh.id, Math.max(0, sh.currentOccupancy - 5))}
                          disabled={sh.currentOccupancy <= 0}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => updateShelterOccupancy(sh.id, Math.min(sh.capacity, sh.currentOccupancy + 5))}
                          disabled={sh.currentOccupancy >= sh.capacity}
                          className="w-6 h-6 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                        >
                          +5
                        </button>
                      </div>

                      <a
                        href={`tel:${sh.contact}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-purple-600" />
                        Call
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: SUPPLIES */}
          {mobileTab === 'supplies' && (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                Relief Supplies Log ({selectedCity})
              </span>

              {Object.entries(distributedSupplies).map(([item, count]) => (
                <div key={item} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">{item}</h4>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {count.toLocaleString()} <span className="text-xs font-normal text-slate-500">Units</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDistribute(item, 50)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs active:scale-95 shadow-sm"
                  >
                    +50 Log
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: MAP */}
          {mobileTab === 'map' && (
            <div className="flex-1 w-full h-full relative">
              <DisasterMap height="100%" showFilters={false} />
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar (4 Simple Tabs) */}
        <nav className="min-h-14 pb-[env(safe-area-inset-bottom,0px)] bg-purple-950 border-t border-purple-800 flex items-center justify-around z-30 flex-shrink-0 select-none text-purple-300">
          <button
            onClick={() => setMobileTab('missions')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors relative ${
              mobileTab === 'missions' ? 'text-white' : 'hover:text-purple-100'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Missions</span>
            {totalDirectMissions > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalDirectMissions}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileTab('shelters')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              mobileTab === 'shelters' ? 'text-white' : 'hover:text-purple-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Shelters</span>
          </button>

          <button
            onClick={() => setMobileTab('supplies')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              mobileTab === 'supplies' ? 'text-white' : 'hover:text-purple-100'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Supplies</span>
          </button>

          <button
            onClick={() => setMobileTab('map')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              mobileTab === 'map' ? 'text-white' : 'hover:text-purple-100'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Map</span>
          </button>
        </nav>

        {/* Role Switcher Modal */}
        <RoleSwitcherModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
        />
      </div>
    );
  }

  /* =========================================================================
     DESKTOP UI & UX (>= 768px)
     ========================================================================= */
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
      {/* Top Operations Header */}
      <header className="bg-purple-950 text-white px-5 py-3 flex items-center justify-between border-b border-purple-800 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-sm">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none">
              NGO Relief Operations Portal
            </h1>
            <p className="text-[11px] text-purple-300 font-medium mt-0.5">
              Headquarters Field Directives & Relief Management
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          {/* Active NGO Taskforce Selector */}
          <div className="bg-purple-900/90 border border-purple-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase text-purple-300">Taskforce:</span>
            <select
              value={selectedNgoId}
              onChange={(e) => setSelectedNgoId(e.target.value)}
              className="bg-purple-950 text-white text-xs font-bold rounded px-2 py-0.5 border border-purple-600 focus:outline-none cursor-pointer"
            >
              {ngoOrganizations.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>

          {/* Active Zone Badge */}
          <div className="flex items-center gap-1.5 bg-purple-900/60 border border-purple-700 px-2.5 py-1 rounded-lg text-xs">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-white font-bold">
              {activeLocalityInfo ? `${activeLocalityInfo.name}, ${selectedCity}` : selectedCity}
            </span>
          </div>
        </div>
      </header>

      {/* Global Dispatch Notification Banner */}
      {dispatchAlert && (
        <div className="bg-emerald-600 text-white text-xs px-5 py-2 font-bold flex items-center justify-between flex-shrink-0 animate-fade-in shadow-sm">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {dispatchAlert}</span>
          <button onClick={() => setDispatchAlert('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Main Dual-Pane Surface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Simple Tabs & Cards */}
        <div className="w-[45%] min-w-[380px] max-w-[500px] border-r border-slate-200 bg-surface flex flex-col overflow-hidden">
          {/* Simple Tab Bar */}
          <div className="p-2.5 border-b border-slate-200 bg-slate-50 flex items-center">
            <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg text-xs font-bold w-full">
              <button
                onClick={() => setDesktopTab('missions')}
                className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  desktopTab === 'missions' ? 'bg-white text-purple-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>HQ Missions ({totalDirectMissions})</span>
              </button>
              <button
                onClick={() => setDesktopTab('shelters')}
                className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  desktopTab === 'shelters' ? 'bg-white text-purple-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Shelters ({shelters.length})</span>
              </button>
              <button
                onClick={() => setDesktopTab('supplies')}
                className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  desktopTab === 'supplies' ? 'bg-white text-purple-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Supplies</span>
              </button>
            </div>
          </div>

          {/* Left Pane Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* SUBVIEW 1: HQ DIRECT MISSIONS */}
            {desktopTab === 'missions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Missions Dispatched by HQ ({totalDirectMissions})
                  </span>
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                    {currentNgo.headquartersZone}
                  </span>
                </div>

                {totalDirectMissions === 0 ? (
                  <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-1.5 text-slate-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <div className="font-bold text-slate-800 text-sm">No Pending Directives</div>
                    <p>All emergency missions assigned by Headquarters are complete.</p>
                  </div>
                ) : (
                  <>
                    {/* SOS Directives */}
                    {assignedSosMissions.map((sos) => (
                      <div key={sos.id} className="bg-white rounded-xl border border-red-200 p-3.5 shadow-subtle space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Siren className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-xs font-bold text-slate-900">SOS #{sos.id} • {sos.userName}</span>
                          </div>
                          <StatusBadge status={sos.status} size="sm" />
                        </div>
                        <div className="text-xs text-slate-600">
                          <MapPin className="w-3 h-3 inline text-slate-400 mr-1" />
                          {sos.locationName} • <strong className="text-red-600">{sos.peopleCount} trapped</strong>
                        </div>
                        {sos.description && (
                          <p className="text-xs italic text-slate-700 bg-slate-50 p-2 rounded">"{sos.description}"</p>
                        )}
                      </div>
                    ))}

                    {/* Incident Missions */}
                    {hqDirectMissions.map((inc) => {
                      const currentStatus = inc.ngoMissionStatus || 'DISPATCHED';
                      const isCompleted = currentStatus === 'COMPLETED';
                      const isOnSite = currentStatus === 'ON_SITE';

                      return (
                        <div
                          key={inc.id}
                          className={`bg-white rounded-xl border p-3.5 shadow-subtle space-y-2.5 ${
                            isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-purple-200'
                          }`}
                        >
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-black uppercase text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                                  #{inc.id}
                                </span>
                                <SeverityBadge severity={inc.severity} size="sm" />
                              </div>
                              <h4 className="text-xs font-bold text-slate-900">{inc.title}</h4>
                            </div>

                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                              isCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              isOnSite ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              'bg-purple-100 text-purple-800 border-purple-300'
                            }`}>
                              {currentStatus}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-purple-600 flex-shrink-0" />
                            <span>{inc.locationName}</span> • <span>{inc.affectedPeople} affected</span>
                          </div>

                          {/* Directive */}
                          {inc.ngoInstructions && (
                            <div className="bg-purple-50 p-2 rounded-lg text-xs text-purple-950">
                              <span className="font-bold text-[10px] text-purple-800 uppercase block">HQ Directive:</span>
                              <span className="mt-0.5 block leading-snug">{inc.ngoInstructions}</span>
                            </div>
                          )}

                          {/* Live SITREP note */}
                          {inc.ngoSitrep && (
                            <div className="bg-emerald-50 p-2 rounded text-xs text-emerald-950 flex items-center gap-1.5">
                              <Radio className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                              <span><strong>Field SITREP:</strong> {inc.ngoSitrep}</span>
                            </div>
                          )}

                          {/* Simplified Action Buttons */}
                          {!isCompleted ? (
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                              <div className="flex gap-2">
                                {!isOnSite ? (
                                  <button
                                    onClick={() => handleAdvanceStatus(inc.id, 'ON_SITE')}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-lg text-xs shadow-sm transition-colors"
                                  >
                                    Mark Squad On-Site
                                  </button>
                                ) : (
                                  <span className="flex-1 bg-blue-50 text-blue-800 font-bold py-1.5 rounded-lg text-xs text-center border border-blue-200">
                                    Operating On-Scene
                                  </span>
                                )}

                                <button
                                  onClick={() => handleAdvanceStatus(inc.id, 'COMPLETED')}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-xs shadow-sm transition-colors"
                                >
                                  Complete Mission
                                </button>
                              </div>

                              {/* Quick Update line */}
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Send quick update to HQ..."
                                  value={sitrepInputs[inc.id] || ''}
                                  onChange={(e) => setSitrepInputs({ ...sitrepInputs, [inc.id]: e.target.value })}
                                  className="flex-1 text-xs px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                                <button
                                  onClick={() => handleSendSitrep(inc.id)}
                                  disabled={!sitrepInputs[inc.id]?.trim()}
                                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Send</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-1 border-t border-slate-100 text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mission Completed & Logged to HQ</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* SUBVIEW 2: SHELTERS */}
            {desktopTab === 'shelters' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Relief Shelters ({shelters.length})
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    {totalOccupancy} / {totalCapacity} Beds Full
                  </span>
                </div>

                {shelters.map((sh) => {
                  const occPct = Math.min(100, Math.round((sh.currentOccupancy / sh.capacity) * 100));
                  const isFull = sh.status === 'FULL' || occPct >= 95;

                  return (
                    <div key={sh.id} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-subtle space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{sh.name}</h4>
                          <div className="text-[11px] text-slate-500 mt-0.5">{sh.locationName}</div>
                        </div>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                          isFull ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isFull ? 'FULL' : 'OPEN'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-medium text-slate-600">
                          <span>Occupancy: {sh.currentOccupancy} / {sh.capacity} beds</span>
                          <span>{occPct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full ${isFull ? 'bg-red-500' : occPct > 80 ? 'bg-amber-500' : 'bg-purple-600'}`}
                            style={{ width: `${occPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Beds:</span>
                          <button
                            onClick={() => updateShelterOccupancy(sh.id, Math.max(0, sh.currentOccupancy - 5))}
                            disabled={sh.currentOccupancy <= 0}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => updateShelterOccupancy(sh.id, Math.min(sh.capacity, sh.currentOccupancy + 5))}
                            disabled={sh.currentOccupancy >= sh.capacity}
                            className="w-6 h-6 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                          >
                            +5
                          </button>
                        </div>

                        <a
                          href={`tel:${sh.contact}`}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-purple-600" />
                          Contact
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SUBVIEW 3: SUPPLIES */}
            {desktopTab === 'supplies' && (
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  Field Supplies Distribution ({selectedCity})
                </span>

                {Object.entries(distributedSupplies).map(([item, count]) => (
                  <div key={item} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-subtle flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">{item}</h4>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        {count.toLocaleString()} <span className="text-xs font-normal text-slate-500">Units</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDistribute(item, 50)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs active:scale-95 shadow-sm"
                    >
                      +50 Log
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Leaflet Map */}
        <div className="flex-1 h-full relative overflow-hidden bg-slate-200">
          <DisasterMap height="100%" showFilters={false} />
        </div>
      </div>
    </div>
  );
};

export default NgoPortal;
