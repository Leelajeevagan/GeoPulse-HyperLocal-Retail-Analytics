import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import {
  Radio,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  Server,
  Code2,
  ExternalLink,
  Save
} from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, checkApiHealth } from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApiUpdated?: () => void;
}

export const ApiConnectModal: React.FC<Props> = ({ isOpen, onClose, onApiUpdated }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{ connected: boolean; latencyMs: number; statusText: string } | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const active = getApiBaseUrl();
      setCurrentUrl(active);
      setInputUrl(active);
      runHealthCheck(active);
    }
  }, [isOpen]);

  const runHealthCheck = async (urlToTest?: string) => {
    setIsChecking(true);
    const result = await checkApiHealth(urlToTest || inputUrl);
    setHealthStatus(result);
    setIsChecking(false);
  };

  const handleSave = () => {
    setApiBaseUrl(inputUrl);
    setCurrentUrl(inputUrl);
    runHealthCheck(inputUrl);
    onApiUpdated?.();
  };

  const handleResetDefault = () => {
    setInputUrl('http://127.0.0.1:8000/api');
    setApiBaseUrl('http://127.0.0.1:8000/api');
    setCurrentUrl('http://127.0.0.1:8000/api');
    runHealthCheck('http://127.0.0.1:8000/api');
    onApiUpdated?.();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const curlSnippet = `curl -X GET "http://127.0.0.1:8000/api/overview/kpis" -H "accept: application/json"`;
  const pythonSnippet = `import requests

res = requests.get("http://127.0.0.1:8000/api/overview/kpis")
data = res.json()
print("Total Customer Visits:", data["total_customer_visits"])`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GeoPulse API Connection & Endpoints"
      subtitle="Connect, test, and integrate external telemetry pipelines with the FastAPI backend."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Status Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              healthStatus?.connected
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
            }`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Backend Status
                </span>
                {healthStatus?.connected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Offline
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {healthStatus?.statusText || (isChecking ? 'Checking...' : 'Not Checked')}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
              {healthStatus?.latencyMs ? `${healthStatus.latencyMs} ms` : '—'}
            </div>
            <div className="text-[10px] text-slate-400">Response Latency</div>
          </div>
        </div>

        {/* Change API URL Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            API Base Endpoint URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. http://127.0.0.1:8000/api"
              className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={() => runHealthCheck(inputUrl)}
              disabled={isChecking}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              title="Test URL"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Test</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Default: <b>http://127.0.0.1:8000/api</b></span>
            <button
              onClick={handleResetDefault}
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              Reset to Local Default
            </button>
          </div>
        </div>

        {/* Integration Code Snippets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-teal-500" />
              Developer Connection Snippets
            </span>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
            >
              Open Swagger Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* cURL */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 font-mono text-[11px] text-slate-200 relative group">
            <div className="text-[10px] text-slate-400 uppercase font-sans font-bold mb-1">cURL</div>
            <pre className="overflow-x-auto">{curlSnippet}</pre>
            <button
              onClick={() => copyToClipboard(curlSnippet, 'curl')}
              className="absolute top-2.5 right-2.5 p-1 rounded bg-slate-800 text-slate-400 hover:text-white text-xs"
              title="Copy cURL"
            >
              {copiedSnippet === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Python */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 font-mono text-[11px] text-slate-200 relative group">
            <div className="text-[10px] text-slate-400 uppercase font-sans font-bold mb-1">Python (requests)</div>
            <pre className="overflow-x-auto whitespace-pre">{pythonSnippet}</pre>
            <button
              onClick={() => copyToClipboard(pythonSnippet, 'python')}
              className="absolute top-2.5 right-2.5 p-1 rounded bg-slate-800 text-slate-400 hover:text-white text-xs"
              title="Copy Python"
            >
              {copiedSnippet === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

