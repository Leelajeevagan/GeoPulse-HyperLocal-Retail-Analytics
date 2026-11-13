import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Navigation,
  Footprints,
  BadgeDollarSign,
  Store,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  Sparkles
} from 'lucide-react';

export type NavPage =
  | 'overview'
  | 'locations'
  | 'mobility'
  | 'footfall'
  | 'sales'
  | 'stores'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activePage: NavPage;
  onSelectPage: (page: NavPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  id: NavPage;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'locations', label: 'Location Analytics', icon: MapPin },
  { id: 'mobility', label: 'Customer Mobility', icon: Navigation },
  { id: 'footfall', label: 'Footfall Analysis', icon: Footprints },
  { id: 'sales', label: 'Retail Sales', icon: BadgeDollarSign },
  { id: 'stores', label: 'Store Intelligence', icon: Store },
  { id: 'reports', label: 'Reports', icon: FileText, badge: 'Export' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-glow-teal shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  GeoPulse
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                  Spatial Intelligence
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {!collapsed ? 'Telemetry & Modules' : '•••'}
          </div>

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-teal-400 dark:text-white'
                      : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      isActive
                        ? 'bg-teal-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Left Active Pip Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-teal-400 dark:bg-white rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Network Status Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                Spatial Mesh
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 font-mono">
              42 Stores Synced (98.4%)
            </div>
            <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
              Latency: 38ms • Boston Hub
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="42 Stores Synced - Mesh Active">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};

