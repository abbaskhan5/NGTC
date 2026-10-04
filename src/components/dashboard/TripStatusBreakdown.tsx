import React from 'react';
import { Bus, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface TripStatusBreakdownProps {
  distribution: {
    scheduled: number;
    running: number;
    completed: number;
    delayed: number;
    cancelled: number;
  };
}

export const TripStatusBreakdown: React.FC<TripStatusBreakdownProps> = ({ distribution }) => {
  const total =
    distribution.scheduled +
    distribution.running +
    distribution.completed +
    distribution.delayed +
    distribution.cancelled;

  const statuses = [
    {
      label: 'Completed',
      count: distribution.completed,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    },
    {
      label: 'En Route / Running',
      count: distribution.running,
      icon: Bus,
      color: 'bg-sky-500',
      textColor: 'text-sky-400',
    },
    {
      label: 'Scheduled',
      count: distribution.scheduled,
      icon: Clock,
      color: 'bg-slate-400',
      textColor: 'text-slate-300',
    },
    {
      label: 'Delayed (Traffic / Incident)',
      count: distribution.delayed,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
    },
    {
      label: 'Cancelled',
      count: distribution.cancelled,
      icon: XCircle,
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white">Daily Trip Dispatch Status</h3>
          <span className="text-xs font-mono font-medium text-emerald-400">
            {distribution.completed} / {total} Done
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">Live execution progress for today's routes across Saudi Arabia</p>

        {/* Stacked Progress Bar */}
        <div className="h-3 w-full rounded-full bg-slate-800 flex overflow-hidden mb-5">
          {statuses.map((s) => {
            const pct = total > 0 ? (s.count / total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={s.label}
                className={`${s.color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
                title={`${s.label}: ${s.count}`}
              />
            );
          })}
        </div>
      </div>

      {/* Breakdown list */}
      <div className="space-y-2.5 text-xs">
        {statuses.map((s) => {
          const Icon = s.icon;
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
          return (
            <div key={s.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${s.textColor} shrink-0`} />
                <span className="text-slate-300">{s.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-white tabular-nums">{s.count}</span>
                <span className="text-[11px] text-slate-400 font-mono">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
