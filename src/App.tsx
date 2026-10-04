import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider, useLanguage } from './context/LanguageContext.js';
import { TopBar } from './components/layout/TopBar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard.js';
import { VehicleList } from './components/fleet/VehicleList.js';
import { DriverList } from './components/drivers/DriverList.js';
import { ContractList } from './components/contracts/ContractList.js';
import { TripList } from './components/trips/TripList.js';
import { LiveGpsMap } from './components/gps/LiveGpsMap.js';
import { UserManagement } from './components/users/UserManagement.js';
import { AuditLogViewer } from './components/audit/AuditLogViewer.js';
import { GlobalSearchModal } from './components/search/GlobalSearchModal.js';
import { NotificationDrawer } from './components/notifications/NotificationDrawer.js';
import { LoginPage } from './components/auth/LoginPage.js';
import { api } from './services/api.js';
import { NotificationItem } from './types/index.js';
import {
  Menu,
  GraduationCap,
  Building2,
  HardHat,
  Plane,
  DollarSign,
  FolderOpen,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';

function MainAppShell() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useLanguage();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSearchResult = (category: string, item: any) => {
    if (category === 'vehicle') setCurrentTab('fleet-vehicles');
    else if (category === 'driver') setCurrentTab('drivers');
    else if (category === 'contract') setCurrentTab('contracts');
    else if (category === 'trip') setCurrentTab('trips');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Initializing NGTC ERP Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-3 text-slate-400 hover:text-white bg-slate-900 border-b border-slate-800"
            title="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <TopBar
              onOpenSearch={() => setSearchModalOpen(true)}
              onOpenNotifications={() => setNotificationDrawerOpen(true)}
              unreadNotificationsCount={unreadCount}
              currentPath={currentTab}
            />
          </div>
        </div>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {currentTab === 'dashboard' && (
              <ExecutiveDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />
            )}

            {currentTab === 'fleet-vehicles' && <VehicleList />}

            {currentTab === 'drivers' && <DriverList />}

            {currentTab === 'contracts' && <ContractList />}

            {currentTab === 'trips' && <TripList />}

            {currentTab === 'gps' && <LiveGpsMap />}

            {currentTab === 'users' && <UserManagement />}

            {currentTab === 'audit-logs' && <AuditLogViewer />}

            {/* Division Modules Overviews */}
            {currentTab === 'div-schools' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">School Transportation Division</h2>
                    <p className="text-xs text-slate-400">K-12 Student Daily Transit & Royal Commission Schools</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  Managing 30+ dedicated school buses operating daily across Riyadh North and Western districts.
                  Features parent SMS stop notifications, speed governor tracking, and student attendance check-ins.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('fleet-vehicles')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    <span>View School Buses</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentTab('trips')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-slate-950 hover:bg-emerald-500"
                  >
                    <span>View Today's Routes</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {currentTab === 'div-universities' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">University Transportation Division</h2>
                    <p className="text-xs text-slate-400">King Saud University & Princess Nourah Campus Transit</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  High-capacity 49-passenger luxury coach fleet serving university staff, medical colleges, and inter-campus passenger shuttles.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('contracts')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    <span>University Contracts</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentTab('trips')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-slate-950 hover:bg-emerald-500"
                  >
                    <span>Campus Trips</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {currentTab === 'div-construction' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                    <HardHat className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Construction Logistics Division</h2>
                    <p className="text-xs text-slate-400">Red Sea Global & NEOM Infrastructure Logistics</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  Heavy transport, MAN tipper trucks, equipment haulage, and site mobility for major infrastructure developments.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('fleet-vehicles')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-slate-950 hover:bg-emerald-500"
                  >
                    <span>Heavy Fleet Registry</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {currentTab === 'div-travel' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                    <Plane className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Travel Agency & Tourism Division</h2>
                    <p className="text-xs text-slate-400">Umrah, Hajj & Al-Ula VIP Tourism Operations</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  Custom luxury travel packages, holy site transfers, and corporate executive travel bookings.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('contracts')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-slate-950 hover:bg-emerald-500"
                  >
                    <span>Travel Agency Contracts</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {currentTab === 'finance' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Finance & Billing Management</h2>
                    <p className="text-xs text-slate-400">Saudi VAT (15%) Compliant Institutional Invoicing</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  Total Monthly Invoiced: <strong className="text-emerald-400 font-mono">17,840,000 SAR</strong> across King Saud University, Royal Commission, and Red Sea Global.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    <span>View Financial Charts</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {currentTab === 'documents' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                    <FolderOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Centralized Document Management</h2>
                    <p className="text-xs text-slate-400">Vehicle Istimara, MVPI, Driver Iqama, & Contracts</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  Automated expiry surveillance active. Identifies policies and certificates expiring in 7, 30, and 60 days.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setNotificationDrawerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-slate-950 hover:bg-emerald-500"
                  >
                    <span>View Document Expiry Alerts ({unreadCount})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {currentTab === 'reports' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Executive & Operations Reports</h2>
                    <p className="text-xs text-slate-400">Fleet Utilization, Fuel Costs, and SLA Performance</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  Comprehensive reporting on fleet uptime (94.2%), driver safety scores (92%), and client project profitability.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-slate-950 hover:bg-emerald-500"
                  >
                    <span>Return to Operations Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {currentTab === 'hr-employees' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Human Resources & Personnel</h2>
                    <p className="text-xs text-slate-400">Workforce Management, Iqama Renewals, & Payroll</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  NGTC workforce directory with Saudi nationalization tracking, driver medical fitness records, and branch staffing.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('drivers')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-slate-950 hover:bg-emerald-500"
                  >
                    <span>Manage Drivers Directory</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentTab('users')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    <span>System User Accounts</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Search Modal (⌘K) */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppShell />
      </AuthProvider>
    </LanguageProvider>
  );
}
