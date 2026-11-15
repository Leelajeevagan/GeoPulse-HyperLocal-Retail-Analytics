import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Send, X } from 'lucide-react';
import { SpatialAlert } from '../../types';

interface AlertBannerProps {
  alert: SpatialAlert;
  onDispatch: (id: number) => void;
  onDismiss: (id: number) => void;
  isDispatching?: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alert,
  onDispatch,
  onDismiss,
  isDispatching = false,
}) => {
  const getSeverityStyles = () => {
    switch (alert.severity) {
      case 'Critical':
        return {
          wrapper: 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40 text-rose-900 dark:text-rose-200',
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
          icon: <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
        };
      case 'Warning':
        return {
          wrapper: 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40 text-amber-900 dark:text-amber-200',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
          icon: <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
        };
      default:
        return {
          wrapper: 'bg-teal-50/70 border-teal-200 dark:bg-teal-950/20 dark:border-teal-900/40 text-teal-900 dark:text-teal-200',
          badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
          icon: <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />,
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div className={`p-4 rounded-xl border ${styles.wrapper} transition-all duration-200 relative group`}>
      <div className="flex items-start gap-3">
        {styles.icon}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className="font-semibold text-sm">{alert.title}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${styles.badge}`}>
              {alert.alert_type}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {alert.zone}
            </span>
            {alert.impact_metric && (
              <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                • {alert.impact_metric}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {alert.description}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {alert.status === 'Dispatched' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Shift Reallocation Dispatched
              </span>
            ) : (
              <button
                onClick={() => onDispatch(alert.id)}
                disabled={isDispatching}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-600 dark:hover:bg-teal-500 shadow-sm transition-all"
              >
                <Send className="w-3 h-3" />
                {isDispatching ? 'Dispatching...' : 'Dispatch Shift Reallocation'}
              </button>
            )}

            <button
              onClick={() => onDismiss(alert.id)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={() => onDismiss(alert.id)}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Dismiss Alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

