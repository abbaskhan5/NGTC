import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Bus,
  Truck,
  Users,
  UserCheck,
  GraduationCap,
  HardHat,
  Plane,
  DollarSign,
  FolderOpen,
  MapPin,
  BarChart3,
  Settings,
  ShieldCheck,
  History,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  titleKey: string;
  permission?: string;
  items: Array<{
    id: string;
    labelKey: string;
    icon: any;
    permission?: string;
    badge?: string;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { can, user } = useAuth();
  const { t, language } = useLanguage();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    main: true,
    transport: true,
    fleet: true,
    contracts: false,
    hr: false,
    settings: false,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const navSections: Array<{ id: string; title: string; items: any[] }> = [
    {
      id: 'main',
      title: 'OPERATIONS',
      items: [
        { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard, permission: 'dashboard.read' },
        { id: 'trips', label: t('navTrips'), icon: Bus, permission: 'trips.read', badge: 'Today' },
        { id: 'gps', label: t('navGPS'), icon: MapPin, permission: 'vehicles.read' },
      ],
    },
    {
      id: 'fleet',
      title: 'FLEET & DRIVERS',
      items: [
        { id: 'fleet-vehicles', label: t('navVehicles'), icon: Truck, permission: 'vehicles.read' },
        { id: 'drivers', label: t('navDrivers'), icon: UserCheck, permission: 'drivers.read' },
        { id: 'contracts', label: t('navContracts'), icon: FileText, permission: 'contracts.read' },
      ],
    },
    {
      id: 'divisions',
      title: 'BUSINESS DIVISIONS',
      items: [
        { id: 'div-schools', label: t('navSchoolTransport'), icon: GraduationCap, permission: 'projects.read' },
        { id: 'div-universities', label: t('navUniversityTransport'), icon: Building2, permission: 'projects.read' },
        { id: 'div-construction', label: t('navConstruction'), icon: HardHat, permission: 'projects.read' },
        { id: 'div-travel', label: t('navTravel'), icon: Plane, permission: 'projects.read' },
      ],
    },
    {
      id: 'enterprise',
      title: 'FINANCE & HR',
      items: [
        { id: 'finance', label: t('navFinance'), icon: DollarSign, permission: 'finance.read' },
        { id: 'hr-employees', label: t('navEmployees'), icon: Users, permission: 'employees.read' },
        { id: 'documents', label: t('navDocuments'), icon: FolderOpen, permission: 'vehicles.read' },
        { id: 'reports', label: t('navReports'), icon: BarChart3, permission: 'reports.read' },
      ],
    },
    {
      id: 'governance',
      title: 'SYSTEM & RBAC',
      items: [
        { id: 'users', label: t('navUsers'), icon: ShieldCheck, permission: 'users.manage' },
        { id: 'audit-logs', label: t('navAuditLogs'), icon: History, permission: 'audit.read' },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
          language === 'ar' ? 'right-0' : 'left-0'
        } ${
          isOpenMobile
            ? 'translate-x-0'
            : language === 'ar'
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Bus className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base">NGTC ERP</span>
                <span className="rounded bg-emerald-950/80 border border-emerald-500/30 px-1 py-0.2 text-[9px] font-mono text-emerald-400 font-semibold">
                  KSA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Transport</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Badge Bar */}
        <div className="border-b border-slate-800/80 bg-slate-950/40 px-5 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-300">
                {user?.branchName || 'Riyadh Central HQ'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium text-emerald-400 uppercase">
              {user?.roleName?.split(' ')[0] || 'Active'}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec) => {
            // Filter section items by permissions
            const visibleItems = sec.items.filter((item) => !item.permission || can(item.permission));
            if (visibleItems.length === 0) return null;

            return (
              <div key={sec.id}>
                <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {sec.title}
                </div>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-slate-950 font-semibold shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-medium ${
                              isActive
                                ? 'bg-slate-950/20 text-slate-950'
                                : 'bg-slate-800 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-slate-800 bg-slate-950/50 p-3 text-center">
          <p className="text-[10px] text-slate-400 font-mono">
            NGTC Operations v1.0.0 · Saudi Arabia
          </p>
        </div>
      </aside>
    </>
  );
};
