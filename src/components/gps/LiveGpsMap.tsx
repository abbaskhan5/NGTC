import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Bus, Truck, RefreshCw, Radio } from 'lucide-react';
import { api } from '../../services/api.js';
import { Vehicle } from '../../types/index.js';

export const LiveGpsMap: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filter, setFilter] = useState<'all' | 'moving' | 'idle' | 'stopped'>('all');

  const fetchFleet = async () => {
    try {
      const data = await api.getVehicles();
      setVehicles(data.items);
      if (data.items.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data.items[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFleet();
    const interval = setInterval(fetchFleet, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    if (filter === 'moving') return v.gpsStatus === 'moving';
    if (filter === 'idle') return v.gpsStatus === 'idle';
    if (filter === 'stopped') return v.gpsStatus === 'stopped';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span>Real-Time Fleet Telemetry & GPS Tracking</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulated high-frequency AVL stream across Riyadh, Jeddah, Dammam, and Makkah transit corridors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono text-emerald-400 font-semibold">LIVE STREAM ACTIVE</span>
        </div>
      </div>

      {/* Map + Vehicle Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visual Map Canvas Representation */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between min-h-[440px] relative overflow-hidden shadow-2xl">
          {/* Subtle Grid Canvas Background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Map Top Bar */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Saudi Arabia Regional Fleet Map (Zone: Riyadh Central)
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Active Coordinates: 24.7136° N, 46.6753° E
            </div>
          </div>

          {/* Simulated Geo Node Points */}
          <div className="relative z-10 my-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredVehicles.slice(0, 6).map((v, idx) => {
              const isSelected = selectedVehicle?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`cursor-pointer rounded-xl border p-3 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-white">{v.vehicleNumber}</span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        v.gpsStatus === 'moving'
                          ? 'bg-emerald-400 animate-pulse'
                          : v.gpsStatus === 'idle'
                          ? 'bg-sky-400'
                          : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono truncate">{v.plateNumber}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="capitalize">{v.gpsStatus}</span>
                    <span className="text-emerald-400 font-semibold">{v.speedKmh || 0} km/h</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Telemetry Summary */}
          {selectedVehicle && (
            <div className="relative z-10 rounded-lg border border-slate-800 bg-slate-900/90 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{selectedVehicle.vehicleNumber}</span>
                    <span className="text-slate-400 font-mono">({selectedVehicle.plateNumber})</span>
                    <span className="rounded bg-emerald-950 border border-emerald-500/30 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400 capitalize">
                      {selectedVehicle.gpsStatus}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Captain: {selectedVehicle.assignedDriverName || 'Unassigned'} · Project: {selectedVehicle.projectName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500">Speed:</span>{' '}
                  <span className="text-emerald-400 font-bold">{selectedVehicle.speedKmh || 0} km/h</span>
                </div>
                <div>
                  <span className="text-slate-500">Odometer:</span>{' '}
                  <span className="text-white font-bold">{selectedVehicle.currentMileage.toLocaleString()} km</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Tracking Vehicle List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Tracked Fleet ({filteredVehicles.length})
              </h3>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2 py-0.5 rounded ${
                    filter === 'all' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('moving')}
                  className={`px-2 py-0.5 rounded ${
                    filter === 'moving' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Moving
                </button>
                <button
                  onClick={() => setFilter('idle')}
                  className={`px-2 py-0.5 rounded ${
                    filter === 'idle' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Idle
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-[360px] overflow-y-auto">
              {filteredVehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between text-xs ${
                    selectedVehicle?.id === v.id ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white font-mono">{v.vehicleNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{v.plateNumber}</div>
                    </div>
                  </div>

                  <div className="text-end font-mono text-[11px]">
                    <span
                      className={`capitalize ${
                        v.gpsStatus === 'moving' ? 'text-emerald-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {v.gpsStatus}
                    </span>
                    <div className="text-[10px] text-slate-500">{v.speedKmh || 0} km/h</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center">
            GPS Gateway Provider: Socket.IO Architecture Ready
          </div>
        </div>
      </div>
    </div>
  );
};
