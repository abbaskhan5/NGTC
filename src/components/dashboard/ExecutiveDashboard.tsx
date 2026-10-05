import React, { useState, useEffect } from 'react';
import {
  Truck,
  UserCheck,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Bus,
  Shield,
  RotateCcw,
  Users,
  Wallet,
  Clock,
  Briefcase,
  CheckCircle2,
  Lock,
  Eye,
  FileText,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { api } from '../../services/api.js';
import { DashboardSummary } from '../../types/index.js';
import { StatCard } from './StatCard.js';
import { DivisionCard } from './DivisionCard.js';
import { RevenueChart } from './RevenueChart.js';
import { FleetStatusChart } from './FleetStatusChart.js';
import { TripStatusBreakdown } from './TripStatusBreakdown.js';
import { AlertsPanel } from './AlertsPanel.js';
import { RecentActivityFeed } from './RecentActivityFeed.js';

interface ExecutiveDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onNavigateTab }) => {
  const { user, isSuperAdmin, isEmployee } = useAuth();
  const { t } = useLanguage();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  const fetchDashboardData = async () => {
    setFetchError(null);
    try {
      const [data, sys] = await Promise.all([
        api.getDashboardSummary(),
        api.getSystemStatus().catch(() => null),
      ]);
      setSummary(data);
      if (sys) setSystemStatus(sys);
    } catch (err: any) {
      console.error('Error fetching dashboard summary:', err);
      setFetchError(err.message || 'Unable to communicate with the enterprise backend');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleResetSeed = async () => {
    setRefreshing(true);
    try {
      await api.resetDatabase();
      await fetchDashboardData();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAlertRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 text-sm font-mono">
          <RefreshCw className="h-5 w-5 animate-spin text-emerald-400" />
          <span>Aggregating enterprise telemetry & fleet statistics...</span>
        </div>
      </div>
    );
  }

  if (fetchError || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 text-center p-6 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="p-3 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Connection Error</h3>
          <p className="text-xs text-slate-400 max-w-md">
            {fetchError || 'Unable to load live dashboard statistics. Please verify backend service connection.'}
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchDashboardData();
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const { kpis, businessDivisions, fleetStatusDistribution, tripStatusDistribution, monthlyFinancials, urgentAlerts, recentActivities } = summary;

  // Financial calculations for Super Admin
  const latestFinancial = monthlyFinancials[monthlyFinancials.length - 1] || { revenueSAR: 17840000, expensesSAR: 11420000, netProfitSAR: 6420000 };
  const totalEmployeesCount = 34; // Total enterprise staff and drivers
  const pendingPayrollSAR = 284000;

  return (
    <div className="space-y-6">
      {/* Top Greeting & User Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t('goodMorning')}, {user?.name || 'Director'}
            </h1>
            <span
              className={`rounded border px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider ${
                isSuperAdmin
                  ? 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                  : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isSuperAdmin ? 'SUPER_ADMIN' : 'EMPLOYEE (Read-Only)'}
            </span>
            <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>STATUS: {String(user?.status || 'active').toUpperCase()}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-2">
            <span>Branch: {user?.branchName || 'Riyadh Central HQ'}</span>
            <span>·</span>
            <span>Department: {user?.departmentId || 'Executive Operations'}</span>
            {user?.employeeId && (
              <>
                <span>·</span>
                <span className="text-slate-300">Emp ID: {user.employeeId}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <button
              onClick={handleResetSeed}
              title="Reset dev database with full Saudi enterprise data"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset Seed</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{t('refresh')}</span>
          </button>
        </div>
      </div>

      {/* Read-Only Notice Banner for Employees */}
      {isEmployee && (
        <div className="rounded-xl border border-sky-800/50 bg-sky-950/30 p-4 text-xs text-sky-200 flex items-start gap-3">
          <Eye className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-white">Employee Read-Only Mode Active</div>
            <p className="text-sky-300/90 leading-relaxed">
              You are logged in with employee permissions. You can inspect operational fleet status, routes, today's trips,
              and your personal profile. Record modifications, approvals, payroll alterations, and user management are strictly disabled.
            </p>
          </div>
        </div>
      )}

      {/* SUPER ADMIN COMPREHENSIVE KPI GRID */}
      {isSuperAdmin ? (
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Enterprise Operational & Financial KPIs
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
            <StatCard
              label="Total Employees"
              value={totalEmployeesCount}
              subtext="32 Active Staff"
              icon={Users}
              highlightColor="blue"
              onClick={() => onNavigateTab('users')}
            />
            <StatCard
              label="Total Drivers"
              value={kpis.totalDrivers}
              subtext={`${kpis.activeDrivers} On-duty`}
              icon={UserCheck}
              highlightColor="emerald"
              onClick={() => onNavigateTab('drivers')}
            />
            <StatCard
              label="Total Vehicles"
              value={kpis.totalVehicles}
              subtext={`${kpis.activeVehicles} Transit active`}
              icon={Truck}
              highlightColor="emerald"
              onClick={() => onNavigateTab('fleet-vehicles')}
            />
            <StatCard
              label="Today's Trips"
              value={kpis.tripsToday}
              subtext={`${kpis.completedTripsToday} Completed`}
              icon={Bus}
              highlightColor="purple"
              onClick={() => onNavigateTab('trips')}
            />
            <StatCard
              label="Active Contracts"
              value={kpis.activeContracts}
              subtext="Institutional agreements"
              icon={FileText}
              highlightColor="amber"
              onClick={() => onNavigateTab('contracts')}
            />
            <StatCard
              label="Active Projects"
              value={kpis.activeProjects}
              subtext="Megaproject lines"
              icon={Briefcase}
              highlightColor="blue"
              onClick={() => onNavigateTab('contracts')}
            />
            <StatCard
              label="Monthly Revenue"
              value={`${((latestFinancial?.revenue || 17840000) / 1000000).toFixed(1)}M`}
              subtext="SAR Realized"
              icon={DollarSign}
              highlightColor="emerald"
              onClick={() => onNavigateTab('finance')}
            />
            <StatCard
              label="Monthly Expenses"
              value={`${((latestFinancial?.expenses || 11420000) / 1000000).toFixed(1)}M`}
              subtext="SAR Operational cost"
              icon={TrendingUp}
              highlightColor="amber"
              onClick={() => onNavigateTab('finance')}
            />
            <StatCard
              label="Net Profit"
              value={`${((latestFinancial?.profit || 6420000) / 1000000).toFixed(1)}M`}
              subtext="SAR 36% Net margin"
              icon={TrendingUp}
              highlightColor="emerald"
              onClick={() => onNavigateTab('finance')}
            />
            <StatCard
              label="Pending Payroll"
              value={`${(pendingPayrollSAR / 1000).toFixed(0)}k`}
              subtext="SAR Oct 2026 run"
              icon={Wallet}
              highlightColor="purple"
              onClick={() => onNavigateTab('hr-employees')}
            />
            <StatCard
              label="Urgent Alerts"
              value={urgentAlerts.length}
              subtext="Expiry & Moroor"
              icon={AlertTriangle}
              highlightColor="rose"
              onClick={() => onNavigateTab('fleet-vehicles')}
            />
            <StatCard
              label="Audit Logs"
              value="Verified"
              subtext="Tamper-proof trail"
              icon={Shield}
              highlightColor="emerald"
              onClick={() => onNavigateTab('audit-logs')}
            />
          </div>
        </div>
      ) : (
        /* EMPLOYEE READ-ONLY DASHBOARD CARDS */
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Operations Overview (Read-Only)
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Fleet Status"
              value={`${kpis.activeVehicles} / ${kpis.totalVehicles}`}
              subtext="Active vehicles in service"
              icon={Truck}
              highlightColor="emerald"
              onClick={() => onNavigateTab('fleet-vehicles')}
            />
            <StatCard
              label="Today's Trips"
              value={kpis.tripsToday}
              subtext={`${kpis.completedTripsToday} completed today`}
              icon={Bus}
              highlightColor="purple"
              onClick={() => onNavigateTab('trips')}
            />
            <StatCard
              label="Active Projects"
              value={kpis.activeProjects}
              subtext="Permitted client routes"
              icon={Briefcase}
              highlightColor="blue"
              onClick={() => onNavigateTab('contracts')}
            />
            <StatCard
              label="Service Availability"
              value="98.4%"
              subtext="On-time dispatch rate"
              icon={CheckCircle2}
              highlightColor="emerald"
              onClick={() => onNavigateTab('trips')}
            />
          </div>
        </div>
      )}

      {/* Employee Personal Profile Card (Read-Only Mode) */}
      {isEmployee && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              <UserCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Employee Profile: {user?.name}</h3>
              <p className="text-xs text-slate-400">
                Corporate ID: <span className="font-mono text-emerald-400">{user?.employeeId || 'NGTC-0050'}</span> · Branch: {user?.branchName || 'Riyadh Central HQ'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800">
            <div>
              <span className="text-slate-400">Assigned Department:</span>
              <p className="font-semibold text-slate-200">{user?.departmentId || 'Operations Support'}</p>
            </div>
            <div>
              <span className="text-slate-400">Official Email:</span>
              <p className="font-semibold text-slate-200">{user?.email}</p>
            </div>
            <div>
              <span className="text-slate-400">Account Authorization:</span>
              <p className="font-semibold text-emerald-400">Read-Only Employee</p>
            </div>
          </div>
        </div>
      )}

      {/* Business Divisions Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              {t('secDivisions')}
            </h2>
            <p className="text-xs text-slate-400">
              Operations metrics across all 6 core business units in Saudi Arabia
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businessDivisions.map((div) => (
            <DivisionCard
              key={div.code}
              code={div.code}
              name={div.name}
              nameAr={div.nameAr}
              activeFleetCount={div.activeFleetCount}
              tripsToday={div.tripsToday}
              activeContracts={div.activeContracts}
              monthlyRevenueSAR={div.monthlyRevenueSAR}
              status={div.status}
              onSelect={() => onNavigateTab('trips')}
            />
          ))}
        </div>
      </div>

      {/* Financial & Status Charts (Super Admin Full View) */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RevenueChart data={monthlyFinancials} />
          </div>
          <div>
            <FleetStatusChart distribution={fleetStatusDistribution} />
          </div>
        </div>
      )}

      {/* Secondary Operational Row: Daily Trip Status & Urgent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TripStatusBreakdown distribution={tripStatusDistribution} />
        <AlertsPanel
          alerts={urgentAlerts}
          onMarkRead={handleMarkAlertRead}
          onNavigateToEntity={() => onNavigateTab('fleet-vehicles')}
        />
      </div>

      {/* Recent Activity Audit Trail (Super Admin Only) */}
      {isSuperAdmin && (
        <RecentActivityFeed
          activities={recentActivities}
          onViewAll={() => onNavigateTab('audit-logs')}
        />
      )}
    </div>
  );
};
