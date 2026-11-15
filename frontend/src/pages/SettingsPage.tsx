import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  FolderSync,
  Bell,
  Map,
  Shield,
  Sliders
} from 'lucide-react';
import { getSettings, updateSettings } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [tileProvider, setTileProvider] = useState('CartoDB Dark Matter');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [s3Bucket, setS3Bucket] = useState('geopulse-retail-telemetry-prod');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/GEOPULSE/ALERTS/DEPLOY');
  const [understaffingThreshold, setUnderstaffingThreshold] = useState(35);
  const [cannibalizationThreshold, setCannibalizationThreshold] = useState(15);
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    getSettings()
      .then((data) => {
        if (data) {
          setTileProvider(data.map_tile_provider || 'CartoDB Dark Matter');
          setRefreshInterval(data.telemetry_refresh_interval_sec || 30);
          setS3Bucket(data.s3_bucket_name || 'geopulse-retail-telemetry-prod');
          setAwsRegion(data.aws_region || 'us-east-1');
          setWebhookUrl(data.webhook_url || '');
          setUnderstaffingThreshold(data.understaffing_threshold_pct || 35);
          setCannibalizationThreshold(data.cannibalization_threshold_pct || 15);
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        map_tile_provider: tileProvider,
        telemetry_refresh_interval_sec: refreshInterval,
        s3_bucket_name: s3Bucket,
        aws_region: awsRegion,
        webhook_url: webhookUrl,
        understaffing_threshold_pct: understaffingThreshold,
        cannibalization_threshold_pct: cannibalizationThreshold,
      });
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System & Geospatial Telemetry Settings
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
            Admin Configuration
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage map tile providers, cloud storage synchronization, alerting thresholds, and webhook endpoints.
        </p>
      </div>

      {savedStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Settings successfully persisted to GeoPulse configuration engine.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Map & Visual Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            <Map className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Map Tile & Canvas Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Map Tile Provider
              </label>
              <select
                value={tileProvider}
                onChange={(e) => setTileProvider(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="CartoDB Dark Matter">CartoDB Dark Matter (Recommended)</option>
                <option value="CartoDB Positron">CartoDB Positron Light</option>
                <option value="OpenStreetMap Standard">OpenStreetMap Standard</option>
                <option value="Stadia Alidade Smooth Dark">Stadia Alidade Smooth Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telemetry Polling Interval
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value={15}>Every 15 Seconds (High Frequency)</option>
                <option value={30}>Every 30 Seconds (Default)</option>
                <option value={60}>Every 60 Seconds</option>
                <option value={300}>Every 5 Minutes (Low Bandwidth)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cloud & Storage Sync */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            <FolderSync className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Cloud Storage & Automated S3 Mirroring</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                S3 Bucket Target
              </label>
              <input
                type="text"
                value={s3Bucket}
                onChange={(e) => setS3Bucket(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                AWS Region
              </label>
              <input
                type="text"
                value={awsRegion}
                onChange={(e) => setAwsRegion(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Shift Reallocation Webhook URL
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Anomaly Detection Thresholds */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-rose-500" />
            <span>Spatial Anomaly Detection Sensitivity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Understaffing Surge Alert Trigger: {understaffingThreshold}%
              </label>
              <input
                type="range"
                min={15}
                max={60}
                value={understaffingThreshold}
                onChange={(e) => setUnderstaffingThreshold(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <span className="text-[10px] text-slate-400">Triggers when footfall exceeds baseline staff capacity.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cannibalization Friction Sensitivity: {cannibalizationThreshold}%
              </label>
              <input
                type="range"
                min={5}
                max={30}
                value={cannibalizationThreshold}
                onChange={(e) => setCannibalizationThreshold(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <span className="text-[10px] text-slate-400">Triggers when micro-catchment overlap causes revenue displacement.</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

