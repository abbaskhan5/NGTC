import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Filter, ShieldAlert, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { api } from '../../services/api.js';
import { Vehicle } from '../../types/index.js';

export const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New vehicle form
  const [formData, setFormData] = useState({
    vehicleNumber: 'BUS-1025',
    plateNumber: '1025 KSA',
    vehicleType: 'Coach Bus',
    make: 'Mercedes-Benz',
    model: 'Travego 15 RHD',
    year: '2025',
    vin: 'WDB64901025X892',
    color: 'NGTC Pearl Green',
    fuelType: 'Diesel',
    currentMileage: '12000',
    branchId: 'br-riyadh',
    businessUnitId: 'bu-university',
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await api.getVehicles({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        vehicleType: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined,
      });
      setVehicles(data.items);
      setBranches(data.branches || []);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.createVehicle(formData);
      setShowRegisterModal(false);
      fetchVehicles();
    } catch (err: any) {
      setFormError(err.message || 'Error registering vehicle');
    }
  };

  const handleStatusChange = async (vehicle: Vehicle, nextStatus: any) => {
    try {
      await api.updateVehicle(vehicle.id, { status: nextStatus });
      fetchVehicles();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-400" />
            <span>NGTC Enterprise Fleet Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status, registration, insurance compliance, and project allocation for all vehicles
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Vehicle</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by vehicle ID, Saudi plate, make, model, or driver..."
            className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 ps-9 pe-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active In Service</option>
            <option value="idle">Idle / Standby</option>
            <option value="maintenance">In Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="Coach Bus">Coach Bus</option>
            <option value="School Bus">School Bus</option>
            <option value="Minibus">Minibus</option>
            <option value="Heavy Truck">Heavy Truck</option>
            <option value="Van">Van</option>
            <option value="Sedan">Sedan</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Vehicle ID</th>
                <th className="px-4 py-3">Plate (KSA)</th>
                <th className="px-4 py-3">Type & Make</th>
                <th className="px-4 py-3">Assigned Driver</th>
                <th className="px-4 py-3">Project / Route</th>
                <th className="px-4 py-3">Mileage</th>
                <th className="px-4 py-3">Insurance Expiry</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-end">Dispatch State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {vehicles.map((v) => {
                const isExpiringSoon =
                  new Date(v.insuranceExpiry).getTime() - Date.now() < 30 * 86400000;

                return (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-emerald-400">
                      {v.vehicleNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded border border-slate-700 bg-slate-950 px-2 py-0.5 font-mono text-[11px] text-white">
                        {v.plateNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">
                        {v.make} {v.model}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {v.vehicleType} · {v.year}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                      {v.assignedDriverName || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                      {v.projectName || 'Standby Reserve'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-300 tabular-nums">
                      {v.currentMileage.toLocaleString()} km
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono">
                      <span
                        className={
                          isExpiringSoon ? 'text-rose-400 font-bold' : 'text-slate-400'
                        }
                      >
                        {v.insuranceExpiry}
                      </span>
                      {isExpiringSoon && (
                        <span className="ms-1.5 text-[10px] font-bold text-rose-400 uppercase">
                          ! Due
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                          v.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : v.status === 'idle'
                            ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                            : v.status === 'maintenance'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-end">
                      <select
                        value={v.status}
                        onChange={(e) => handleStatusChange(v, e.target.value)}
                        className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="active">Set Active</option>
                        <option value="idle">Set Idle</option>
                        <option value="maintenance">Set Maintenance</option>
                        <option value="inactive">Set Inactive</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Vehicle Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Register New Vehicle / Bus
            </h3>

            {formError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 p-2.5 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Vehicle ID</label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Saudi Plate Number</label>
                  <input
                    type="text"
                    required
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="Coach Bus">Coach Bus</option>
                    <option value="School Bus">School Bus</option>
                    <option value="Minibus">Minibus</option>
                    <option value="Heavy Truck">Heavy Truck</option>
                    <option value="Van">Van</option>
                    <option value="Sedan">Sedan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Make</label>
                  <input
                    type="text"
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Model Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">VIN Number</label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Current Mileage (km)</label>
                  <input
                    type="number"
                    value={formData.currentMileage}
                    onChange={(e) => setFormData({ ...formData, currentMileage: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 font-semibold text-slate-950 hover:bg-emerald-500"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
