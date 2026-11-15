import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { HourlyVolumeItem } from '../../types';

interface Props {
  data: HourlyVolumeItem[];
}

export const HourlyPedestrianChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
          <XAxis
            dataKey="hour"
            stroke="#94a3b8"
            fontSize={9}
            tickLine={false}
            interval={2}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={9}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as HourlyVolumeItem;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs text-white">
                    <div className="font-bold text-teal-400">
                      {item.hour} {item.is_lunch_wave ? '🍔 Lunch Wave' : item.is_commuter_peak ? '🚆 Commuter Peak' : ''}
                    </div>
                    <div className="mt-1 font-mono text-[11px]">
                      <div>Volume: <b>{item.volume.toLocaleString()} p/hr</b></div>
                      <div className="text-slate-400">Baseline: <b>{item.baseline.toLocaleString()} p/hr</b></div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="volume" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => {
              let color = '#0d9488';
              if (entry.is_commuter_peak) color = '#f43f5e';
              else if (entry.is_lunch_wave) color = '#06b6d4';
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

