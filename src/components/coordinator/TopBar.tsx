import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Radio, 
  Lock, 
  MapPin, 
  Menu, 
  X,
  AlertTriangle,
  ArrowLeftRight,
  ChevronDown
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal';

interface TopBarProps {
  onOpenScenarioModal: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onOpenScenarioModal,
  onToggleMobileMenu,
  isMobileMenuOpen = false
}) => {
  const {
    role,
    searchQuery,
    setSearchQuery,
    soundEnabled,
    setSoundEnabled,
    selectedCity,
    selectedLocality,
    setSelectedCity,
    setSelectedLocality,
    supportedCities,
    activeCityInfo,
    activeLocalityInfo,
  } = useDisaster();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);

  const roleDisplayNames: Record<string, { label: string; badgeColor: string }> = {
    COORDINATOR: { label: 'Coordinator HQ', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
    NGO: { label: 'NGO Relief Taskforce', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
    CITIZEN: { label: 'Citizen Portal', badgeColor: 'bg-red-100 text-red-800 border-red-200' },
    ADMIN: { label: 'System Admin', badgeColor: 'bg-slate-100 text-slate-800 border-slate-200' },
  };

  const roleInfo = roleDisplayNames[role] || roleDisplayNames.COORDINATOR;

  return (
    <header className="h-16 bg-surface border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 z-30 flex-shrink-0 shadow-sm">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Drawer Toggle (Visible on screens < 1024px) */}
        {role === 'COORDINATOR' && onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            title="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        {/* Geometric Mark: Pin + Shield + Radar */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-navy-950 flex items-center justify-center text-white shadow-sm border border-slate-700/50 relative overflow-hidden flex-shrink-0">
          <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>

        <div className="hidden sm:block min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 leading-none truncate">
              Disaster Intelligence
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase flex-shrink-0">
              LIVE OPS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-none mt-1 truncate">
            Multisource Emergency Operations System
          </p>
        </div>
      </div>

      {/* Center: Operational City & Locality Selector & Search (Coordinator HQ / Admin only) */}
      {role !== 'CITIZEN' ? (
        <div className="flex-1 max-w-xl flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Operational Zone Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 shadow-subtle flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Zone:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none cursor-pointer pr-1"
                title="Select Operational City"
              >
                {supportedCities.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <span className="text-slate-300">/</span>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-transparent font-medium text-slate-700 text-xs focus:outline-none cursor-pointer max-w-[130px] truncate"
                title="Select Operational Locality"
              >
                {activeCityInfo?.localities.map((loc) => (
                  <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
            {activeLocalityInfo && (
              <span className="text-[10px] text-slate-400 font-mono hidden xl:inline ml-1">
                ({activeLocalityInfo.latitude.toFixed(3)}°, {activeLocalityInfo.longitude.toFixed(3)}°)
              </span>
            )}
          </div>

          {/* Global Search Box (collapses on tiny screens) */}
          <div className="relative flex-1 min-w-[120px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search active operations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right Controls: Scenario Trigger, Audio, Permanent Role Badge */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Operational Drills Launcher */}
        <button
          onClick={onOpenScenarioModal}
          className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all"
          title="Run Emergency Simulation Drills"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden md:inline">Drill Simulator</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg border text-xs transition-colors ${
            soundEnabled
              ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              : 'bg-slate-100 text-slate-400 border-slate-200'
          }`}
          title={soundEnabled ? 'Audio alerts active' : 'Audio alerts muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Role Switcher Button */}
        <button 
          onClick={() => setIsRoleModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all hover:shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer ${roleInfo.badgeColor}`}
          title="Click to switch operational role"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-700" />
          <span className="font-bold">{roleInfo.label}</span>
          <ChevronDown className="w-3 h-3 text-slate-500 ml-0.5" />
        </button>
      </div>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </header>
  );
};
