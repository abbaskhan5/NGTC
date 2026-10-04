import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface FleetStatusChartProps {
  distribution: {
    active: number;
    idle: number;
    maintenance: number;
    inactive: number;
  };
}

export const FleetStatusChart: React.FC<FleetStatusChartProps> = ({ distribution }) => {
  const data = [
    { name: 'Active In Service', value: distribution.active, color: '#10b981' },
    { name: 'Idle / Available', value: distribution.idle, color: '#38bdf8' },
    { name: 'Maintenance Depot', value: distribution.maintenance, color: '#f59e0b' },
    { name: 'Inactive / Reserved', value: distribution.inactive, color: '#64748b' },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white">Fleet Status Distribution</h3>
          <span className="text-xs font-mono font-medium text-slate-400">Total: {total}</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">Operational status breakdown across all branches</p>
      </div>

      <div className="h-44 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  return (
                    <div className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white">
                      <span className="font-semibold">{item.name}: </span>
                      <span className="font-mono text-emerald-400">{item.value} units</span>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-white font-mono">{distribution.active}</span>
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-400 truncate text-[11px]">{item.name.split(' ')[0]}</span>
            </div>
            <span className="font-mono font-medium text-slate-200 text-[11px]">
              {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
