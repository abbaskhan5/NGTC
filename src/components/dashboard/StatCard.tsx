import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlightColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  highlightColor = 'emerald',
  onClick,
}) => {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-950/40 border-amber-500/20',
    blue: 'text-sky-400 bg-sky-950/40 border-sky-500/20',
    purple: 'text-purple-400 bg-purple-950/40 border-purple-500/20',
    rose: 'text-rose-400 bg-rose-950/40 border-rose-500/20',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-4 transition-all hover:border-slate-700 ${
        onClick ? 'cursor-pointer hover:bg-slate-800/40' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {value}
          </p>
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colorMap[highlightColor]}`}>
          <Icon className="h-5 w-5 shrink-0" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs">
          {subtext && <span className="text-slate-400 truncate">{subtext}</span>}
          {trend && (
            <span
              className={`font-medium font-mono text-[11px] ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
