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
  const { user } = useAuth();
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

  return (
    <div className="space-y-6">
      {/* Top Greeting & Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t('goodMorning')}, {user?.name || 'Director'}
            </h1>
            <span className="rounded bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-400">
              {user?.roleName || 'Executive'}
            </span>
            {systemStatus?.database?.provider === 'mongodb-atlas' ? (
              <span className="rounded bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
                MongoDB Atlas: Active
              </span>
            ) : systemStatus?.database?.ipWhitelistHelp ? (
              <span
                title="To connect directly to MongoDB Atlas, add 0.0.0.0/0 to Network Access in your Atlas dashboard"
                className="rounded bg-amber-950 border border-amber-500/30 px-2 py-0.5 text-[11px] font-mono text-amber-400 cursor-help"
              >
                Database: In-Memory (Atlas IP Whitelist Required)
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Saturday, 3 October 2026 · Operations Center: {user?.branchName || 'Riyadh Central HQ'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSeed}
            title="Reset dev database with full Saudi enterprise data"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>

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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('kpiTotalVehicles')}
          value={kpis.totalVehicles}
          subtext={`${kpis.activeVehicles} in active transit`}
          icon={Truck}
          highlightColor="emerald"
          trend={{ value: '94% Availability', isPositive: true }}
          onClick={() => onNavigateTab('fleet-vehicles')}
        />

        <StatCard
          label={t('kpiTotalDrivers')}
          value={kpis.totalDrivers}
          subtext={`${kpis.activeDrivers} on duty today`}
          icon={UserCheck}
          highlightColor="blue"
          trend={{ value: '100% Medical Valid', isPositive: true }}
          onClick={() => onNavigateTab('drivers')}
        />

        <StatCard
          label={t('kpiTripsToday')}
          value={kpis.tripsToday}
          subtext={`${kpis.completedTripsToday} completed · ${kpis.runningTripsToday} running`}
          icon={Bus}
          highlightColor="purple"
          trend={{ value: `${kpis.completedTripsToday} / ${kpis.tripsToday} Done`, isPositive: true }}
          onClick={() => onNavigateTab('trips')}
        />

        <StatCard
          label={t('kpiActiveContracts')}
          value={kpis.activeContracts}
          subtext={`${kpis.activeProjects} active client projects`}
          icon={Building}
          highlightColor="amber"
          trend={{ value: `${(kpis.totalMonthlyRevenueSAR / 1000000).toFixed(1)}M SAR/mo`, isPositive: true }}
          onClick={() => onNavigateTab('contracts')}
        />
      </div>

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

      {/* Charts Grid: Revenue/Expenses vs Fleet Distribution vs Daily Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyFinancials} />
        </div>
        <div>
          <FleetStatusChart distribution={fleetStatusDistribution} />
        </div>
      </div>

      {/* Secondary Operational Row: Daily Trip Status & Urgent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TripStatusBreakdown distribution={tripStatusDistribution} />
        <AlertsPanel
          alerts={urgentAlerts}
          onMarkRead={handleMarkAlertRead}
          onNavigateToEntity={() => onNavigateTab('fleet-vehicles')}
        />
      </div>

      {/* Recent Activity Audit Trail */}
      <RecentActivityFeed
        activities={recentActivities}
        onViewAll={() => onNavigateTab('audit-logs')}
      />
    </div>
  );
};
