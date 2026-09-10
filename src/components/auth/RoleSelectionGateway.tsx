import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Siren, 
  HeartHandshake, 
  CheckCircle2, 
  ArrowRight, 
  Radio,
  ArrowLeftRight
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { UserRole } from '../../types';

export const RoleSelectionGateway: React.FC = () => {
  const { selectAndLockRole } = useDisaster();
  
  // Mandatory selection: default to null so user MUST explicitly pick a role
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roleOptions: {
    id: UserRole;
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    icon: React.ReactNode;
    accentBorder: string;
    buttonColor: string;
  }[] = [
    {
      id: 'COORDINATOR',
      title: 'Disaster Operations Coordinator',
      subtitle: 'District Command Center & Emergency Headquarters (HQ)',
      badge: 'COMMAND HQ',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      accentBorder: 'hover:border-blue-500 focus:border-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
          <ShieldAlert className="w-6 h-6" />
        </div>
      ),
    },
    {
      id: 'NGO',
      title: 'NGO & Relief Taskforce',
      subtitle: 'Humanitarian Rescue, Triage & Relief Supply Wing',
      badge: 'NGO TASKFORCE',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      accentBorder: 'hover:border-purple-500 focus:border-purple-600',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
          <HeartHandshake className="w-6 h-6" />
        </div>
      ),
    },
    {
      id: 'CITIZEN',
      title: 'Citizen Emergency Portal',
      subtitle: 'Public Distress SOS & Community Reporting ("DisasterSafe")',
      badge: 'CITIZEN ACCESS',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      accentBorder: 'hover:border-red-500 focus:border-red-600',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      icon: (
        <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md animate-pulse">
          <Siren className="w-6 h-6" />
        </div>
      ),
    },
  ];

  const handleConfirmRole = () => {
    if (selectedRole) {
      selectAndLockRole(selectedRole);
    }
  };

  const selectedOpt = roleOptions.find((r) => r.id === selectedRole);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto flex flex-col items-center p-3 sm:p-6 py-6 sm:py-8 text-slate-800">
      <div className="w-full max-w-5xl bg-surface rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-navy-950 text-white p-6 sm:p-8 text-center border-b border-slate-800 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-blue-500/10 pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full border border-blue-500/10 pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Emergency Operations Infrastructure • Initial Authentication</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Operational Role Selection
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl mx-auto mt-2 leading-relaxed">
            Welcome to the Disaster Intelligence System. Select your active operational role to begin. You can switch between roles at any time from the top navigation bar.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="p-6 sm:p-8 bg-slate-50 space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                Select Operational Role:
              </h2>
              <span className="text-xs font-bold text-blue-800 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" /> Switch roles anytime from top bar
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Choose an initial role to launch your session. You can switch to any other role at any time.
            </p>
          </div>

          {/* 3 Clean Simplified Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleOptions.map((opt) => {
              const isSelected = selectedRole === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedRole(opt.id)}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between bg-surface ${
                    isSelected
                      ? 'border-blue-600 ring-4 ring-blue-100 shadow-lg bg-blue-50/20'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-md shadow-subtle'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {opt.icon}
                        <div>
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${opt.badgeColor}`}
                          >
                            {opt.badge}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 mt-1">{opt.title}</h3>
                        </div>
                      </div>

                      {/* Selection Radio Dot */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-600 text-white scale-110 shadow-sm' 
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{opt.subtitle}</p>
                  </div>

                  {/* Selected Indicator Ribbon */}
                  {isSelected && (
                    <div className="mt-4 pt-3 border-t border-blue-200/80 flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>Role Selected</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Confirmation Action */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 flex-shrink-0 mt-0.5">
                <ArrowLeftRight className="w-5 h-5 text-blue-800" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-blue-950 text-sm">Operational Terminal Access</h4>
                <p className="text-blue-800 mt-0.5 leading-relaxed">
                  Notice: You are entering as your selected role. You can freely switch between all 3 roles at any time using the Role Switcher in the top navigation bar.
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmRole}
              disabled={!selectedRole}
              className={`w-full sm:w-auto px-7 py-3.5 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0 whitespace-nowrap ${
                selectedRole
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-98 ring-4 ring-blue-200'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-400/40'
              }`}
            >
              <span>
                {selectedOpt
                  ? `Enter Platform as ${selectedOpt.badge} →`
                  : 'Select a Role Above to Continue'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
