import React, { useState } from 'react';
import { HeatmapDay, HeatmapHour } from '../../types';
import { Clock, Info } from 'lucide-react';

interface Props {
  data: HeatmapDay[];
}

export const WeeklyVisitingHeatmap: React.FC<Props> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapHour | null>(null);

  // Filter hours to primary active retail hours (07:00 to 22:00) for ideal grid readability, or show all 24
  const displayHours = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM

  const getCellColor = (hour: HeatmapHour) => {
    const val = hour.intensity;
    if (val > 1800) return 'bg-rose-500 hover:bg-rose-400 text-white';
    if (val > 1400) return 'bg-cyan-500 hover:bg-cyan-400 text-white';
    if (val > 900) return 'bg-teal-500 hover:bg-teal-400 text-white';
    if (val > 400) return 'bg-teal-700 hover:bg-teal-600 text-teal-100';
    return 'bg-slate-800 hover:bg-slate-700 text-slate-400';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Weekly Visiting Hours Heatmap
            </h3>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              7x24 Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hour-by-hour customer footfall density across 42 venues in Greater Boston.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Density:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800" title="Low (<400)" />
            <span className="text-[10px] text-slate-500">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-700" title="Moderate (400-900)" />
            <span className="text-[10px] text-slate-500">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-500" title="High (900-1400)" />
            <span className="text-[10px] text-slate-500">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500" title="Peak (1400-1800)" />
            <span className="text-[10px] text-slate-500">Peak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500" title="Severe Surge (>1800)" />
            <span className="text-[10px] text-rose-500 font-bold">Surge</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[650px]">
          {/* Header Hour Numbers */}
          <div className="grid grid-cols-[60px_repeat(16,1fr)] gap-1 mb-1.5 text-center text-[10px] font-mono text-slate-400">
            <div></div>
            {displayHours.map((h) => (
              <div key={h} className="truncate">
                {h}:00
              </div>
            ))}
          </div>

          {/* Days Rows */}
          <div className="space-y-1.5">
            {data.map((dayRow) => (
              <div
                key={dayRow.day}
                className="grid grid-cols-[60px_repeat(16,1fr)] gap-1 items-center"
              >
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {dayRow.day}
                </div>

                {displayHours.map((h) => {
                  const hourData = dayRow.hours.find((cell) => cell.hour === h) || {
                    day: dayRow.day,
                    hour: h,
                    hour_label: `${String(h).padStart(2, '0')}:00`,
                    intensity: 300,
                    density_level: 'Moderate',
                    traffic_index: 30,
                  };

                  const colorClass = getCellColor(hourData);

                  return (
                    <div
                      key={h}
                      onMouseEnter={() => setHoveredCell(hourData)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-7 rounded transition-all duration-150 cursor-pointer flex items-center justify-center text-[9px] font-mono ${colorClass} shadow-sm`}
                    >
                      {hourData.intensity > 1400 && (
                        <span className="opacity-90 font-bold">
                          {(hourData.intensity / 1000).toFixed(1)}k
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hovered Cell Detail Banner */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between min-h-[38px] text-xs">
        {hoveredCell ? (
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-500" />
              {hoveredCell.day} at {hoveredCell.hour_label}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Pedestrian Intensity: <b className="text-teal-600 dark:text-teal-400 font-mono">{hoveredCell.intensity.toLocaleString()} visits/hr</b>
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              hoveredCell.density_level === 'Severe Surge'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                : 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300'
            }`}>
              {hoveredCell.density_level}
            </span>
          </div>
        ) : (
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Hover over any hour cell to inspect real-time pedestrian throughput metrics.
          </div>
        )}

        <div className="text-[11px] font-mono text-slate-400">
          Peak Window: <b>17:30 - 19:00 EST</b>
        </div>
      </div>
    </div>
  );
};
