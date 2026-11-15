import React, { useState } from 'react';
import {
  FileText,
  Download,
  Database,
  Layers,
  Calendar,
  Sparkles,
  Check,
  Send,
  CloudLightning
} from 'lucide-react';
import { generateCustomReport, downloadReportUrl } from '../../services/api';

interface Props {
  onReportCreated?: () => void;
}

const AVAILABLE_METRICS = [
  'Footfall Density',
  'Dwell Time Distribution',
  'Sales Correlation',
  'Origin-Destination Vectors',
  'Demographic & Affluence Spend',
  'Competitor Proximity Saturation',
  'Weather / Precipitation Cross-Factors',
];

export const ReportBuilder: React.FC<Props> = ({ onReportCreated }) => {
  const [title, setTitle] = useState('Boston_Metro_Spatial_Intelligence_Q3');
  const [storeCluster, setStoreCluster] = useState('All Retail Nodes (42 Venues)');
  const [spatialMesh, setSpatialMesh] = useState('Hexagonal H3 Mesh (Resolution 9)');
  const [aggregationPeriod, setAggregationPeriod] = useState('7-Day Aggregation');
  const [outputFormat, setOutputFormat] = useState('CSV');
  const [exportDestination, setExportDestination] = useState('Direct Download');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'Footfall Density',
    'Dwell Time Distribution',
    'Sales Correlation',
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      if (selectedMetrics.length > 1) {
        setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
      }
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setNotification(null);

    try {
      const result = await generateCustomReport({
        title,
        store_cluster: storeCluster,
        spatial_mesh: spatialMesh,
        aggregation_period: aggregationPeriod,
        output_format: outputFormat,
        export_destination: exportDestination,
        metrics: selectedMetrics,
      });

      setNotification({
        message: `Successfully generated ${result.filename} (${result.file_size_formatted})`,
        type: 'success',
      });

      // Auto-trigger direct download if Direct Download was selected
      if (exportDestination === 'Direct Download') {
        window.open(downloadReportUrl(result.report_id), '_blank');
      }

      onReportCreated?.();
    } catch (err: any) {
      setNotification({
        message: `Report generation failed: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Interactive Custom Report Builder
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              Telemetry Studio
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure custom spatial analytics data extractions, boundary grids, and output formats.
          </p>
        </div>
      </div>

      {notification && (
        <div
          className={`mb-5 p-3 rounded-xl text-xs flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-5">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Report Title / Filename Identifier
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-teal-500 focus:outline-none dark:text-white"
            placeholder="Enter report identifier..."
            required
          />
        </div>

        {/* 4 Configuration Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Store Cluster */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Store Cluster
            </label>
            <select
              value={storeCluster}
              onChange={(e) => setStoreCluster(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All Retail Nodes (42 Venues)">All Retail Nodes (42 Venues)</option>
              <option value="Back Bay Flagship Cluster">Back Bay Flagship Cluster</option>
              <option value="Downtown Crossing Concourse">Downtown Crossing Concourse</option>
              <option value="Seaport Innovation Mesh">Seaport Innovation Mesh</option>
              <option value="Cambridge & Harvard Nodes">Cambridge & Harvard Nodes</option>
            </select>
          </div>

          {/* Spatial Mesh */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Spatial Mesh
            </label>
            <select
              value={spatialMesh}
              onChange={(e) => setSpatialMesh(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="Hexagonal H3 Mesh (Resolution 9)">Hexagonal H3 Mesh (Res 9)</option>
              <option value="Voronoi Isochrone Mesh">Voronoi Isochrone Mesh</option>
              <option value="Census Block Group Mesh">Census Block Group Mesh</option>
              <option value="Micro-Catchment Buffer (500m)">Micro-Catchment Buffer (500m)</option>
            </select>
          </div>

          {/* Aggregation Period */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Aggregation Period
            </label>
            <select
              value={aggregationPeriod}
              onChange={(e) => setAggregationPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="24-Hour Real-Time">24-Hour Real-Time</option>
              <option value="7-Day Aggregation">7-Day Aggregation</option>
              <option value="30-Day Window">30-Day Window</option>
              <option value="Quarterly (Q3 2026)">Quarterly (Q3 2026)</option>
            </select>
          </div>

          {/* Export Destination */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Export Destination
            </label>
            <select
              value={exportDestination}
              onChange={(e) => setExportDestination(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="Direct Download">Direct Browser Download</option>
              <option value="S3 Bucket Sync">S3 Bucket Sync (us-east-1)</option>
              <option value="Webhook Dispatch">Webhook Event Endpoint</option>
              <option value="Email Dispatch">Executive Email Dispatch</option>
            </select>
          </div>
        </div>

        {/* Output Format Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Select Output Format
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['PDF', 'CSV', 'GeoJSON', 'Parquet'].map((fmt) => {
              const isSelected = outputFormat.toUpperCase() === fmt.toUpperCase();
              return (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => setOutputFormat(fmt)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-teal-600 dark:border-teal-500 shadow-md ring-2 ring-teal-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span className="text-sm font-black font-mono">.{fmt.toLowerCase()}</span>
                  <span className="text-[10px] font-normal opacity-80">
                    {fmt === 'PDF'
                      ? 'Executive Briefing'
                      : fmt === 'CSV'
                      ? 'Tabular Metrics'
                      : fmt === 'GeoJSON'
                      ? 'Spatial Layers'
                      : 'Big Data Binary'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Metrics Multi-Select Checklist */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Included Telemetry & Cross-Factors ({selectedMetrics.length} selected)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {AVAILABLE_METRICS.map((metric) => {
              const isChecked = selectedMetrics.includes(metric);
              return (
                <button
                  type="button"
                  key={metric}
                  onClick={() => toggleMetric(metric)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-colors ${
                    isChecked
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-2">{metric}</span>
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] ${
                      isChecked ? 'bg-teal-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            {isGenerating ? (
              <>
                <CloudLightning className="w-4 h-4 animate-spin" />
                Synthesizing Telemetry & Queuing Export...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate & Queue Export ({outputFormat})
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

