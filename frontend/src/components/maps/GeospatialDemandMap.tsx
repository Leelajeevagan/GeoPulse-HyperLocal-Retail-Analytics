import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store, Competitor } from '../../types';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  Flame,
  Radio,
  ShieldAlert,
  Globe,
  Camera,
  Check,
  Search,
  Navigation,
  Building2,
  Map as MapIcon,
  LayoutGrid,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Info,
  Compass
} from 'lucide-react';

interface GeospatialDemandMapProps {
  stores: Store[];
  competitors: Competitor[];
  onSelectStore?: (store: Store) => void;
  selectedStore?: Store | null;
}

export const GeospatialDemandMap: React.FC<GeospatialDemandMapProps> = ({
  stores,
  competitors,
  onSelectStore,
  selectedStore,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelTileLayerRef = useRef<L.TileLayer | null>(null);

  // Top-level display mode: GIS Map, Direct Location Directory, or Vector Schematic
  const [viewMode, setViewMode] = useState<'map' | 'directory' | 'schematic'>('map');

  // Active Map Layer Tabs
  const [activeTab, setActiveTab] = useState<'heatmap' | 'stores' | 'isochrones' | 'competitors'>('heatmap');
  const [mapTheme, setMapTheme] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [zoomLevel, setZoomLevel] = useState(13);
  const [showSnapshotToast, setShowSnapshotToast] = useState(false);

  // Directory Search & Filter
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');

  const BOSTON_CENTER: [number, number] = [42.3550, -71.0700];

  // Tile Providers - 100% Free, NO API Key needed
  const TILE_CONFIGS = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  // Prominent Hotspots for Quick 1-Click Jumps
  const QUICK_LOCATIONS = [
    { name: 'Back Bay Flagship', zone: 'Back Bay', lat: 42.3498, lng: -71.0825 },
    { name: 'Downtown Crossing', zone: 'Downtown Crossing', lat: 42.3552, lng: -71.0601 },
    { name: 'Seaport Innovation', zone: 'Seaport', lat: 42.3512, lng: -71.0435 },
    { name: 'Kendall Sq Tech', zone: 'Kendall Sq', lat: 42.3628, lng: -71.0863 },
    { name: 'Harvard Square', zone: 'Harvard Sq', lat: 42.3736, lng: -71.1190 },
    { name: 'Prudential Center', zone: 'Back Bay', lat: 42.3472, lng: -71.0820 },
    { name: 'Assembly Row', zone: 'Assembly Row', lat: 42.3925, lng: -71.0772 },
    { name: 'Fenway Retail', zone: 'Fenway', lat: 42.3431, lng: -71.0990 },
  ];

  // Initialize Leaflet Map (Only when viewMode === 'map')
  useEffect(() => {
    if (viewMode !== 'map') return;
    if (!mapContainerRef.current) return;

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: selectedStore ? [selectedStore.latitude, selectedStore.longitude] : BOSTON_CENTER,
        zoom: selectedStore ? 14 : 13,
        zoomControl: false,
        attributionControl: false,
      });

      const baseLayer = L.tileLayer(TILE_CONFIGS[mapTheme], {
        maxZoom: 19,
        subdomains: mapTheme === 'streets' ? 'abc' : 'abcd',
      }).addTo(map);

      currentTileLayerRef.current = baseLayer;
      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      map.on('zoomend', () => {
        setZoomLevel(map.getZoom());
      });
    } catch (err) {
      console.warn('Leaflet map initialization notice:', err);
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (err) {
        console.warn('Leaflet map cleanup notice:', err);
      }
    };
  }, [viewMode]);

  // Update Base Tile Layer when mapTheme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }
    if (labelTileLayerRef.current) {
      map.removeLayer(labelTileLayerRef.current);
      labelTileLayerRef.current = null;
    }

    const newBase = L.tileLayer(TILE_CONFIGS[mapTheme], {
      maxZoom: 19,
      subdomains: mapTheme === 'streets' ? 'abc' : 'abcd',
    }).addTo(map);

    currentTileLayerRef.current = newBase;

    if (mapTheme === 'satellite') {
      const labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);
      labelTileLayerRef.current = labels;
    }
  }, [mapTheme]);

  // Update Layers when activeTab, stores, or selectedStore changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Demand Mesh Polygons (H3 Hexagonal / Spatial boundaries)
    const meshPolygons = [
      { coords: [[42.348, -71.089], [42.346, -71.074], [42.352, -71.072], [42.354, -71.087]], name: "Back Bay Core Mesh", density: 94 },
      { coords: [[42.352, -71.064], [42.351, -71.055], [42.358, -71.056], [42.359, -71.065]], name: "Downtown Crossing Corridor", density: 91 },
      { coords: [[42.348, -71.048], [42.348, -71.037], [42.355, -71.039], [42.356, -71.050]], name: "Seaport Innovation Mesh", density: 87 },
      { coords: [[42.360, -71.092], [42.359, -71.082], [42.365, -71.083], [42.366, -71.093]], name: "Kendall Tech Mesh", density: 82 },
      { coords: [[42.370, -71.124], [42.370, -71.115], [42.376, -71.116], [42.376, -71.125]], name: "Harvard Square Mesh", density: 78 }
    ];

    meshPolygons.forEach(poly => {
      const polygon = L.polygon(poly.coords as any, {
        color: '#0d9488',
        weight: 1.8,
        fillColor: '#0d9488',
        fillOpacity: activeTab === 'heatmap' ? (mapTheme === 'satellite' ? 0.35 : 0.22) : 0.08,
        dashArray: '4, 4'
      });
      polygon.bindTooltip(`<b>${poly.name}</b><br/>Demand Index: ${poly.density}/100`, { className: 'custom-leaflet-tooltip' });
      layerGroup.addLayer(polygon);
    });

    // 2. Heatmap Density Blobs (when heatmap tab is active)
    if (activeTab === 'heatmap') {
      stores.forEach(s => {
        const radius = Math.min(600, Math.max(250, s.daily_footfall / 30));
        const heatCircle = L.circle([s.latitude, s.longitude], {
          radius: radius,
          color: '#14b8a6',
          fillColor: s.daily_footfall > 13000 ? '#f43f5e' : s.daily_footfall > 10000 ? '#06b6d4' : '#0d9488',
          fillOpacity: mapTheme === 'satellite' ? 0.45 : 0.35,
          weight: 0,
        });
        layerGroup.addLayer(heatCircle);

        // Inner glowing core
        const coreCircle = L.circle([s.latitude, s.longitude], {
          radius: radius * 0.45,
          color: '#ffffff',
          fillColor: s.daily_footfall > 13000 ? '#fb7185' : '#38bdf8',
          fillOpacity: 0.7,
          weight: 0,
        });
        layerGroup.addLayer(coreCircle);
      });
    }

    // 3. Store Pins
    if (activeTab === 'stores' || activeTab === 'heatmap' || activeTab === 'isochrones') {
      stores.forEach(s => {
        const isSelected = selectedStore?.id === s.id;
        const iconHtml = `
          <div class="relative group cursor-pointer">
            <div class="w-8 h-8 rounded-full ${isSelected ? 'bg-amber-400 ring-4 ring-amber-400/50 scale-125' : 'bg-teal-500 ring-2 ring-teal-300'} flex items-center justify-center text-slate-950 font-black text-[10px] shadow-lg transition-transform duration-200">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
                <path d="M2 7h20"/>
              </svg>
            </div>
            ${isSelected ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>' : ''}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-store-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([s.latitude, s.longitude], { icon: customIcon });
        marker.bindTooltip(`
          <div class="p-1 font-sans">
            <div class="font-bold text-xs text-white">${s.name}</div>
            <div class="text-[11px] text-teal-300 font-mono">${s.daily_footfall.toLocaleString()} visitors/day</div>
            <div class="text-[10px] text-slate-300">${s.zone} • ${s.address}</div>
          </div>
        `, {
          className: 'custom-leaflet-tooltip',
          direction: 'top',
          offset: [0, -12],
        });

        marker.on('click', () => {
          onSelectStore?.(s);
        });

        layerGroup.addLayer(marker);
      });
    }

    // 4. Isochrones (Catchment Rings)
    if (activeTab === 'isochrones') {
      const centerStore = selectedStore || stores[0];
      if (centerStore) {
        const rings = [
          { radius: 400, color: '#0d9488', label: '5-min Walk (400m)' },
          { radius: 800, color: '#06b6d4', label: '10-min Walk (800m)' },
          { radius: 1200, color: '#6366f1', label: '15-min Transit Ring (1.2km)' }
        ];

        rings.forEach(r => {
          const circle = L.circle([centerStore.latitude, centerStore.longitude], {
            radius: r.radius,
            color: r.color,
            fillColor: r.color,
            fillOpacity: mapTheme === 'satellite' ? 0.25 : 0.15,
            weight: 2,
            dashArray: '5, 5',
          });
          circle.bindTooltip(`<b>${r.label}</b>`, { className: 'custom-leaflet-tooltip' });
          layerGroup.addLayer(circle);
        });
      }
    }

    // 5. Competitor Rings
    if (activeTab === 'competitors') {
      competitors.forEach(c => {
        const compIconHtml = `
          <div class="w-6 h-6 rounded-full bg-rose-500 ring-2 ring-rose-400/50 flex items-center justify-center text-white shadow-md">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
        `;
        const icon = L.divIcon({
          html: compIconHtml,
          className: 'custom-comp-pin',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([c.latitude, c.longitude], { icon });
        marker.bindTooltip(`
          <div class="p-1 font-sans">
            <div class="font-bold text-xs text-rose-300">Rival: ${c.name}</div>
            <div class="text-[10px] text-slate-300">Distance: ${c.distance_meters}m • ${c.pressure_level} Pressure</div>
          </div>
        `, { className: 'custom-leaflet-tooltip' });
        layerGroup.addLayer(marker);

        const ring = L.circle([c.latitude, c.longitude], {
          radius: c.distance_meters,
          color: '#f43f5e',
          weight: 1.5,
          fillOpacity: 0.08,
          dashArray: '3, 3',
        });
        layerGroup.addLayer(ring);
      });
    }

  }, [activeTab, stores, competitors, selectedStore, mapTheme]);

  // Smooth pan when selected store changes
  useEffect(() => {
    if (selectedStore && mapInstanceRef.current && viewMode === 'map') {
      mapInstanceRef.current.flyTo([selectedStore.latitude, selectedStore.longitude], 15, {
        duration: 1.2,
      });
    }
  }, [selectedStore, viewMode]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleReset = () => {
    mapInstanceRef.current?.setView(BOSTON_CENTER, 13);
  };

  const handleQuickJump = (loc: typeof QUICK_LOCATIONS[0]) => {
    // If not in map mode, switch to map mode first
    if (viewMode !== 'map') {
      setViewMode('map');
    }
    const matchedStore = stores.find(
      s => s.name.toLowerCase().includes(loc.name.toLowerCase().split(' ')[0]) || s.zone === loc.zone
    );
    if (matchedStore) {
      onSelectStore?.(matchedStore);
    }
    setTimeout(() => {
      mapInstanceRef.current?.flyTo([loc.lat, loc.lng], 15, { duration: 1.2 });
    }, 100);
  };

  const handleDownloadSnapshot = () => {
    setShowSnapshotToast(true);
    setTimeout(() => setShowSnapshotToast(false), 3000);
    const link = document.createElement('a');
    link.href = 'http://127.0.0.1:8000/api/reports/download/REP-2026-8917';
    link.setAttribute('download', 'Boston_Geospatial_Mesh_Snapshot.geojson');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered stores for Directory View
  const filteredStores = stores.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      s.address.toLowerCase().includes(directorySearch.toLowerCase()) ||
      s.zone.toLowerCase().includes(directorySearch.toLowerCase());
    const matchesZone = selectedZone === 'All' || s.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  const availableZones = ['All', ...Array.from(new Set(stores.map(s => s.zone)))];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] shadow-2xl flex flex-col">
      {/* Top Header Bar: Mode Switcher & Zero API Key Badge */}
      <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-2">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>

            <button
              onClick={() => setViewMode('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'directory'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Locations Directory ({stores.length})</span>
            </button>

            <button
              onClick={() => setViewMode('schematic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'schematic'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Schematic Mesh</span>
            </button>
          </div>

          {/* Zero API Key Assurance Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free OpenStreetMap & CartoDB • Zero API Key Required</span>
          </div>
        </div>

        {/* Live Node Count */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span><b>{stores.length} Retail Nodes</b> Plotted</span>
        </div>
      </div>

      {/* Quick Location Focus Bar (Always visible for instant jump) */}
      <div className="bg-slate-950/70 px-4 py-2 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar z-20 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1 shrink-0">
          <Navigation className="w-3 h-3" />
          Quick Focus:
        </span>
        <div className="flex items-center gap-1.5">
          {QUICK_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => handleQuickJump(loc)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-teal-950 hover:border-teal-500 border border-slate-700/60 text-slate-300 hover:text-teal-300 font-medium text-[11px] whitespace-nowrap transition-all flex items-center gap-1"
            >
              <MapPin className="w-2.5 h-2.5 text-teal-400" />
              <span>{loc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: LEAFLET MAP VIEW */}
      {viewMode === 'map' && (
        <div className="relative w-full h-[480px] lg:h-[520px]">
          {/* Leaflet Map Div */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Snapshot Toast Feedback */}
          {showSnapshotToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-slate-900/95 text-white border border-teal-500 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Geospatial Mesh Snapshot & Telemetry Vector Saved!</span>
            </div>
          )}

          {/* Top Map Layer Selector Tabs */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/70 shadow-xl">
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'heatmap'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Heatmap Overlay
            </button>

            <button
              onClick={() => setActiveTab('stores')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'stores'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Store Pins ({stores.length})
            </button>

            <button
              onClick={() => setActiveTab('isochrones')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'isochrones'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Isochrones
            </button>

            <button
              onClick={() => setActiveTab('competitors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'competitors'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Competitor Ring
            </button>
          </div>

          {/* Top Right Controls: Theme Selector, Snapshot, Zoom & Reset */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-700/70 shadow-xl">
              <button
                onClick={() => setMapTheme('dark')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mapTheme === 'dark'
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="CartoDB Dark Matter (Free OSM Tile Layer)"
              >
                Dark GIS
              </button>

              <button
                onClick={() => setMapTheme('satellite')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mapTheme === 'satellite'
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="ESRI World Imagery (Free Satellite)"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Satellite 🛰️</span>
              </button>
            </div>

            {/* Snapshot Button */}
            <button
              onClick={handleDownloadSnapshot}
              className="p-2 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-800 shadow-xl transition-all"
              title="Save Geospatial Map Snapshot"
            >
              <Camera className="w-4 h-4 text-teal-400" />
            </button>

            {/* Zoom & Reset Controls */}
            <div className="flex flex-col gap-1 bg-slate-900/95 backdrop-blur-md rounded-xl p-1 border border-slate-700/70 shadow-xl">
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Reset Boston View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Right Footfall Intensity Legend */}
          <div className="absolute bottom-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/70 shadow-xl text-xs text-slate-200">
            <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
              Footfall Intensity Legend
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-400/30" />
                <span className="text-[11px] text-slate-300">Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30" />
                <span className="text-[11px] text-slate-300">High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400/30 animate-pulse" />
                <span className="text-[11px] text-rose-300 font-bold">Severe Surge</span>
              </div>
            </div>
          </div>

          {/* Bottom Left Active Telemetry Pill */}
          <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/70 shadow-xl text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Engine: <b className="text-teal-400">CartoDB Dark Vector Mesh</b> • Zero API Key
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: DIRECT STORE LOCATIONS DIRECTORY (No API Key Required) */}
      {viewMode === 'directory' && (
        <div className="w-full h-[520px] p-4 flex flex-col bg-slate-950 overflow-hidden">
          {/* Search & Filter Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search store name, street address, or zone..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 whitespace-nowrap">Filter Zone:</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                {availableZones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Scrollable Locations Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStores.map((s) => {
              const isSelected = selectedStore?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectStore?.(s);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-950/40 border-teal-500 shadow-lg shadow-teal-500/10'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                        <h4 className="font-bold text-xs text-white">{s.name}</h4>
                      </div>
                      <span className="text-[10px] text-teal-400 font-mono font-semibold">{s.code} • {s.format}</span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {s.zone}
                    </span>
                  </div>

                  {/* Physical Address */}
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{s.address}</span>
                  </div>

                  {/* Coordinates & Footfall Stats */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Daily Footfall</div>
                      <div className="text-xs font-bold text-teal-300 font-mono">
                        {s.daily_footfall.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Coordinates</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStore?.(s);
                        setViewMode('map');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-bold text-[10px] transition-all flex items-center gap-1"
                    >
                      <span>Locate</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: SCHEMATIC MESH VIEW (Zero External Internet/Tile Dependencies) */}
      {viewMode === 'schematic' && (
        <div className="w-full h-[520px] p-6 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Watermark Grid Background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative z-10 w-full max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/70 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Direct Spatial Network Topology • Completely Offline Capable</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Greater Boston Metro Spatial Demand Mesh
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6">
              Full vector schematic visualizing spatial distribution across Back Bay, Downtown Crossing, Seaport, Cambridge, and Assembly Row.
            </p>

            {/* SVG Interactive Mesh Diagram */}
            <div className="relative w-full h-72 rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 800 300" fill="none">
                {/* River line representation */}
                <path
                  d="M 50 180 Q 250 100 450 140 T 750 130"
                  stroke="#0284c7"
                  strokeWidth="8"
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                  fill="none"
                />
                <text x="360" y="125" fill="#38bdf8" fontSize="10" fontWeight="bold" opacity="0.6">
                  CHARLES RIVER CORRIDOR
                </text>

                {/* Demand Mesh Corridors */}
                <line x1="200" y1="200" x2="350" y2="190" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                <line x1="350" y1="190" x2="520" y2="210" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                <line x1="350" y1="190" x2="300" y2="90" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                <line x1="300" y1="90" x2="160" y2="70" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                <line x1="350" y1="190" x2="480" y2="60" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />

                {/* Major Nodes */}
                {/* Harvard Sq */}
                <g className="cursor-pointer group" onClick={() => handleQuickJump(QUICK_LOCATIONS[4])}>
                  <circle cx="160" cy="70" r="24" fill="#0d9488" fillOpacity="0.2" className="animate-pulse" />
                  <circle cx="160" cy="70" r="10" fill="#14b8a6" />
                  <text x="160" y="105" textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="bold">Harvard Sq</text>
                  <text x="160" y="118" textAnchor="middle" fill="#5eead4" fontSize="9">7 Nodes</text>
                </g>

                {/* Kendall Tech */}
                <g className="cursor-pointer group" onClick={() => handleQuickJump(QUICK_LOCATIONS[3])}>
                  <circle cx="300" cy="90" r="26" fill="#0d9488" fillOpacity="0.2" className="animate-pulse" />
                  <circle cx="300" cy="90" r="12" fill="#06b6d4" />
                  <text x="300" y="125" textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="bold">Kendall Sq</text>
                  <text x="300" y="138" textAnchor="middle" fill="#5eead4" fontSize="9">8 Nodes</text>
                </g>

                {/* Assembly Row */}
                <g className="cursor-pointer group" onClick={() => handleQuickJump(QUICK_LOCATIONS[6])}>
                  <circle cx="480" cy="60" r="22" fill="#0d9488" fillOpacity="0.2" />
                  <circle cx="480" cy="60" r="10" fill="#14b8a6" />
                  <text x="480" y="95" textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="bold">Assembly Row</text>
                  <text x="480" y="108" textAnchor="middle" fill="#5eead4" fontSize="9">4 Nodes</text>
                </g>

                {/* Back Bay */}
                <g className="cursor-pointer group" onClick={() => handleQuickJump(QUICK_LOCATIONS[0])}>
                  <circle cx="200" cy="200" r="32" fill="#0d9488" fillOpacity="0.3" className="animate-pulse" />
                  <circle cx="200" cy="200" r="14" fill="#14b8a6" />
                  <text x="200" y="235" textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="bold">Back Bay</text>
                  <text x="200" y="249" textAnchor="middle" fill="#5eead4" fontSize="10">9 Nodes • Flagship</text>
                </g>

                {/* Downtown Crossing */}
                <g className="cursor-pointer group" onClick={() => handleQuickJump(QUICK_LOCATIONS[1])}>
                  <circle cx="350" cy="190" r="30" fill="#0d9488" fillOpacity="0.25" className="animate-pulse" />
                  <circle cx="350" cy="190" r="13" fill="#06b6d4" />
                  <text x="350" y="225" textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="bold">Downtown</text>
                  <text x="350" y="239" textAnchor="middle" fill="#5eead4" fontSize="10">8 Nodes</text>
                </g>

                {/* Seaport */}
                <g className="cursor-pointer group" onClick={() => handleQuickJump(QUICK_LOCATIONS[2])}>
                  <circle cx="520" cy="210" r="28" fill="#0d9488" fillOpacity="0.25" className="animate-pulse" />
                  <circle cx="520" cy="210" r="12" fill="#14b8a6" />
                  <text x="520" y="245" textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="bold">Seaport</text>
                  <text x="520" y="259" textAnchor="middle" fill="#5eead4" fontSize="10">6 Nodes</text>
                </g>
              </svg>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setViewMode('map')}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Switch to Interactive Leaflet Map (Free OSM Tiles)</span>
              </button>
              <button
                onClick={() => setViewMode('directory')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Browse All 42 Store Addresses</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
