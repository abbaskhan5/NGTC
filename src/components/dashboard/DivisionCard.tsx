import React from 'react';
import { GraduationCap, Building2, Users, Briefcase, HardHat, Plane, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';

interface DivisionCardProps {
  code: string;
  name: string;
  nameAr: string;
  activeFleetCount: number;
  tripsToday: number;
  activeContracts: number;
  monthlyRevenueSAR: number;
  status: 'optimal' | 'attention' | 'busy';
  onSelect?: () => void;
}

export const DivisionCard: React.FC<DivisionCardProps> = ({
  code,
  name,
  nameAr,
  activeFleetCount,
  tripsToday,
  activeContracts,
  monthlyRevenueSAR,
  status,
  onSelect,
}) => {
  const { language } = useLanguage();

  const getIcon = () => {
    switch (code) {
      case 'SCH-TRN':
        return GraduationCap;
      case 'UNI-TRN':
        return Building2;
      case 'LBR-TRN':
        return Users;
      case 'CRP-TRN':
        return Briefcase;
      case 'CNS-TRN':
        return HardHat;
      case 'TRV-AGY':
        return Plane;
      default:
        return Building2;
    }
  };

  const Icon = getIcon();

  const statusMap = {
    optimal: { text: 'Optimal Ops', bg: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
    busy: { text: 'Peak Transit', bg: 'text-sky-400 bg-sky-950/60 border-sky-500/30' },
    attention: { text: 'Attention', bg: 'text-amber-400 bg-amber-950/60 border-amber-500/30' },
  };

  return (
    <div
      onClick={onSelect}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/40"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-slate-950 transition-colors">
            <Icon className="h-5 w-5" />
          </div>

          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusMap[status].bg}`}>
            {statusMap[status].text}
          </span>
        </div>

        <div className="mt-3">
          <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
            {language === 'ar' ? nameAr : name}
          </h4>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{code}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span>Active Fleet:</span>
          <span className="font-semibold text-slate-200 font-mono tabular-nums">{activeFleetCount} units</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Today's Trips:</span>
          <span className="font-semibold text-slate-200 font-mono tabular-nums">{tripsToday} scheduled</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Monthly Revenue:</span>
          <span className="font-semibold text-emerald-400 font-mono tabular-nums">
            {(monthlyRevenueSAR / 1000000).toFixed(2)}M SAR
          </span>
        </div>
      </div>
    </div>
  );
};
