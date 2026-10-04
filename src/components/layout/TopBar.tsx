import React, { useState } from 'react';
import {
  Search,
  Bell,
  Globe,
  UserCheck,
  ChevronDown,
  LogOut,
  Shield,
  RefreshCw,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface TopBarProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  currentPath: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount,
  currentPath,
}) => {
  const { user, switchDemoRole, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const demoRoles = [
    { code: 'SUPER_ADMIN', label: 'Super Admin (All Access)', user: 'MR Abbas Khan' },
    { code: 'GENERAL_MANAGER', label: 'General Manager / CEO', user: 'Saad Al-Qahtani' },
    { code: 'FLEET_MANAGER', label: 'Fleet Manager', user: 'Eng. Tariq Al-Ghamdi' },
    { code: 'OPERATIONS_MANAGER', label: 'Operations Manager', user: 'Yousef Al-Harbi' },
    { code: 'FINANCE_MANAGER', label: 'Finance Manager', user: 'Reem Al-Shammari' },
    { code: 'HR_MANAGER', label: 'HR Manager', user: 'Nouf Al-Otaibi' },
    { code: 'DRIVER', label: 'Driver / Operator', user: 'Ahmed Al-Mutairi' },
  ];

  const handleRoleSelect = async (code: string) => {
    setIsSwitchingRole(true);
    setShowRoleMenu(false);
    try {
      await switchDemoRole(code);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const getBreadcrumbTitle = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length === 0 || parts[0] === 'dashboard') return t('navDashboard');
    if (parts[0] === 'fleet') return `${t('navFleet')} / ${parts[1] || ''}`;
    if (parts[0] === 'drivers') return t('navDrivers');
    if (parts[0] === 'contracts') return t('navContracts');
    if (parts[0] === 'trips') return t('navTrips');
    if (parts[0] === 'users') return t('navUsers');
    if (parts[0] === 'audit') return t('navAuditLogs');
    return parts[0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur sm:px-6">
      {/* Zone 1: Breadcrumb context */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          NGTC
        </span>
        <span className="text-slate-600">/</span>
        <span className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-md">
          {getBreadcrumbTitle()}
        </span>
      </div>

      {/* Zone 2: Command Search trigger */}
      <button
        onClick={onOpenSearch}
        type="button"
        className="mx-4 hidden md:flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors w-72 lg:w-96"
      >
        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span className="truncate">{t('searchPlaceholder')}</span>
        <kbd className="ms-auto rounded bg-slate-700/70 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
          ⌘K
        </kbd>
      </button>

      {/* Zone 3: Actions (Language, Notifications, Demo Persona, User Profile) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/60 text-slate-300 hover:bg-slate-800"
          title="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Toggle Language / تغيير اللغة"
        >
          <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* Notifications Popover Trigger */}
        <button
          onClick={onOpenNotifications}
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title={t('notifications')}
        >
          <Bell className="h-4 w-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-slate-950 font-mono">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Persona Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            type="button"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-950/60 transition-colors"
          >
            <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[120px]">{user?.roleName || t('switchRole')}</span>
            <ChevronDown className="h-3 w-3 text-emerald-400 shrink-0" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl z-50">
              <div className="border-b border-slate-800 px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Test Persona (RBAC)
              </div>
              {demoRoles.map((role) => (
                <button
                  key={role.code}
                  onClick={() => handleRoleSelect(role.code)}
                  disabled={isSwitchingRole}
                  className="flex w-full items-center justify-between px-3 py-2 text-start text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <div>
                    <div className="font-medium text-slate-100">{role.label}</div>
                    <div className="text-[11px] text-slate-400">{role.user}</div>
                  </div>
                  {user?.roleName?.includes(role.label.split(' ')[0]) && (
                    <span className="text-[10px] text-emerald-400 font-semibold font-mono">ACTIVE</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            type="button"
            className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/60 p-1 pe-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-[11px] font-bold text-slate-950">
              {user?.name?.slice(0, 2).toUpperCase() || 'NG'}
            </div>
            <span className="hidden lg:inline text-xs font-medium text-slate-200 max-w-[110px] truncate">
              {user?.name || 'Administrator'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl z-50">
              <div className="border-b border-slate-800 px-3 py-2">
                <p className="text-xs font-semibold text-slate-100">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
                  <Building className="h-3 w-3" />
                  <span>{user?.branchName || 'Riyadh HQ'}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t('signOut')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
