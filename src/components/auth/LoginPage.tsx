import React, { useState } from 'react';
import { Bus, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('admin@ngtc.sa');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleCode: string) => {
    setLoading(true);
    setError(null);
    try {
      await switchDemoRole(roleCode);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Super Admin', role: 'SUPER_ADMIN', email: 'admin@ngtc.sa', desc: 'Unrestricted enterprise control' },
    { label: 'CEO / General Mgr', role: 'GENERAL_MANAGER', email: 'manager@ngtc.sa', desc: 'Executive KPI oversight' },
    { label: 'Fleet Manager', role: 'FLEET_MANAGER', email: 'fleet@ngtc.sa', desc: 'Fleet maintenance & telemetry' },
    { label: 'Operations Mgr', role: 'OPERATIONS_MANAGER', email: 'operations@ngtc.sa', desc: 'Trips & school dispatch' },
    { label: 'Finance Manager', role: 'FINANCE_MANAGER', email: 'finance@ngtc.sa', desc: 'Client billing & P&L' },
    { label: 'Field Driver', role: 'DRIVER', email: 'driver@ngtc.sa', desc: 'Captain route updates' },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-slate-950 shadow-xl shadow-emerald-500/20">
            <Bus className="h-8 w-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">NGTC ERP</h1>
          <p className="text-xs text-slate-400">
            Enterprise Transport & Multi-Business Operations System · Saudi Arabia
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur">
          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ngtc.sa"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 ps-9 pe-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 ps-9 pe-9 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Persona Login (Seed Testing)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickDemo(acc.role)}
                  disabled={loading}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-start transition-colors"
                >
                  <div className="text-xs font-semibold text-slate-200">{acc.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Role-Based Access Control · Encrypted Session</span>
        </div>
      </div>
    </div>
  );
};
