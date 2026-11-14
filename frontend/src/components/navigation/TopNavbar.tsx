import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Calendar,
  MapPin,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  CheckCircle,
  AlertTriangle,
  Info,
  Sliders,
  ExternalLink,
  Server
} from 'lucide-react';
import { SpatialAlert, Store } from '../../types';
import { ApiConnectModal } from '../common/ApiConnectModal';
import { checkApiHealth, getApiBaseUrl } from '../../services/api';

interface TopNavbarProps {
  collapsed: boolean;
  dateRange: string;
  onChangeDateRange: (val: string) => void;
  region: string;
  onChangeRegion: (val: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSelectStoreFromSearch?: (store: Store) => void;
  stores?: Store[];
  alerts?: SpatialAlert[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isLiveTelemetry?: boolean;
  onToggleLiveTelemetry?: () => void;
  liveInflowRate?: number;
  onTriggerSurge?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  collapsed,
  dateRange,
  onChangeDateRange,
  region,
  onChangeRegion,
  searchQuery,
  onSearchChange,
  onSelectStoreFromSearch,
  stores = [],
  alerts = [],
  darkMode,
  onToggleDarkMode,
  isLiveTelemetry = true,
  onToggleLiveTelemetry,
  liveInflowRate = 12,
  onTriggerSurge,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkApiHealth().then((res) => setApiConnected(res.connected)).catch(() => setApiConnected(false));
    const interval = setInterval(() => {
      checkApiHealth().then((res) => setApiConnected(res.connected)).catch(() => setApiConnected(false));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStores = stores.filter(
    (s) =>
      searchQuery.trim().length > 0 &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 6);

  const activeAlerts = alerts.filter((a) => a.status !== 'Dismissed');

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Brand Tag & Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="hidden lg:flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
            GeoPulse
          </span>
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
            Enterprise Intelligence
          </span>
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Search 42 stores, retail zones, postal codes..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Autocomplete Search Dropdown */}
          {showSearchDropdown && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in max-h-80 overflow-y-auto">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Matching Stores & Venues ({filteredStores.length})
              </div>
              {filteredStores.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">
                  No stores found for "{searchQuery}"
                </div>
              ) : (
                filteredStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      onSelectStoreFromSearch?.(store);
                      setShowSearchDropdown(false);
                      onSearchChange('');
                    }}
                    className="w-full p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800/50 last:border-0 text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {store.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {store.code} • {store.zone} • {store.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-medium text-teal-600 dark:text-teal-400">
                        {store.daily_footfall.toLocaleString()} visitors/day
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Date Range Selector */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={dateRange}
            onChange={(e) => onChangeDateRange(e.target.value)}
            className="bg-transparent border-0 focus:outline-none cursor-pointer pr-1 text-xs"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Quarterly (Q3 2026)">Quarterly (Q3 2026)</option>
            <option value="Year to Date">Year to Date (YTD)</option>
          </select>
        </div>

        {/* Region Selector */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200">
          <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <select
            value={region}
            onChange={(e) => onChangeRegion(e.target.value)}
            className="bg-transparent border-0 focus:outline-none cursor-pointer pr-1 text-xs"
          >
            <option value="Greater Boston Metro Area">Greater Boston Metro Area</option>
            <option value="Back Bay">Back Bay Core</option>
            <option value="Downtown Crossing">Downtown Crossing</option>
            <option value="Seaport">Seaport Innovation Hub</option>
            <option value="Kendall Sq">Kendall Sq / Cambridge</option>
            <option value="Harvard Sq">Harvard Sq</option>
            <option value="Assembly Row">Assembly Row</option>
            <option value="Fenway">Fenway Cultural</option>
          </select>
        </div>

        {/* Live Telemetry Radar Pill */}
        <button
          onClick={onToggleLiveTelemetry}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            isLiveTelemetry
              ? 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
          }`}
          title={isLiveTelemetry ? 'Pause Live Telemetry Stream' : 'Resume Live Telemetry Stream'}
        >
          <span className={`w-2 h-2 rounded-full ${isLiveTelemetry ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
          <span className="hidden lg:inline">{isLiveTelemetry ? 'LIVE' : 'PAUSED'}</span>
          {isLiveTelemetry && (
            <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">
              +{liveInflowRate}/s
            </span>
          )}
        </button>

        {/* Trigger Surge Simulator */}
        {onTriggerSurge && (
          <button
            onClick={onTriggerSurge}
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold transition-all"
            title="Synthesize an instant real-time footfall surge at Back Bay"
          >
            <span>⚡ Simulate Surge</span>
          </button>
        )}

        {/* API Connection Indicator Pill */}
        <button
          onClick={() => setShowApiModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            apiConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
          }`}
          title="Configure API Connection"
        >
          <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="hidden sm:inline">API</span>
          <span className="text-[10px] opacity-80">{apiConnected ? 'Connected' : 'Offline'}</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            title="Spatial Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Spatial Alerts ({activeAlerts.length})
                </span>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold cursor-pointer">
                  Telemetry Feed
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {activeAlerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No active spatial alerts. All retail nodes operational.
                  </div>
                ) : (
                  activeAlerts.map((alt) => (
                    <div key={alt.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <div className="flex items-center gap-2">
                        {alt.severity === 'Critical' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {alt.title}
                        </span>
                        <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {alt.zone}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {alt.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-teal-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-teal-500/30">
            SJ
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Sarah Jenkins
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight">
              Chief Retail Strategist
            </div>
          </div>
        </div>
      </div>

      {/* API Connection & Endpoints Modal */}
      <ApiConnectModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onApiUpdated={() => checkApiHealth().then((res) => setApiConnected(res.connected))}
      />
    </header>
  );
};

