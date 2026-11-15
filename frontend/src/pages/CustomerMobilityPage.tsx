import React, { useState, useEffect } from 'react';
import {
  Navigation,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Compass,
  Footprints,
  Train
} from 'lucide-react';
import { getMobilityFlows, getModalSplit } from '../services/api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MobilityFlowMap } from '../components/maps/MobilityFlowMap';

export const CustomerMobilityPage: React.FC = () => {
  const [flows, setFlows] = useState<any[]>([]);
  const [modalSplit, setModalSplit] = useState<any[]>([]);

  useEffect(() => {
    getMobilityFlows().then(setFlows).catch(console.error);
    getModalSplit().then(setModalSplit).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Customer Mobility & Origin-Destination Flows
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Vector Telemetry
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Vectorized passenger corridors linking MBTA subway terminals, commuter rail interchanges, and parking nodes directly to store doors.
        </p>
      </div>

      {/* Interactive Vector Flow Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Transit Hub to Retail Portal Inflow Map
          </h3>
          <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-semibold">
            Real-Time Boston Transit Feed
          </span>
        </div>
        <MobilityFlowMap flows={flows} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Origin-Destination Vector Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Primary Origin-Destination Corridors
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daily pedestrian vectors connecting major transit hubs to flagship retail venues.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400">
              5 Vectors Active
            </span>
          </div>

          <div className="space-y-3">
            {flows.map((flow, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <span className="truncate">{flow.from_name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span className="text-teal-600 dark:text-teal-400 truncate">{flow.to_name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Mode: <b>{flow.mode}</b></span>
                      <span>•</span>
                      <span>Avg Travel: <b>{flow.avg_transit_minutes} mins</b></span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                    {flow.volume_daily.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Daily Pedestrians
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Split (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Customer Mobility Modal Split
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                Boston Network
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Transportation breakdown of retail customer arrivals.
            </p>

            <div className="h-52 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modalSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="percentage"
                  >
                    {modalSplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  48.5%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Walking Direct
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {modalSplit.map((item) => (
                <div key={item.mode} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.mode}</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    {item.percentage}% ({item.volume.toLocaleString()})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
