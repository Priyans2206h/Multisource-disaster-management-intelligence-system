import React, { useState } from 'react';
import { DisasterProvider, useDisaster } from './store/disasterContext';
import { TopBar } from './components/coordinator/TopBar';
import { Sidebar } from './components/coordinator/Sidebar';
import { IncidentDetailPanel } from './components/coordinator/IncidentDetailPanel';
import { OverviewDashboard } from './components/coordinator/OverviewDashboard';
import { IncidentsView } from './components/coordinator/IncidentsView';
import { SosQueueView } from './components/coordinator/SosQueueView';
import { ResourcesView } from './components/coordinator/ResourcesView';
import { AlertsView } from './components/coordinator/AlertsView';
import { SheltersView } from './components/coordinator/SheltersView';
import { ReportsAnalyticsView } from './components/coordinator/ReportsAnalyticsView';
import { DisasterMap } from './components/map/DisasterMap';
import { CitizenPortal } from './components/citizen/CitizenPortal';
import { NgoPortal } from './components/ngo/NgoPortal';
import { DemoController } from './components/demo/DemoController';
import { RoleSelectionGateway } from './components/auth/RoleSelectionGateway';
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  Siren, 
  Menu 
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    role, 
    hasSelectedRole, 
    activeNav, 
    setActiveNav, 
    selectedIncidentId, 
    selectIncident, 
    activeSosCount 
  } = useDisaster();

  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // If first-time entry and no role selected, render the front-facing Role Selection Gateway
  if (!hasSelectedRole) {
    return <RoleSelectionGateway />;
  }

  // Render Coordinator views based on active sidebar selection
  const renderCoordinatorContent = () => {
    switch (activeNav) {
      case 'overview':
        return <OverviewDashboard />;
      case 'map':
        return (
          <div className="flex-1 w-full h-full relative">
            <DisasterMap height="100%" onSelectIncident={(id) => selectIncident(id)} />
          </div>
        );
      case 'incidents':
        return <IncidentsView />;
      case 'sos':
        return <SosQueueView />;
      case 'resources':
        return <ResourcesView />;
      case 'alerts':
        return <AlertsView />;
      case 'shelters':
        return <SheltersView />;
      case 'reports':
        return <ReportsAnalyticsView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-screen overflow-hidden bg-background">
      {/* Top Bar (64px) with operational role badge, locality selector, and mobile menu trigger */}
      <div className={role === 'COORDINATOR' ? 'block' : 'hidden md:block'}>
        <TopBar 
          onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {role === 'COORDINATOR' && (
          <>
            {/* Responsive Navigation Sidebar (Persistent on desktop, drawer on mobile) */}
            <Sidebar 
              isOpen={isMobileMenuOpen} 
              onClose={() => setIsMobileMenuOpen(false)} 
            />

            {/* Central Operational Surface */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
              {renderCoordinatorContent()}
            </main>

            {/* Slide-over / Sheet Incident Detail Panel */}
            {selectedIncidentId && (
              <IncidentDetailPanel onClose={() => selectIncident(null)} />
            )}
          </>
        )}

        {role === 'CITIZEN' && <CitizenPortal />}

        {role === 'NGO' && <NgoPortal />}
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on Coordinator view on mobile/tablet < 1024px) */}
      {role === 'COORDINATOR' && (
        <nav className="lg:hidden min-h-14 pb-[env(safe-area-inset-bottom,0px)] bg-navy-950 border-t border-slate-800 text-slate-300 flex items-center justify-around z-30 flex-shrink-0 select-none">
          <button
            onClick={() => setActiveNav('overview')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              activeNav === 'overview' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveNav('map')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              activeNav === 'map' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Live Map</span>
          </button>

          <button
            onClick={() => setActiveNav('incidents')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
              activeNav === 'incidents' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Incidents</span>
          </button>

          <button
            onClick={() => setActiveNav('sos')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors relative ${
              activeNav === 'sos' ? 'text-red-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Siren className="w-4 h-4" />
            <span>SOS</span>
            {activeSosCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {activeSosCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-4 h-4" />
            <span>More</span>
          </button>
        </nav>
      )}

      {/* Emergency Operations Drill Simulator Modal */}
      <DemoController
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <DisasterProvider>
      <MainLayout />
    </DisasterProvider>
  );
}

export default App;
