import React from 'react';
import { AlertCircle, AlertTriangle, Info, Clock, Check, ArrowRight } from 'lucide-react';
import { NotificationItem } from '../../types/index.js';

interface AlertsPanelProps {
  alerts: NotificationItem[];
  onMarkRead: (id: string) => void;
  onNavigateToEntity?: (alert: NotificationItem) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onMarkRead, onNavigateToEntity }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>URGENT</span>
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>WARNING</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-400">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>INFO</span>
          </span>
        );
    }
  };

  const getRelativeTime = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Urgent Expiry & Compliance Alerts</h3>
          <p className="text-xs text-slate-400">Immediate action items across vehicles, licenses, and contracts</p>
        </div>

        <span className="rounded-full bg-rose-950/80 border border-rose-500/30 px-2.5 py-0.5 text-xs font-mono font-bold text-rose-400">
          {alerts.length} Active
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No urgent compliance alerts at this time. All fleet documents up to date.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-3 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                  <span className="text-xs font-semibold text-slate-200">{alert.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {getRelativeTime(alert.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{alert.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onMarkRead(alert.id)}
                  title="Mark as resolved / read"
                  className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Check className="h-3 w-3" />
                  <span>Acknowledge</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
