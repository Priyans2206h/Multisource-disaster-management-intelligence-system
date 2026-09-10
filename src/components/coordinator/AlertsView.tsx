import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Send,
  Eye
} from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';
import { AlertBanner } from '../common/AlertBanner';
import { Modal } from '../common/Modal';
import { DisasterCategory } from '../../types';

export const AlertsView: React.FC = () => {
  const { alerts, publishAlert } = useDisaster();

  // 3-Step Review & Publish Flow: 1 = Create, 2 = Review, 3 = Confirm
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [disasterType, setDisasterType] = useState<DisasterCategory>('Flood');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'>('CRITICAL');
  const [geographicArea, setGeographicArea] = useState<string>('Ahmedabad Municipal Area & Riverfront');
  const [instructions, setInstructions] = useState<string>(
    '1. Evacuate low-lying riverfront zones immediately.\n2. Do not cross submerged road underpasses.\n3. Keep phone lines open for rescue services.'
  );
  const [expiresHours, setExpiresHours] = useState<number>(6);

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const pastAlerts = alerts.filter((a) => a.status !== 'ACTIVE');

  const handlePublish = () => {
    const now = new Date();
    const expiryTime = new Date(now.getTime() + expiresHours * 60 * 60 * 1000);
    const expiresAt = expiryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    publishAlert({
      title,
      message,
      disasterType,
      severity,
      geographicArea,
      instructions,
      issuedBy: 'Riya Sharma, District Disaster Authority',
      expiresAt,
    });

    setIsComposerOpen(false);
    setStep(1);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-background">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Emergency Public Alerts</h2>
        </div>

        <button
          onClick={() => {
            setStep(1);
            setIsComposerOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Compose Official Alert
        </button>
      </div>

      {/* Active Alerts Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Active Broadcasts ({activeAlerts.length})
          </h3>
        </div>

        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <AlertBanner key={alert.id} alert={alert} />
          ))}
        </div>
      </div>

      {/* Past / Expired Alerts */}
      {pastAlerts.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Archived / Expired Alerts ({pastAlerts.length})
          </h3>
          <div className="space-y-2 opacity-60">
            {pastAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-100 border border-slate-200 p-3 rounded-lg text-xs flex justify-between"
              >
                <div>
                  <div className="font-bold text-slate-700">{alert.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Area: {alert.geographicArea} • Issued {alert.issuedAt}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5 bg-slate-200 rounded self-center">
                  EXPIRED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Step Review & Publish Modal (Enforcing design.MD & PRD safety rule) */}
      <Modal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        title="Compose Official Emergency Broadcast"
        subtitle={`Step ${step} of 3 — Controlled Official Broadcast Verification`}
        maxWidth="lg"
      >
        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              1
            </span>
            <span className={`text-xs font-bold ${step === 1 ? 'text-blue-700' : 'text-slate-500'}`}>
              Create Alert
            </span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2
                  ? 'bg-blue-600 text-white'
                  : step > 2
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </span>
            <span className={`text-xs font-bold ${step === 2 ? 'text-blue-700' : 'text-slate-500'}`}>
              Review Formatting
            </span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              3
            </span>
            <span className={`text-xs font-bold ${step === 3 ? 'text-red-700' : 'text-slate-500'}`}>
              Confirm Publish
            </span>
          </div>
        </div>

        {/* Step 1: Create */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Official Alert Headline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. OFFICIAL EMERGENCY ALERT — FLOOD WARNING"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Severity Level *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO')}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
                >
                  <option value="CRITICAL">Critical (Life Safety)</option>
                  <option value="HIGH">High (Urgent Attention)</option>
                  <option value="MEDIUM">Medium (Precautionary)</option>
                  <option value="INFO">Informational</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Disaster Type *
                </label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value as DisasterCategory)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
                >
                  <option value="Flood">Flood</option>
                  <option value="Fire">Fire</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Building Collapse">Building Collapse</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Target Geographic Area *
              </label>
              <input
                type="text"
                required
                value={geographicArea}
                onChange={(e) => setGeographicArea(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Public Alert Message Body *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain the emergency threat clearly in 2-3 sentences..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Mandatory Citizen Instructions *
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-[11px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!title.trim() || !message.trim()}
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-blue-600 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-sm"
              >
                Next: Review Format →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review Preview */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span><strong>Live Citizen Preview:</strong> Verify how this official alert will appear on all
              citizen mobile devices and public displays:</span>
            </div>

            <AlertBanner
              alert={{
                id: 'PREVIEW-ALERT',
                title,
                message,
                disasterType,
                severity,
                geographicArea,
                instructions,
                issuedBy: 'Riya Sharma, District Disaster Authority',
                issuedAt: 'Now',
                expiresAt: `In ${expiresHours} hours`,
                status: 'ACTIVE',
              }}
            />

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
              >
                ← Back to Edit
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Proceed to Final Confirmation →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Explicit Final Confirmation (Mandated by design.MD Section 15 & 28) */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl space-y-2 text-red-950">
              <div className="flex items-center gap-2 font-black text-sm text-red-700">
                <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                <span>CONFIRM OFFICIAL EMERGENCY BROADCAST</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                Publishing an official emergency alert is an authorized operational decision. Once confirmed,
                this warning will immediately dispatch to all citizen terminals in{' '}
                <strong>{geographicArea}</strong>.
              </p>
              <div className="text-[11px] bg-white/90 p-2.5 rounded border border-red-200 font-semibold space-y-1">
                <div>• Headline: <strong>{title}</strong></div>
                <div>• Severity: <strong className="text-red-600">{severity}</strong></div>
                <div>• Expires In: <strong>{expiresHours} hours</strong></div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-4 h-4" /> Confirm & Broadcast Now
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
