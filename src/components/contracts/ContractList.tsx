import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Calendar, Building, DollarSign } from 'lucide-react';
import { api } from '../../services/api.js';
import { Contract } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';

export const ContractList: React.FC = () => {
  const { can } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    customerName: '',
    contractType: 'University',
    contractValueSAR: '15000000',
    billingCycle: 'Monthly',
    branchId: 'br-riyadh',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2028-12-31',
    vehiclesAllocated: '20',
  });

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await api.getContracts({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        contractType: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined,
      });
      setContracts(data.items);
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContracts();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.createContract(formData);
      setShowCreateModal(false);
      fetchContracts();
    } catch (err: any) {
      setFormError(err.message || 'Error executing contract');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <span>Commercial Contracts & Multi-Project Engagements</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Institutional contracts for universities, schools, royal commissions, and mega-projects across Saudi Arabia
          </p>
        </div>

        {can('contracts.create') ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Enterprise Contract</span>
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
            placeholder="Search by contract number (CNT-2025), customer name, or title..."
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
            <option value="active">Active Svc</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="pending_approval">Pending Approval</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="University">University</option>
            <option value="School">School</option>
            <option value="Labor">Labor</option>
            <option value="Corporate">Corporate</option>
            <option value="Construction">Construction</option>
          </select>
        </div>
      </div>

      {/* Contract Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Contract Ref & Title</th>
                <th className="px-4 py-3">Client / Institution</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Allocated Fleet</th>
                <th className="px-4 py-3">Contract Value (SAR)</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-white">{c.title}</div>
                    <div className="text-[11px] text-emerald-400 font-mono font-medium">
                      {c.contractNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-200">
                    {c.customerName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 font-mono text-[11px] text-slate-300">
                      {c.contractType}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                    {c.branchName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                    {c.startDate} → {c.endDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-200 tabular-nums">
                    {c.vehiclesAllocated} buses
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-emerald-400 tabular-nums">
                    {c.contractValueSAR.toLocaleString()} SAR
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        c.status === 'active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : c.status === 'expiring_soon'
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Contract Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Execute New Enterprise Contract
            </h3>

            {formError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 p-2.5 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Contract Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Princess Nourah University Campus Transit"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Customer / Entity Name</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Princess Nourah Bint Abdulrahman University"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Division Type</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="University">University</option>
                    <option value="School">School</option>
                    <option value="Labor">Labor</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Construction">Construction</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total Value (SAR)</label>
                  <input
                    type="number"
                    required
                    value={formData.contractValueSAR}
                    onChange={(e) => setFormData({ ...formData, contractValueSAR: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 font-semibold text-slate-950 hover:bg-emerald-500"
                >
                  Confirm Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
