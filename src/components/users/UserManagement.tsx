import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Check, X, Building, Mail, Phone, Lock, KeyRound, AlertTriangle, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const UserManagement: React.FC = () => {
  const { isSuperAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState<any | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState('TempPass@2026');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    roleId: '',
    branchId: '',
    departmentId: 'Operations Support',
    employeeId: '',
    password: 'employee123',
    status: 'active',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
      setRoles(data.roles || []);
      setBranches(data.branches || []);
      setEmployees(data.employees || []);

      if (data.branches?.length > 0 && !formData.branchId) {
        setFormData((prev) => ({
          ...prev,
          branchId: data.branches[0].id,
        }));
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin]);

  // If unauthorized employee somehow navigates to /users:
  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border border-rose-800/40 bg-rose-950/20 p-8 text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="inline-flex p-3 rounded-full bg-rose-900/40 border border-rose-700/50 text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          HTTP 403 Forbidden — Access Denied
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          User management and access control configuration are strictly restricted to the <strong>Super Admin</strong>.
          Normal employee accounts operate in <strong>Read-Only</strong> mode and cannot inspect or alter system accounts.
        </p>
        <div className="text-xs font-mono text-rose-400/80 bg-rose-950/50 p-2.5 rounded border border-rose-900/40">
          RBAC Policy: [users.manage] required · Your Role: {currentUser?.roleName || 'Employee'}
        </div>
      </div>
    );
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.createUser(formData);
      setShowCreateModal(false);
      setActionSuccess(`Successfully created user account for ${formData.email}`);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'EMPLOYEE',
        roleId: '',
        branchId: branches[0]?.id || '',
        departmentId: 'Operations Support',
        employeeId: '',
        password: 'employee123',
        status: 'active',
      });
      fetchData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Error creating user account');
    }
  };

  const handleToggleStatus = async (userToUpdate: any) => {
    const nextStatus = userToUpdate.status === 'active' ? 'suspended' : 'active';
    try {
      await api.updateUserStatus(userToUpdate.id, nextStatus);
      setActionSuccess(`Account status updated to '${nextStatus}' for ${userToUpdate.email}`);
      fetchData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update account status');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetModal) return;
    try {
      await api.resetUserPassword(showResetModal.id, resetPasswordInput);
      setActionSuccess(`Password reset successfully for ${showResetModal.email}`);
      setShowResetModal(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleDeleteUser = async (userToDelete: any) => {
    if (userToDelete.email === 'admin@ngtc.sa') {
      alert('Cannot delete the primary root Super Admin account');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete user account for ${userToDelete.name} (${userToDelete.email})?`)) {
      return;
    }

    try {
      await api.deleteUser(userToDelete.id);
      setActionSuccess(`User account ${userToDelete.email} removed`);
      fetchData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            <span>Employee Accounts & Access Control (Super Admin)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create employee accounts, link personnel records, set temporary passwords, and control status
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-500/20"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create Employee Account</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">User & Linked Employee</th>
                <th className="px-4 py-3">Access Level</th>
                <th className="px-4 py-3">Branch Location</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3 text-end">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {users.map((u) => {
                const isSuper = u.role === 'SUPER_ADMIN' || u.roleName === 'Super Admin';
                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{u.employeeId || 'UNLINKED'}</span>
                        <span>·</span>
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-mono font-medium ${
                          isSuper
                            ? 'bg-purple-950/80 border-purple-500/40 text-purple-300 font-bold'
                            : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {isSuper ? 'SUPER_ADMIN' : 'EMPLOYEE (Read-Only)'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{u.branchName || 'Riyadh Central HQ'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {u.phone || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-end space-x-1.5">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.email === 'admin@ngtc.sa'}
                        title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                        className={`text-xs font-medium px-2 py-1 rounded border transition-colors disabled:opacity-30 ${
                          u.status === 'active'
                            ? 'border-amber-900/60 text-amber-400 hover:bg-amber-950'
                            : 'border-emerald-900/60 text-emerald-400 hover:bg-emerald-950'
                        }`}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => {
                          setShowResetModal(u);
                          setResetPasswordInput('TempPass@2026');
                        }}
                        title="Reset User Password"
                        className="text-xs font-medium px-2 py-1 rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        Reset Pass
                      </button>

                      {u.email !== 'admin@ngtc.sa' && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Delete Account"
                          className="text-xs font-medium px-1.5 py-1 rounded border border-rose-900/50 text-rose-400 hover:bg-rose-950"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Create Employee Account</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 p-2.5 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Abdullah Al-Harbi"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Corporate Email Address (Login) *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. abdullah@ngtc.sa"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Employee ID Link</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g. NGTC-0062"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+966 50 123 4567"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Access Level Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Read-Only)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Control)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Branch HQ *</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Temporary Password *</label>
                <div className="relative">
                  <Lock className="absolute start-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Temporary password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 ps-8 pe-3 py-2 text-white focus:outline-none focus:border-emerald-500"
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-emerald-400" />
                <span>Reset User Password</span>
              </h3>
              <button
                onClick={() => setShowResetModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Set a temporary password for <strong>{showResetModal.name}</strong> ({showResetModal.email}):
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">New Password</label>
                <input
                  type="text"
                  required
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="px-3 py-1 rounded border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 rounded bg-emerald-600 text-slate-950 font-semibold hover:bg-emerald-500"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
