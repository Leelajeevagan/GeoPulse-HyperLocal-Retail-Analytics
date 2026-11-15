import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store, Competitor, TransitHub } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Compass,
  Layers,
  ChevronRight,
  Globe,
  Camera,
  X,
  MapPin,
  CheckCircle2,
  Navigation
} from 'lucide-react';

interface LocationAnalyticsMapProps {
  stores: Store[];
  competitors: Competitor[];
  transitHubs: TransitHub[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
  onAnalyzeMicroZone: (store: Store) => void;
  showIsochrones: boolean;
  showCompetitors: boolean;
  showTransit: boolean;
}

export const LocationAnalyticsMap: React.FC<LocationAnalyticsMapProps> = ({
  stores,
  competitors,
  transitHubs,
  selectedStore,
  onSelectStore,
  onAnalyzeMicroZone,
  showIsochrones = true,
  showCompetitors = true,
  showTransit = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const dynamicLayersRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelTileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapTheme, setMapTheme] = useState<'dark' | 'satellite'>('dark');
  const [showFloatingCard, setShowFloatingCard] = useState(true);

  const BOSTON_CENTER: [number, number] = [42.3550, -71.0750];

  useEffect(() => {
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

      const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      currentTileLayerRef.current = baseLayer;
      dynamicLayersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('Location map initialization notice:', err);
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (err) {
        console.warn('Location map cleanup notice:', err);
      }
    };
  }, []);

  // Update base imagery tile layer
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

    if (mapTheme === 'satellite') {
      const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }).addTo(map);
      const labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);
      currentTileLayerRef.current = sat;
      labelTileLayerRef.current = labels;
    } else {
      const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);
      currentTileLayerRef.current = dark;
    }
  }, [mapTheme]);

  // Update dynamic layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = dynamicLayersRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Geofence boundaries for retail corridors
    const corridors = [
      {
        name: "Boylston & Newbury Spine",
        coords: [[42.352, -71.085], [42.348, -71.085], [42.348, -71.072], [42.352, -71.072]],
        color: '#0d9488'
      },
      {
        name: "Downtown Pedestrian Concourse",
        coords: [[42.358, -71.062], [42.352, -71.062], [42.352, -71.056], [42.358, -71.056]],
        color: '#06b6d4'
      },
      {
        name: "Seaport Innovation Boulevard",
        coords: [[42.355, -71.047], [42.349, -71.047], [42.349, -71.039], [42.355, -71.039]],
        color: '#10b981'
      }
    ];

    corridors.forEach(c => {
      const poly = L.polygon(c.coords as any, {
        color: c.color,
        weight: 1.5,
        fillColor: c.color,
        fillOpacity: 0.12,
        dashArray: '4, 4'
      });
      poly.bindTooltip(`<b>Corridor: ${c.name}</b>`, { className: 'custom-leaflet-tooltip' });
      layerGroup.addLayer(poly);
    });

    // 2. Walking isochrones for selected store or flagship
    const activeStore = selectedStore || stores[0];
    if (showIsochrones && activeStore) {
      const isochrones = [
        { radius: 350, color: '#0d9488', label: '5-Min Walk Catchment (350m)' },
        { radius: 750, color: '#06b6d4', label: '10-Min Walk Catchment (750m)' },
        { radius: 1200, color: '#6366f1', label: '15-Min Transit Buffer (1.2km)' }
      ];

      isochrones.forEach(iso => {
        const circle = L.circle([activeStore.latitude, activeStore.longitude], {
          radius: iso.radius,
          color: iso.color,
          fillColor: iso.color,
          fillOpacity: 0.1,
          weight: 1.5,
          dashArray: '3, 4',
        });
        circle.bindTooltip(`<b>${iso.label}</b>`, { className: 'custom-leaflet-tooltip' });
        layerGroup.addLayer(circle);
      });
    }

    // 3. Transit Hub Markers
    if (showTransit) {
      transitHubs.forEach(th => {
        const transitIcon = L.divIcon({
          html: `
            <div class="w-6 h-6 rounded-full bg-blue-600 ring-2 ring-blue-300 text-white flex items-center justify-center font-bold text-[10px] shadow-md">
              T
            </div>
          `,
          className: 'custom-transit-pin',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([th.latitude, th.longitude], { icon: transitIcon });
        marker.bindTooltip(`
          <div class="p-1 font-sans">
            <div class="font-bold text-xs text-blue-300">${th.name}</div>
            <div class="text-[10px] text-slate-300">${th.lines_served}</div>
            <div class="text-[10px] text-slate-400 font-mono">${th.daily_ridership.toLocaleString()} daily riders</div>
          </div>
        `, { className: 'custom-leaflet-tooltip' });
        layerGroup.addLayer(marker);
      });
    }

    // 4. Competitor Markers
    if (showCompetitors) {
      competitors.forEach(comp => {
        const compIcon = L.divIcon({
          html: `
            <div class="w-5 h-5 rounded-full bg-rose-500 ring-2 ring-rose-400 text-white flex items-center justify-center text-[9px] font-bold shadow-md">
              R
            </div>
          `,
          className: 'custom-competitor-pin',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([comp.latitude, comp.longitude], { icon: compIcon });
        marker.bindTooltip(`
          <div class="p-1 font-sans">
            <div class="font-bold text-xs text-rose-300">${comp.name}</div>
            <div class="text-[10px] text-slate-300">Competitor • ${comp.distance_meters}m offset</div>
          </div>
        `, { className: 'custom-leaflet-tooltip' });
        layerGroup.addLayer(marker);
      });
    }

    // 5. Retail Stores Pins
    stores.forEach(s => {
      const isSelected = selectedStore?.id === s.id;
      const storePin = L.divIcon({
        html: `
          <div class="relative cursor-pointer">
            <div class="w-7 h-7 rounded-full ${isSelected ? 'bg-amber-400 ring-4 ring-amber-400/50 scale-125' : 'bg-teal-500 ring-2 ring-teal-300'} flex items-center justify-center text-slate-950 shadow-lg font-bold text-[10px] transition-transform">
              S
            </div>
            ${isSelected ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>' : ''}
          </div>
        `,
        className: 'custom-store-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([s.latitude, s.longitude], { icon: storePin });
      marker.bindTooltip(`
        <div class="p-1 font-sans">
          <div class="font-bold text-xs text-white">${s.name}</div>
          <div class="text-[11px] text-teal-300 font-mono">${s.daily_footfall.toLocaleString()} visitors/day</div>
          <div class="text-[10px] text-slate-300">${s.format} • ${s.zone}</div>
        </div>
      `, { className: 'custom-leaflet-tooltip' });

      marker.on('click', () => {
        onSelectStore(s);
        setShowFloatingCard(true);
        map.panTo([s.latitude, s.longitude]);
      });

      layerGroup.addLayer(marker);
    });

    if (selectedStore) {
      map.flyTo([selectedStore.latitude, selectedStore.longitude], 14, {
        duration: 1.2,
      });
    }

  }, [stores, competitors, transitHubs, selectedStore, showIsochrones, showCompetitors, showTransit]);

  const activeNode = selectedStore || stores[0];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] shadow-xl flex flex-col">
      {/* Top Bar with Zero API Key Badge and Location Quick Selector */}
      <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3">
          {/* Zero API Key Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero API Key Required • OpenStreetMap GIS</span>
          </div>

          {/* Quick Location Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline text-slate-400">Select Location:</span>
            <select
              value={activeNode?.id || ''}
              onChange={(e) => {
                const s = stores.find(item => item.id === Number(e.target.value));
                if (s) {
                  onSelectStore(s);
                  setShowFloatingCard(true);
                }
              }}
              className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-teal-300 focus:outline-none"
            >
              {stores.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.zone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-2">
          {!showFloatingCard && (
            <button
              onClick={() => setShowFloatingCard(true)}
              className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[11px] font-bold"
            >
              Show Store Profile
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full h-[520px]">
        {/* Leaflet container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Spatial Node Profile Card */}
        {activeNode && showFloatingCard && (
          <div className="absolute top-4 left-4 z-20 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 p-5 shadow-2xl text-slate-200 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {activeNode.format}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeNode.code}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-white mt-1 leading-snug">
                  {activeNode.name}
                </h3>
                <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
                  {activeNode.address}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowFloatingCard(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Minimize Card"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-slate-800 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Real-Time Footfall</div>
                <div className="text-base font-bold text-teal-400 font-mono mt-0.5">
                  {activeNode.real_time_footfall.toLocaleString()}
                  <span className="text-[10px] text-slate-400 font-sans ml-1">/hr</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Capture Ratio</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {activeNode.pedestrian_capture_ratio}%
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Pressure Index</div>
                <div className="text-sm font-bold text-amber-400 font-mono mt-0.5 flex items-center gap-1">
                  {activeNode.footfall_pressure_index}/100
                  <span className="text-[10px] font-medium text-slate-400">High</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Cannibalization</div>
                <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                  {activeNode.cannibalization_pct}%
                </div>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-300 flex items-center justify-between">
              <span>Competitor Pressure:</span>
              <span className="font-semibold text-rose-400">{activeNode.competitor_pressure} (3 rivals &lt;400m)</span>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onAnalyzeMicroZone(activeNode)}
              className="w-full mt-4 py-2 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-teal transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Analyze Micro-Zone Telemetry
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Imagery Mode Toggle */}
        <div className="absolute top-4 right-16 z-20 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-700/70 shadow-xl">
          <button
            onClick={() => setMapTheme(mapTheme === 'dark' ? 'satellite' : 'dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapTheme === 'satellite'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Satellite Photogrammetry View"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{mapTheme === 'satellite' ? 'Satellite 🛰️' : 'Dark GIS'}</span>
          </button>
        </div>

        {/* Map Control Tools (Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl p-1 border border-slate-700/60 shadow-lg">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.setView(BOSTON_CENTER, 13)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Boston View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Map Legend (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg text-xs text-slate-300 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-500 text-slate-950 text-[8px] font-bold flex items-center justify-center">S</span>
            <span className="text-[11px]">Stores</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center">T</span>
            <span className="text-[11px]">Transit Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">R</span>
            <span className="text-[11px]">Rival</span>
          </div>
        </div>
      </div>
    </div>
  );
};
