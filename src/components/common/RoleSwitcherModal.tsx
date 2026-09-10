import React from 'react';
import { 
  ShieldAlert, 
  Siren, 
  HeartHandshake, 
  Check, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { UserRole } from '../../types';
import { Modal } from './Modal';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { role, setRole, logoutRole } = useDisaster();

  const roles: {
    id: UserRole;
    name: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'COORDINATOR',
      name: 'Disaster Operations Coordinator',
      subtitle: 'HQ Command Center, Incident Ingestion & Direct NGO Dispatch',
      badge: 'COMMAND HQ',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
          <ShieldAlert className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: 'NGO',
      name: 'NGO & Relief Taskforce',
      subtitle: 'HQ Direct Missions, Live Field SITREPs & Relief Shelters',
      badge: 'NGO TASKFORCE',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
          <HeartHandshake className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: 'CITIZEN',
      name: 'Citizen Emergency Portal',
      subtitle: '1-Touch SOS Beacon, Citizen Reports & Shelters',
      badge: 'CITIZEN ACCESS',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm">
          <Siren className="w-5 h-5" />
        </div>
      ),
    },
  ];

  const handleSelect = (selectedId: UserRole) => {
    setRole(selectedId);
    onClose();
  };

  const handleResetToGateway = () => {
    logoutRole();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Operational Role"
      subtitle="Select any role to instantly switch perspectives and interface permissions"
      maxWidth="md"
    >
      <div className="space-y-3">
        {roles.map((r) => {
          const isCurrent = role === r.id;

          return (
            <div
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                isCurrent
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-200 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                {r.icon}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">{r.name}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${r.badgeColor}`}>
                      {r.badge}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">{r.subtitle}</p>
                </div>
              </div>

              {isCurrent ? (
                <div className="flex items-center gap-1 text-blue-700 text-xs font-bold bg-blue-100 px-2 py-1 rounded-md flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
                  <span>Active</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-700 flex-shrink-0 p-1"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}

        {/* Option to re-open the initial Gateway screen */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Need full role onboarding?</span>
          <button
            onClick={handleResetToGateway}
            className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Open Role Selection Gateway
          </button>
        </div>
      </div>
    </Modal>
  );
};
