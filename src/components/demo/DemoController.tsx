import React from 'react';
import { 
  Sparkles, 
  Waves, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ExternalLink,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { Modal } from '../common/Modal';

interface DemoControllerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoController: React.FC<DemoControllerProps> = ({ isOpen, onClose }) => {
  const { runScenario } = useDisaster();

  const handleRun = (scenario: 'flood_surge' | 'resolve_104' | 'govt_outage' | 'reset_all') => {
    runScenario(scenario);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Emergency Operations Drill Simulator"
      subtitle="Operational training scenarios for situational awareness and disaster coordination"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        <p className="text-slate-600 leading-relaxed">
          Use these preset scenarios to test the end-to-end <strong>Detect → Verify → Map → Prioritize → Respond → Coordinate</strong> operational loop across district networks.
        </p>

        {/* Scenario 1: Flood Surge */}
        <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2 hover:border-red-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-red-600" />
              <h4 className="text-sm font-bold text-slate-900">Scenario 1: Rapid Flash Flood Surge</h4>
            </div>
            <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded uppercase">
              Surge Event
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Simulates a sudden cloudburst along the Sabarmati basin. Injects 2 critical citizen SOS beacons (Civil hospital transit ward and Nehru Bridge) with audio alerts and map pins.
          </p>
          <button
            onClick={() => handleRun('flood_surge')}
            className="w-full mt-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg shadow-sm transition-colors text-xs"
          >
            Trigger Flash Flood Surge →
          </button>
        </div>

        {/* Scenario 2: Complete Operational Loop */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">Scenario 2: Complete Incident #104 Response</h4>
            </div>
            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded uppercase">
              Full Loop
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Demonstrates mission completion: Advances Incident #104 from IN PROGRESS to RESOLVED and automatically releases Ambulance 02 and Rescue Team 4 back into the Available pool.
          </p>
          <button
            onClick={() => handleRun('resolve_104')}
            className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg shadow-sm transition-colors text-xs"
          >
            Mark Incident #104 Evacuation Resolved →
          </button>
        </div>

        {/* Scenario 3: Govt API Outage Resiliency */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">Scenario 3: External Feed Outage Resiliency</h4>
            </div>
            <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded uppercase">
              Fault Tolerance
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Simulates Government API server timeout (HTTP 503). Proves that the platform gracefully falls back to local sensor caches and citizen reporting without crashing.
          </p>
          <button
            onClick={() => handleRun('govt_outage')}
            className="w-full mt-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg shadow-sm transition-colors text-xs"
          >
            Simulate Government Feed Outage →
          </button>
        </div>

        {/* Scenario 4: Reset Baseline */}
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-800">Reset Demo State</div>
            <p className="text-[11px] text-slate-500">Restore clean initial Ahmedabad flood mock data</p>
          </div>
          <button
            onClick={() => handleRun('reset_all')}
            className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300 text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset All
          </button>
        </div>
      </div>
    </Modal>
  );
};
