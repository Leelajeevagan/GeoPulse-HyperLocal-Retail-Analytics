import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  HardDrive,
  CheckCircle2,
  CloudLightning,
  Sparkles,
  Download,
  Plus,
  RefreshCw,
  FolderSync
} from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { ReportBuilder } from '../components/reports/ReportBuilder';
import { ReportTemplateCard } from '../components/reports/ReportTemplateCard';
import { ExportLedgerTable } from '../components/reports/ExportLedgerTable';
import {
  getReportsKpis,
  getReportTemplates,
  getExportLedger
} from '../services/api';
import { ReportTemplate, ExportLedgerItem } from '../types';

export const ReportsPage: React.FC = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [ledgerItems, setLedgerItems] = useState<ExportLedgerItem[]>([]);
  const [totalLedger, setTotalLedger] = useState(0);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize] = useState(10);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerFormat, setLedgerFormat] = useState('All Formats');
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [showBuilderModal, setShowBuilderModal] = useState(false);

  const fetchKpis = () => {
    getReportsKpis().then(setKpis).catch(console.error);
    getReportTemplates().then(setTemplates).catch(console.error);
  };

  const fetchLedger = () => {
    setLoadingLedger(true);
    getExportLedger({
      page: ledgerPage,
      page_size: ledgerPageSize,
      search: ledgerSearch,
      format_filter: ledgerFormat,
    })
      .then((res) => {
        setLedgerItems(res.items);
        setTotalLedger(res.total);
      })
      .catch(console.error)
      .finally(() => setLoadingLedger(false));
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [ledgerPage, ledgerSearch, ledgerFormat]);

  return (
    <div className="space-y-6">
      {/* Reports Header Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Enterprise Intelligence Hub
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">Tier-1 Telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reports & Spatial Telemetry Export Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Generate, queue, and dispatch high-resolution spatial datasets across multi-format telemetry pipelines (PDF, CSV, GeoJSON, Parquet).
          </p>
        </div>

        {/* Right Status Badges & Storage Quota */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Storage Quota Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 min-w-[200px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-teal-500" />
                Storage Quota
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {kpis?.storage_quota_used_gb || 74.2} / {kpis?.storage_quota_total_gb || 100} GB
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full"
                style={{ width: `${kpis?.storage_quota_pct || 74.2}%` }}
              />
            </div>
          </div>

          {/* S3 Sync Badge */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <FolderSync className="w-4 h-4 animate-spin text-emerald-500" />
              <span>Webhooks & S3 Synced</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              us-east-1 telemetry pipeline
            </div>
          </div>

          {/* Create Custom Report Action Button */}
          <button
            onClick={() => {
              const el = document.getElementById('custom-report-builder-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Report</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Reports Generated"
          value={kpis?.reports_generated ? kpis.reports_generated.toLocaleString() : '1,284'}
          change={24.8}
          subtext="vs. prior month exports"
          icon={FileText}
          colorScheme="teal"
          sparkline={[980, 1020, 1140, 1210, 1284]}
        />

        <KpiCard
          title="Scheduled Dispatches"
          value={kpis?.scheduled_dispatches ? `${kpis.scheduled_dispatches} Active` : '18 Active'}
          change={12.5}
          subtext="Automated telemetry cron jobs"
          icon={Clock}
          colorScheme="blue"
          sparkline={[14, 15, 16, 17, 18]}
        />

        <KpiCard
          title="Data Volume Exported"
          value={kpis?.data_volume_exported || '4.82 TB'}
          change={16.4}
          subtext="+380 GB streamed this week"
          icon={HardDrive}
          colorScheme="indigo"
          sparkline={[3.8, 4.1, 4.3, 4.6, 4.82]}
        />

        <KpiCard
          title="Failed / Retried Exports"
          value={kpis?.failed_exports ?? 0}
          change={0}
          subtext="99.98% pipeline uptime SLA"
          icon={CheckCircle2}
          colorScheme="emerald"
          badge="Zero Errors"
        />
      </div>

      {/* Interactive Custom Report Builder Section */}
      <div id="custom-report-builder-section">
        <ReportBuilder onReportCreated={() => fetchLedger()} />
      </div>

      {/* Pre-Packaged Report Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Pre-Packaged Spatial Report Templates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Production-ready intelligence matrices engineered for real estate executives and store network planners.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((tpl) => (
            <ReportTemplateCard
              key={tpl.id}
              template={tpl}
              onDownloaded={() => fetchLedger()}
            />
          ))}
        </div>
      </div>

      {/* Export Archive & Download Activity Ledger */}
      <ExportLedgerTable
        items={ledgerItems}
        total={totalLedger}
        page={ledgerPage}
        pageSize={ledgerPageSize}
        onPageChange={setLedgerPage}
        onRefresh={fetchLedger}
        search={ledgerSearch}
        onSearchChange={(s) => {
          setLedgerSearch(s);
          setLedgerPage(1);
        }}
        formatFilter={ledgerFormat}
        onFormatFilterChange={(f) => {
          setLedgerFormat(f);
          setLedgerPage(1);
        }}
        isLoading={loadingLedger}
      />
    </div>
  );
};

