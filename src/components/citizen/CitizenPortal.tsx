import React, { useState, useMemo } from 'react';
import { 
  Siren, 
  AlertTriangle, 
  MapPin, 
  Home, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  ChevronRight, 
  Navigation, 
  Radio, 
  Building2, 
  Activity, 
  Truck, 
  Droplets, 
  Layers, 
  Clock, 
  ArrowLeftRight, 
  ExternalLink, 
  Info,
  Map as MapIcon,
  HeartHandshake
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { DisasterCategory, HelpCategory } from '../../types';
import { DisasterMap } from '../map/DisasterMap';
import { useIsMobile } from '../../hooks/useIsMobile';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal';
import { AdBanner } from '../common/AdBanner';

export const CitizenPortal: React.FC = () => {
  const isMobile = useIsMobile(768);

  const {
    shelters,
    submitCitizenSos,
    submitCitizenReport,
    selectedCity,
    selectedLocality,
    setSelectedCity,
    setSelectedLocality,
    supportedCities,
    activeCityInfo,
    activeLocalityInfo,
    emergencyHelps,
  } = useDisaster();

  // Navigation tab for mobile
  const [currentTab, setCurrentTab] = useState<'home' | 'map' | 'helps' | 'shelters' | 'report'>('home');
  const [showSosConfirm, setShowSosConfirm] = useState<boolean>(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);

  // Filter states
  const [selectedHelpCategory, setSelectedHelpCategory] = useState<'ALL' | HelpCategory>('ALL');
  const [shelterLocalityOnly, setShelterLocalityOnly] = useState<boolean>(false);

  // SOS state
  const [sosPeopleCount, setSosPeopleCount] = useState<number>(2);
  const [sosDisaster, setSosDisaster] = useState<DisasterCategory>('Flood');
  const [sosDescription, setSosDescription] = useState<string>('');
  const [sosUserName, setSosUserName] = useState<string>('Citizen in Distress');
  const [sosUserPhone, setSosUserPhone] = useState<string>('+91 98250 11234');
  const [confirmedSosId, setConfirmedSosId] = useState<string>('');
  const [isSendingSos, setIsSendingSos] = useState<boolean>(false);

  // Multi-step report state
  const [reportStep, setReportStep] = useState<number>(1);
  const [repType, setRepType] = useState<DisasterCategory>('Flood');
  const [repLocation, setRepLocation] = useState<string>(`${selectedLocality}, ${selectedCity}`);
  const [repPeople, setRepPeople] = useState<number>(5);
  const [repDesc, setRepDesc] = useState<string>('');
  const [repImage, setRepImage] = useState<string>('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80');
  const [submittedReportId, setSubmittedReportId] = useState<string>('');

  // Filtered Shelters based on selected city & locality
  const filteredShelters = useMemo(() => {
    let list = shelters.filter((s) => s.city === selectedCity);
    if (shelterLocalityOnly) {
      list = list.filter((s) => s.locality === selectedLocality);
    }
    return list;
  }, [shelters, selectedCity, selectedLocality, shelterLocalityOnly]);

  // Filtered Necessary Helps based on selected city & locality & category
  const filteredHelps = useMemo(() => {
    let list = emergencyHelps.filter((h) => h.city === selectedCity);
    if (selectedHelpCategory !== 'ALL') {
      list = list.filter((h) => h.category === selectedHelpCategory);
    }
    // Sort items matching the selected locality to the top
    return list.sort((a, b) => {
      const aMatches = a.locality.toLowerCase() === selectedLocality.toLowerCase();
      const bMatches = b.locality.toLowerCase() === selectedLocality.toLowerCase();
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  }, [emergencyHelps, selectedCity, selectedLocality, selectedHelpCategory]);

  // Trigger SOS Beacon with Selected City & Locality
  const handleSendSos = () => {
    setIsSendingSos(true);
    setTimeout(() => {
      const generatedId = submitCitizenSos({
        userName: sosUserName,
        userPhone: sosUserPhone,
        disasterType: sosDisaster,
        peopleCount: sosPeopleCount,
        description: sosDescription || `Emergency distress beacon triggered for ${selectedLocality}, ${selectedCity}.`,
        city: selectedCity,
        locality: selectedLocality,
        latitude: activeLocalityInfo.latitude,
        longitude: activeLocalityInfo.longitude,
        locationName: `${selectedLocality}, ${selectedCity}`,
      });
      setConfirmedSosId(generatedId);
      setIsSendingSos(false);
      setShowSosConfirm(true);
    }, 500);
  };

  // Submit Citizen Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const id = submitCitizenReport({
      type: repType,
      description: repDesc || `${repType} reported by citizen at ${repLocation}`,
      city: selectedCity,
      locality: selectedLocality,
      latitude: activeLocalityInfo.latitude,
      longitude: activeLocalityInfo.longitude,
      locationName: repLocation || `${selectedLocality}, ${selectedCity}`,
      affectedPeople: repPeople,
      evidenceUrl: repImage,
    });
    setSubmittedReportId(id);
    setReportStep(5);
  };

  const getHelpCategoryBadge = (category: HelpCategory) => {
    switch (category) {
      case 'helpline':
        return {
          label: 'Helpline & Control',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Phone className="w-3 h-3" />,
        };
      case 'medical':
        return {
          label: 'Hospital & Trauma',
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: <Activity className="w-3 h-3" />,
        };
      case 'food_water':
        return {
          label: 'Clean Water & Food',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Droplets className="w-3 h-3" />,
        };
      case 'assembly_point':
        return {
          label: 'Safe Assembly Ground',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Building2 className="w-3 h-3" />,
        };
    }
  };

  /* =========================================================================
     MOBILE UI / UX (Optimized for handheld phone ergonomics < 768px)
     ========================================================================= */
  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
        {/* Mobile Header */}
        <div className="bg-navy-950 text-white p-3.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
              <Siren className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-tight leading-none">DisasterSafe Citizen</h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Emergency Mobile Portal</p>
            </div>
          </div>

          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="bg-red-900/90 hover:bg-red-800 text-red-200 border border-red-700/80 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors"
            title="Switch Operational Role"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Role</span>
          </button>
        </div>

        {/* Mobile City & Locality Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <div className="flex items-center gap-1 flex-1 text-xs">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-800 text-white font-bold text-xs rounded px-2 py-1 border border-slate-700 outline-none truncate"
              >
                {supportedCities.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <span className="text-slate-500 font-bold">&gt;</span>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-slate-800 text-blue-300 font-bold text-xs rounded px-2 py-1 border border-slate-700 outline-none truncate"
              >
                {activeCityInfo.localities.map((l) => (
                  <option key={l.name} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
          {activeLocalityInfo.zone && (
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap">
              {activeLocalityInfo.zone}
            </span>
          )}
        </div>

        {/* Mobile Body Views */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: EMERGENCY SOS HOME */}
          {currentTab === 'home' && !showSosConfirm && (
            <div className="space-y-4">
              {/* Central Giant SOS Action */}
              <div className="bg-surface rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-[11px] font-mono font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Zone: {selectedLocality}, {selectedCity}</span>
                </div>

                <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                  ARE YOU IN IMMEDIATE DANGER?
                </div>

                <button
                  onClick={handleSendSos}
                  disabled={isSendingSos}
                  className="w-36 h-36 rounded-full bg-gradient-to-tr from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 active:scale-95 text-white flex flex-col items-center justify-center shadow-2xl ring-8 ring-red-100 border-4 border-white transition-all group"
                  title="Press to broadcast distress beacon"
                >
                  <Siren className="w-10 h-10 mb-1 group-hover:scale-110 transition-transform animate-pulse" />
                  <span className="text-2xl font-black tracking-wider leading-none">SOS</span>
                  <span className="text-[10px] font-bold text-red-100 uppercase mt-0.5">Instant Rescue</span>
                </button>

                <p className="text-xs text-slate-500 font-medium max-w-xs">
                  Transmits emergency distress beacon for {selectedLocality}, {selectedCity} to the Disaster Response Command.
                </p>
              </div>

              {/* Quick Mobile Action Cards */}
              <div className="space-y-2.5">
                <button
                  onClick={() => setCurrentTab('helps')}
                  className="w-full flex items-center justify-between p-3.5 bg-surface border border-slate-200 rounded-xl text-left shadow-subtle hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Necessary Helps &amp; Relief</h4>
                      <p className="text-[11px] text-slate-500">Helplines, hospitals, water and safe zones</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setCurrentTab('shelters')}
                  className="w-full flex items-center justify-between p-3.5 bg-surface border border-slate-200 rounded-xl text-left shadow-subtle hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Nearby Relief Centers ({filteredShelters.length})</h4>
                      <p className="text-[11px] text-slate-500">View capacity and available supplies</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setCurrentTab('map')}
                  className="w-full flex items-center justify-between p-3.5 bg-surface border border-slate-200 rounded-xl text-left shadow-subtle hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <MapIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Interactive Map ({selectedCity})</h4>
                      <p className="text-[11px] text-slate-500">Live spatial view with hazard overlays</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setRepLocation(`${selectedLocality}, ${selectedCity}`);
                    setReportStep(1);
                    setCurrentTab('report');
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-surface border border-slate-200 rounded-xl text-left shadow-subtle hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Report Hazard Incident</h4>
                      <p className="text-[11px] text-slate-500">Submit waterlogging, fire, or collapse notice</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Revenue Advertisement Placement (Mobile Card) */}
              <div className="pt-2">
                <AdBanner variant="card" />
              </div>
            </div>
          )}

          {/* SOS CONFIRMATION SCREEN */}
          {showSosConfirm && (
            <div className="bg-surface rounded-2xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">SOS BEACON CONFIRMED</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Received by Disaster Response Command for {selectedLocality}, {selectedCity}.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Beacon ID:</span>
                  <strong className="text-red-600 font-bold">{confirmedSosId}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-800 font-semibold">{selectedLocality}, {selectedCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Response Wing:</span>
                  <span className="text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
                    DISPATCHING NGO RELIEF TASKFORCE
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowSosConfirm(false)}
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Back to Home
              </button>
            </div>
          )}

          {/* TAB 2: INTERACTIVE LIVE MAP */}
          {currentTab === 'map' && (
            <div className="h-[calc(100vh-175px)] -m-4 relative flex flex-col">
              <DisasterMap height="100%" showFilters={true} />
            </div>
          )}

          {/* TAB 3: NECESSARY HELPS & RELIEF ASSISTANCE */}
          {currentTab === 'helps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Necessary Helps &amp; Relief
                  </h3>
                  <p className="text-[11px] text-slate-500">Active services in {selectedCity}</p>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {filteredHelps.length} Available
                </span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none">
                <button
                  onClick={() => setSelectedHelpCategory('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap border text-xs ${
                    selectedHelpCategory === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-surface text-slate-600 border-slate-200'
                  }`}
                >
                  All ({emergencyHelps.filter((h) => h.city === selectedCity).length})
                </button>
                <button
                  onClick={() => setSelectedHelpCategory('helpline')}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap border text-xs flex items-center gap-1 ${
                    selectedHelpCategory === 'helpline' ? 'bg-blue-600 text-white border-blue-600' : 'bg-surface text-slate-600 border-slate-200'
                  }`}
                >
                  <Phone className="w-3 h-3" />
                  Helplines
                </button>
                <button
                  onClick={() => setSelectedHelpCategory('medical')}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap border text-xs flex items-center gap-1 ${
                    selectedHelpCategory === 'medical' ? 'bg-red-600 text-white border-red-600' : 'bg-surface text-slate-600 border-slate-200'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  Medical
                </button>
                <button
                  onClick={() => setSelectedHelpCategory('food_water')}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap border text-xs flex items-center gap-1 ${
                    selectedHelpCategory === 'food_water' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-surface text-slate-600 border-slate-200'
                  }`}
                >
                  <Droplets className="w-3 h-3" />
                  Water / Food
                </button>
                <button
                  onClick={() => setSelectedHelpCategory('assembly_point')}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap border text-xs flex items-center gap-1 ${
                    selectedHelpCategory === 'assembly_point' ? 'bg-amber-600 text-white border-amber-600' : 'bg-surface text-slate-600 border-slate-200'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  Safe High Ground
                </button>
              </div>

              {/* Help Cards List */}
              <div className="space-y-3">
                {filteredHelps.map((help) => {
                  const badge = getHelpCategoryBadge(help.category);
                  const isLocalityMatch = help.locality.toLowerCase() === selectedLocality.toLowerCase();

                  return (
                    <div
                      key={help.id}
                      className={`bg-surface rounded-xl border p-3.5 shadow-subtle text-xs space-y-2.5 ${
                        isLocalityMatch ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>
                            {isLocalityMatch && (
                              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                                In Your Locality
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-xs">{help.name}</h4>
                        </div>
                      </div>

                      <div className="text-slate-600 text-[11px] flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{help.address}</span>
                      </div>

                      <p className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                        {help.details}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <div className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{help.operationalHours}</span>
                        </div>
                        <a
                          href={`tel:${help.phone.split('/')[0].trim()}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call {help.phone.split('/')[0].trim()}</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: NEARBY RELIEF SHELTERS */}
          {currentTab === 'shelters' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Relief Shelters in {selectedCity}
                  </h3>
                  <p className="text-[11px] text-slate-500">Government designated relief camps</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    onClick={() => setShelterLocalityOnly(false)}
                    className={`px-2 py-0.5 rounded ${!shelterLocalityOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                  >
                    All City
                  </button>
                  <button
                    onClick={() => setShelterLocalityOnly(true)}
                    className={`px-2 py-0.5 rounded ${shelterLocalityOnly ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'}`}
                  >
                    {selectedLocality}
                  </button>
                </div>
              </div>

              {filteredShelters.length === 0 ? (
                <div className="bg-surface rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500">
                  <Home className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No shelters listed directly in {selectedLocality}</p>
                  <p className="mt-1">Tap &quot;All City&quot; above to view shelters across {selectedCity}.</p>
                </div>
              ) : (
                filteredShelters.map((sh) => {
                  const occPct = Math.round((sh.currentOccupancy / sh.capacity) * 100);
                  const isFull = sh.status === 'FULL' || occPct >= 95;

                  return (
                    <div key={sh.id} className="bg-surface rounded-xl border border-slate-200 p-3.5 shadow-subtle text-xs space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {sh.locality}
                            </span>
                            {sh.locality.toLowerCase() === selectedLocality.toLowerCase() && (
                              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                                In Your Locality
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-xs">{sh.name}</h4>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isFull ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {sh.status}
                        </span>
                      </div>

                      <div className="text-slate-600 text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span>{sh.locationName}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Occupancy: {sh.currentOccupancy} / {sh.capacity}</span>
                          <span className="font-bold text-slate-700">{occPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${isFull ? 'bg-red-600' : 'bg-purple-600'}`} style={{ width: `${Math.min(occPct, 100)}%` }}></div>
                        </div>
                      </div>

                      {sh.suppliesAvailable && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {sh.suppliesAvailable.map((sup, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {sup}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                        <a href={`tel:${sh.contact}`} className="text-blue-700 font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{sh.contact}</span>
                        </a>
                        <button onClick={() => setCurrentTab('map')} className="text-blue-600 font-bold hover:underline">
                          View on Map &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Revenue Advertisement Placement (Mobile Shelters Tab) */}
              <div className="pt-2">
                <AdBanner variant="card" />
              </div>
            </div>
          )}

          {/* TAB 5: CITIZEN HAZARD REPORTING */}
          {currentTab === 'report' && (
            <div className="bg-surface rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900">Hazard Report (Step {reportStep} of 4)</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  UNVERIFIED STREAM
                </span>
              </div>

              {reportStep === 1 && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-800">1. What type of hazard?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Flood', 'Fire', 'Building Collapse', 'Road Accident', 'Cyclone', 'Other'] as DisasterCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setRepType(cat);
                          setReportStep(2);
                        }}
                        className={`p-3 rounded-xl border text-left font-bold ${
                          repType === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {reportStep === 2 && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-800">2. Where is it located?</p>
                  <input
                    type="text"
                    value={repLocation}
                    onChange={(e) => setRepLocation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Mapped to: {selectedLocality}, {selectedCity}</span>
                  </div>
                  <button
                    onClick={() => setReportStep(3)}
                    className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl"
                  >
                    Continue &rarr;
                  </button>
                </div>
              )}

              {reportStep === 3 && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-800">3. Estimated people affected?</p>
                  <input
                    type="number"
                    min="1"
                    value={repPeople}
                    onChange={(e) => setRepPeople(Number(e.target.value))}
                    className="w-24 p-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
                  />
                  <button
                    onClick={() => setReportStep(4)}
                    className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl"
                  >
                    Continue &rarr;
                  </button>
                </div>
              )}

              {reportStep === 4 && (
                <form onSubmit={handleSubmitReport} className="space-y-3">
                  <p className="font-bold text-slate-800">4. Ground Details &amp; Photograph</p>
                  <textarea
                    rows={2}
                    placeholder="Describe water depth, structural danger, or roadblocks..."
                    value={repDesc}
                    onChange={(e) => setRepDesc(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                  <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                    <img src={repImage} alt="Hazard photo" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded font-mono">
                      PHOTO ATTACHED
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm"
                  >
                    Submit Report &rarr;
                  </button>
                </form>
              )}

              {reportStep === 5 && (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">REPORT SUBMITTED</h4>
                  <p className="text-xs text-slate-500">
                    Logged as Incident #{submittedReportId} for coordinator verification.
                  </p>
                  <button
                    onClick={() => {
                      setReportStep(1);
                      setCurrentTab('home');
                    }}
                    className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Navigation Bar */}
        <nav className="min-h-14 pb-[env(safe-area-inset-bottom,0px)] bg-navy-950 border-t border-slate-800 text-slate-300 flex items-center justify-around z-30 flex-shrink-0 select-none">
          <button
            onClick={() => {
              setShowSosConfirm(false);
              setCurrentTab('home');
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentTab === 'home' && !showSosConfirm ? 'text-red-400' : 'text-slate-400'
            }`}
          >
            <Siren className="w-4 h-4" />
            <span>SOS</span>
          </button>

          <button
            onClick={() => setCurrentTab('helps')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentTab === 'helps' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Helps</span>
          </button>

          <button
            onClick={() => setCurrentTab('shelters')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentTab === 'shelters' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Shelters</span>
          </button>

          <button
            onClick={() => setCurrentTab('map')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentTab === 'map' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Map</span>
          </button>

          <button
            onClick={() => {
              setRepLocation(`${selectedLocality}, ${selectedCity}`);
              setReportStep(1);
              setCurrentTab('report');
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentTab === 'report' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report</span>
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
     DESKTOP UI / UX (Wide screen portal with side-by-side Live Map & Controls)
     ========================================================================= */
  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 space-y-6">
      {/* Top Banner with City/Locality Selector & Emergency Contacts */}
      <div className="bg-surface rounded-xl border border-slate-200 p-4 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Siren className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              DisasterSafe Citizen Emergency Portal
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Multisource Intelligence &bull; Active Assistance &bull; Shelter Management
            </p>
          </div>
        </div>

        {/* City & Locality Selector */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs shadow-xs">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="flex items-center gap-2">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none mb-1">Select City</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded px-2.5 py-1 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {supportedCities.map((c) => (
                  <option key={c.id} value={c.name}>{c.name} ({c.state})</option>
                ))}
              </select>
            </div>
            <span className="text-slate-400 font-bold mt-2">&gt;</span>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none mb-1">Select Locality</span>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-white border border-slate-300 text-blue-700 font-bold text-xs rounded px-2.5 py-1 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {activeCityInfo.localities.map((l) => (
                  <option key={l.name} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
          {activeLocalityInfo.zone && (
            <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2 py-1 rounded">
              {activeLocalityInfo.zone}
            </span>
          )}
        </div>
      </div>

      {/* Main Desktop Grid: Side-by-Side SOS Action + Live Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
        {/* Left Column (5 cols): Emergency SOS Beacon & Quick Reporting */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* 1-Touch Emergency Distress Card */}
          <div className="bg-surface rounded-xl border border-slate-200 p-6 shadow-subtle text-center flex flex-col items-center justify-center space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-[11px] font-mono font-semibold">
              <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Zone: {selectedLocality}, {selectedCity}</span>
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              ARE YOU IN IMMEDIATE DANGER?
            </span>

            <button
              onClick={handleSendSos}
              disabled={isSendingSos}
              className="w-36 h-36 rounded-full bg-gradient-to-tr from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 active:scale-95 text-white flex flex-col items-center justify-center shadow-2xl ring-8 ring-red-100 border-4 border-white transition-all group"
              title="Click to transmit emergency distress beacon"
            >
              <Siren className="w-10 h-10 mb-1 group-hover:scale-110 transition-transform animate-pulse" />
              <span className="text-2xl font-black tracking-wider leading-none">SOS</span>
              <span className="text-[10px] font-bold text-red-100 uppercase mt-0.5">Instant Rescue</span>
            </button>

            <p className="text-xs text-slate-600 font-medium max-w-sm">
              Pressing SOS dispatches your location in {selectedLocality}, {selectedCity} to the Disaster Response Room and deployed units.
            </p>

            {/* Confirmation Feedback */}
            {confirmedSosId && (
              <div className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-left text-xs space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>BEACON RECEIVED: ID #{confirmedSosId}</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Dispatched to verified NGO Relief Taskforce for {selectedLocality}, {selectedCity}. Stay in safe high shelter.
                </p>
              </div>
            )}
          </div>

          {/* Citizen Hazard Report Form Card */}
          <div className="bg-surface rounded-xl border border-slate-200 p-5 shadow-subtle space-y-3 text-xs flex-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Report Observed Disaster Hazard</span>
            </div>
            <form onSubmit={handleSubmitReport} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hazard Category</label>
                  <select
                    value={repType}
                    onChange={(e) => setRepType(e.target.value as DisasterCategory)}
                    className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 text-xs"
                  >
                    <option value="Flood">Flood</option>
                    <option value="Fire">Fire</option>
                    <option value="Building Collapse">Building Collapse</option>
                    <option value="Road Accident">Road Accident</option>
                    <option value="Cyclone">Cyclone</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Affected People</label>
                  <input
                    type="number"
                    min="1"
                    value={repPeople}
                    onChange={(e) => setRepPeople(Number(e.target.value))}
                    className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Location Details</label>
                <input
                  type="text"
                  value={repLocation}
                  onChange={(e) => setRepLocation(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={repDesc}
                  onChange={(e) => setRepDesc(e.target.value)}
                  placeholder="Describe flood depth, damaged structures, or road blockages..."
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-colors"
              >
                Submit Citizen Report &rarr;
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (7 cols): Full Desktop Live Hazard & Shelters Map */}
        <div className="lg:col-span-7 bg-surface rounded-xl border border-slate-200 overflow-hidden shadow-subtle flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Live Hazard, Relief &amp; Shelters Map ({selectedCity} &bull; {selectedLocality})
              </h3>
            </div>
          </div>

          <div className="flex-1 relative min-h-[460px]">
            <DisasterMap height="100%" showFilters={true} />
          </div>
        </div>
      </div>

      {/* Revenue Advertisement Placement (Desktop Leaderboard Banner) */}
      <AdBanner variant="leaderboard" />

      {/* Bottom Desktop Row 1: Necessary Helps & Relief Assistance */}
      <div className="bg-surface rounded-xl border border-slate-200 p-5 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Necessary Helps &amp; Relief Assistance ({selectedCity})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Emergency Helplines, Trauma Hospitals, Water/Food Points, and Evacuation Assembly Grounds
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedHelpCategory('ALL')}
              className={`px-3 py-1 rounded-lg font-bold border text-xs ${
                selectedHelpCategory === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              All ({emergencyHelps.filter((h) => h.city === selectedCity).length})
            </button>
            <button
              onClick={() => setSelectedHelpCategory('helpline')}
              className={`px-3 py-1 rounded-lg font-bold border text-xs flex items-center gap-1 ${
                selectedHelpCategory === 'helpline' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              Helplines
            </button>
            <button
              onClick={() => setSelectedHelpCategory('medical')}
              className={`px-3 py-1 rounded-lg font-bold border text-xs flex items-center gap-1 ${
                selectedHelpCategory === 'medical' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Medical Aid
            </button>
            <button
              onClick={() => setSelectedHelpCategory('food_water')}
              className={`px-3 py-1 rounded-lg font-bold border text-xs flex items-center gap-1 ${
                selectedHelpCategory === 'food_water' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              Clean Water &amp; Food
            </button>
            <button
              onClick={() => setSelectedHelpCategory('assembly_point')}
              className={`px-3 py-1 rounded-lg font-bold border text-xs flex items-center gap-1 ${
                selectedHelpCategory === 'assembly_point' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Safe Assembly Ground
            </button>
          </div>
        </div>

        {/* Grid of Helps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {filteredHelps.map((help) => {
            const badge = getHelpCategoryBadge(help.category);
            const isLocalityMatch = help.locality.toLowerCase() === selectedLocality.toLowerCase();

            return (
              <div
                key={help.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  isLocalityMatch ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-100' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {help.locality}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs leading-snug">{help.name}</h4>

                  <div className="text-slate-600 text-[11px] flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{help.address}</span>
                  </div>

                  <p className="text-slate-600 text-[11px] bg-white p-2 rounded-lg border border-slate-200/80">
                    {help.details}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{help.operationalHours}</span>
                  </div>
                  <a
                    href={`tel:${help.phone.split('/')[0].trim()}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call {help.phone.split('/')[0].trim()}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Desktop Row 2: Nearby Relief Shelters Directory */}
      <div className="bg-surface rounded-xl border border-slate-200 p-5 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Nearby Relief Shelters &amp; Evacuation Centers ({selectedCity})
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Open Centers: <strong>{filteredShelters.filter((s) => s.status === 'OPEN').length}</strong> / {filteredShelters.length}
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                onClick={() => setShelterLocalityOnly(false)}
                className={`px-2.5 py-1 rounded ${!shelterLocalityOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                All in {selectedCity}
              </button>
              <button
                onClick={() => setShelterLocalityOnly(true)}
                className={`px-2.5 py-1 rounded ${shelterLocalityOnly ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'}`}
              >
                {selectedLocality} Only
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {filteredShelters.map((sh) => {
            const occPct = Math.round((sh.currentOccupancy / sh.capacity) * 100);
            const isLocalityMatch = sh.locality.toLowerCase() === selectedLocality.toLowerCase();

            return (
              <div
                key={sh.id}
                className={`p-3.5 rounded-xl space-y-2 border transition-all ${
                  isLocalityMatch ? 'bg-purple-50/40 border-purple-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                        {sh.locality}
                      </span>
                      {isLocalityMatch && (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                          In Your Locality
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs">{sh.name}</h4>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sh.status === 'FULL' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {sh.status}
                  </span>
                </div>

                <div className="text-slate-600 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span>{sh.locationName}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Occupancy: {sh.currentOccupancy} / {sh.capacity}</span>
                    <span className="font-bold text-slate-700">{occPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600" style={{ width: `${Math.min(occPct, 100)}%` }}></div>
                  </div>
                </div>

                {sh.suppliesAvailable && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {sh.suppliesAvailable.map((sup, idx) => (
                      <span key={idx} className="bg-white text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                        {sup}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                  <span className="font-bold text-blue-600 flex items-center gap-1">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{sh.contact}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </div>
  );
};
