import React from 'react';
import { Home, Users, Phone, MapPin, CheckCircle2, AlertTriangle, Plus, Minus, Check } from 'lucide-react';
import { useDisaster } from '../../store/disasterContext';

export const SheltersView: React.FC = () => {
  const { shelters, updateShelterOccupancy } = useDisaster();

  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const overallOccupancyPct = Math.round((totalOccupancy / totalCapacity) * 100);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-background">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Emergency Relief Shelters</h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold bg-surface border border-slate-200 p-2.5 rounded-xl shadow-subtle">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Evacuees Sheltered:</span>
            <span className="text-sm font-extrabold text-slate-900">
              {totalOccupancy} / {totalCapacity} ({overallOccupancyPct}%)
            </span>
          </div>
          <div className="w-24 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full ${overallOccupancyPct > 85 ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(overallOccupancyPct, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shelters.map((sh) => {
          const occPct = Math.round((sh.currentOccupancy / sh.capacity) * 100);
          const isFull = sh.status === 'FULL' || occPct >= 95;

          return (
            <div
              key={sh.id}
              className="bg-surface rounded-xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                {/* Status & Name */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      SHELTER #{sh.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">{sh.name}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isFull
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isFull ? 'CAPACITY FULL' : 'ADMITTING'}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{sh.locationName}</span>
                </div>

                {/* Occupancy Progress */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Occupancy</span>
                    <span className={isFull ? 'text-red-600' : 'text-slate-800'}>
                      {sh.currentOccupancy} / {sh.capacity} ({occPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occPct >= 95 ? 'bg-red-600' : occPct >= 75 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(occPct, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>Vacant Beds: {Math.max(0, sh.capacity - sh.currentOccupancy)}</span>
                    <span>Max: {sh.capacity}</span>
                  </div>
                </div>

                {/* Supplies Available */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Supplies on site:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sh.suppliesAvailable.map((sup, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-600 inline" />
                        <span>{sup}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>Desk Contact: <strong>{sh.contact}</strong></span>
                </div>
              </div>

              {/* Adjust Occupancy Buttons (Coordinator field tally simulator) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tally Evacuees:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateShelterOccupancy(sh.id, Math.max(0, sh.currentOccupancy - 10))}
                    className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600"
                    title="Subtract 10 evacuees"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-slate-700 px-2">{sh.currentOccupancy}</span>
                  <button
                    onClick={() => updateShelterOccupancy(sh.id, Math.min(sh.capacity, sh.currentOccupancy + 10))}
                    className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600"
                    title="Add 10 evacuees"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
