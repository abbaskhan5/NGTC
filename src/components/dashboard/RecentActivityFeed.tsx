import React from 'react';
import { AuditLog } from '../../types/index.js';
import { Activity, Shield, User, FileText, Bus, DollarSign } from 'lucide-react';

interface RecentActivityFeedProps {
  activities: AuditLog[];
  onViewAll?: () => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities, onViewAll }) => {
  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'vehicles':
        return Bus;
      case 'contracts':
        return FileText;
      case 'finance':
        return DollarSign;
      case 'users':
        return Shield;
      default:
        return Activity;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Live Operations & Audit Stream</h3>
          <p className="text-xs text-slate-400">Chronological ledger of user modifications and dispatches</p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Full Audit Log →
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-800/80">
        {activities.map((act) => {
          const Icon = getModuleIcon(act.module);
          return (
            <div key={act.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                <Icon className="h-3.5 w-3.5 text-emerald-400" />
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-semibold text-slate-200 truncate">{act.userName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({act.userRole})</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {formatTime(act.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-snug">{act.details}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>{act.action}</span>
                  <span>·</span>
                  <span className="truncate">{act.entityDescription}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
