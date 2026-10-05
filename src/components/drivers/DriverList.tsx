import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Filter, ShieldAlert, Award, Phone } from 'lucide-react';
import { api } from '../../services/api.js';
import { Driver } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';

export const DriverList: React.FC = () => {
  const { can } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '+966 50 ',
    nationality: 'Saudi',
    iqamaNumber: '24',
    licenseNumber: 'SA-LIC-',
    licenseType: 'Public Bus',
    branchId: 'br-riyadh',
  });

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await api.getDrivers({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      });
      setDrivers(data.items);
    } catch (err) {
      console.error('Failed to load drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrivers();
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.createDriver(formData);
      setShowOnboardModal(false);
      fetchDrivers();
    } catch (err: any) {
      setFormError(err.message || 'Error onboarding driver');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-400" />
            <span>Captain & Driver Operations Roster</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracking Saudi commercial driving licenses, Iqama validity, medical clearances, and safety records
          </p>
        </div>

        {can('drivers.create') ? (
          <button
            onClick={() => setShowOnboardModal(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard New Driver</span>
          </button>
        ) : (
          <div className="rounded-lg bg-slate-800/80 border border-slate-700 px-3 py-1.5 text-xs font-mono text-slate-400">
            Read-Only Access
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search driver by name, code (DRV-101), Iqama, or vehicle..."
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
            <option value="active">Active On Duty</option>
            <option value="on_leave">On Leave</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Driver Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Driver Code & Name</th>
                <th className="px-4 py-3">License & Type</th>
                <th className="px-4 py-3">Iqama / ID Number</th>
                <th className="px-4 py-3">Assigned Vehicle</th>
                <th className="px-4 py-3">Active Project</th>
                <th className="px-4 py-3">License Expiry</th>
                <th className="px-4 py-3">Safety Score</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {drivers.map((d) => {
                const isLicenseExpiring =
                  new Date(d.licenseExpiry).getTime() - Date.now() < 30 * 86400000;

                return (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-white">{d.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {d.driverCode} · {d.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-slate-200 font-medium">{d.licenseType}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{d.licenseNumber}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-300">
                      {d.iqamaNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {d.assignedVehicleNumber ? (
                        <span className="font-mono font-bold text-emerald-400">
                          {d.assignedVehicleNumber}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                      {d.assignedProjectName || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono">
                      <span className={isLicenseExpiring ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {d.licenseExpiry}
                      </span>
                      {isLicenseExpiring && (
                        <span className="ms-1.5 text-[10px] font-bold text-rose-400 uppercase">
                          ! Due
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="font-mono font-bold text-slate-100">{d.performanceScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                          d.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : d.status === 'on_leave'
                            ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                            : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Driver Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Onboard Captain / Driver
            </h3>

            {formError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 p-2.5 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Faisal Al-Otaibi"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Saudi Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Iqama / National ID</label>
                  <input
                    type="text"
                    required
                    value={formData.iqamaNumber}
                    onChange={(e) => setFormData({ ...formData, iqamaNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">License Number</label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">License Category</label>
                  <select
                    value={formData.licenseType}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="Public Bus">Public Bus</option>
                    <option value="Heavy Vehicle">Heavy Vehicle</option>
                    <option value="Light Commercial">Light Commercial</option>
                    <option value="Heavy Equipment">Heavy Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nationality</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 font-semibold text-slate-950 hover:bg-emerald-500"
                >
                  Confirm Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
