import React, { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  Siren,
  Truck,
  Bell,
  Home,
  BarChart3,
  X,
  ShieldCheck,
  ArrowLeftRight,
  MapPin
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal';
import { AdBanner } from '../common/AdBanner';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const {
    activeNav,
    setActiveNav,
    activeIncidentsCount,
    activeSosCount,
    availableResourcesCount,
    activeAlertsCount,
    selectedCity,
    selectedLocality,
    setSelectedCity,
    setSelectedLocality,
    supportedCities,
    activeCityInfo,
  } = useDisaster();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'map',
      label: 'Live Map',
      icon: <Map className="w-4 h-4" />,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: activeIncidentsCount.toString(),
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'sos',
      label: 'SOS Requests',
      icon: <Siren className="w-4 h-4" />,
      badge: activeSosCount.toString(),
      badgeColor: activeSosCount > 0 ? 'bg-red-500 text-white font-extrabold animate-pulse' : 'bg-slate-800 text-slate-400',
    },
    {
      id: 'resources',
      label: 'NGOs & Resources',
      icon: <Truck className="w-4 h-4" />,
      badge: `${availableResourcesCount} free`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'alerts',
      label: 'Emergency Alerts',
      icon: <Bell className="w-4 h-4" />,
      badge: activeAlertsCount.toString(),
      badgeColor: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    },
    {
      id: 'shelters',
      label: 'Shelters',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar surface */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-20 w-64 bg-navy-950 border-r border-slate-800 text-slate-300 flex flex-col justify-between flex-shrink-0 select-none transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-3 space-y-1 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Operations Console</span>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Zone Selector (Visible on mobile/tablet screens < 1024px) */}
          <div className="lg:hidden mx-1 mb-3 p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Operational Zone</span>
            </div>
            <div className="space-y-1.5">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-800 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {supportedCities.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {activeCityInfo?.localities.map((loc) => (
                  <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-slate-900/80 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Revenue Advertisement Placement (Compact Sidebar Tile) */}
        <div className="px-2.5 pb-2">
          <AdBanner variant="compact" />
        </div>

        {/* Operator Session Info & Role Switcher (Bottom of sidebar) */}
        <div className="p-3 border-t border-slate-800/80 bg-navy-900/60 space-y-2">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              RS
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white truncate">Riya Sharma</span>
                <ShieldCheck className="w-3 h-3 text-blue-400 flex-shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">District Coordinator • Level 1</p>
            </div>
          </div>

          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700/60 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
            <span>Switch Operational Role</span>
          </button>
        </div>
      </aside>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </>
  );
};
