import React, { useState, useEffect } from 'react';
import { Bus, Search, Filter, Play, CheckCircle2, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { api } from '../../services/api.js';
import { Trip } from '../../types/index.js';

export const TripList: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await api.getTrips({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      });
      setTrips(data.items);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [statusFilter]);

  const handleUpdateStatus = async (tripId: string, nextStatus: string) => {
    try {
      await api.updateTripStatus(tripId, { status: nextStatus });
      fetchTrips();
    } catch (err) {
      console.error('Failed to update trip:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bus className="h-5 w-5 text-emerald-400" />
            <span>Daily Trip Dispatch & Live Route Execution</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Saturday, 3 October 2026 — Real-time tracking of passenger transit, school drops, and campus shuttles
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by trip number (TRP-2026), route, bus ID, or captain name..."
            className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 ps-9 pe-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Trip Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="running">En Route / Running</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
      </div>

      {/* Trips Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Trip Ref</th>
                <th className="px-4 py-3">Route & Destination</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Assigned Bus & Plate</th>
                <th className="px-4 py-3">Captain</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Passengers</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-end">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {trips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-emerald-400">
                    {t.tripNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-white">{t.routeName}</div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-emerald-400" />
                      <span>{t.currentLocationName || 'Departed Origin'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                    {t.projectName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-200">{t.vehicleNumber}</span>
                    <span className="text-slate-400 ms-1 font-mono text-[11px]">({t.vehiclePlate})</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-slate-200 font-medium">{t.driverName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{t.driverPhone}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-300">
                    {t.scheduledStart} → {t.scheduledEnd}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-200 tabular-nums">
                    {t.passengerCount} on board
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        t.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : t.status === 'running'
                          ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                          : t.status === 'delayed'
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-end">
                    {t.status === 'scheduled' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'running')}
                        className="rounded border border-sky-500/30 bg-sky-950/60 px-2 py-1 text-xs font-semibold text-sky-400 hover:bg-sky-900"
                      >
                        Start Trip
                      </button>
                    )}
                    {t.status === 'running' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'completed')}
                        className="rounded border border-emerald-500/30 bg-emerald-950/60 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-900"
                      >
                        Complete
                      </button>
                    )}
                    {t.status === 'completed' && (
                      <span className="text-[11px] text-slate-500 font-mono">Archived</span>
                    )}
                    {t.status === 'delayed' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'running')}
                        className="rounded border border-amber-500/30 bg-amber-950/60 px-2 py-1 text-xs font-semibold text-amber-400 hover:bg-amber-900"
                      >
                        Resume
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
