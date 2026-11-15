import React, { useState } from 'react';
import { Download, FileText, Check, Loader2, Sparkles } from 'lucide-react';
import { ReportTemplate } from '../../types';
import { triggerQuickExport, downloadReportUrl } from '../../services/api';

interface Props {
  template: ReportTemplate;
  onDownloaded?: () => void;
}

export const ReportTemplateCard: React.FC<Props> = ({ template, onDownloaded }) => {
  const [selectedFormat, setSelectedFormat] = useState(template.recommended_format);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const result = await triggerQuickExport(template.id, selectedFormat);
      // Trigger browser download
      window.open(downloadReportUrl(result.report_id), '_blank');
      onDownloaded?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {template.category}
          </span>
          <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
            Recommended: .{template.recommended_format.toLowerCase()}
          </span>
        </div>

        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
          {template.title}
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {template.description}
        </p>

        {/* Included Metrics Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {template.metrics.map((m) => (
            <span
              key={m}
              className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        {/* Format Selector */}
        <div className="flex items-center gap-1">
          {template.formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors font-mono ${
                selectedFormat === fmt
                  ? 'bg-slate-900 text-white dark:bg-teal-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};

