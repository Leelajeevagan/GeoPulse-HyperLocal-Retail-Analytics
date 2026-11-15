import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut, RotateCcw, Globe, CheckCircle2 } from 'lucide-react';

interface Props {
  flows: any[];
}

export const MobilityFlowMap: React.FC<Props> = ({ flows }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelTileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapTheme, setMapTheme] = useState<'dark' | 'satellite'>('dark');

  const BOSTON_CENTER: [number, number] = [42.3550, -71.0700];

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
        center: BOSTON_CENTER,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      const base = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      currentTileLayerRef.current = base;
      mapInstanceRef.current = map;

      // Draw OD Flow Lines and Hub Markers
      flows.forEach((flow) => {
        // From Transit Hub Marker
        const hubIcon = L.divIcon({
          html: `
            <div class="w-6 h-6 rounded-full bg-blue-600 ring-2 ring-blue-300 text-white flex items-center justify-center font-bold text-[10px] shadow-lg">
              T
            </div>
          `,
          className: 'custom-transit-node',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const hubMarker = L.marker(flow.from_coords, { icon: hubIcon });
        hubMarker.bindTooltip(`<b>Transit Origin:</b> ${flow.from_name}`);
        hubMarker.addTo(map);

        // To Retail Store Marker
        const storeIcon = L.divIcon({
          html: `
            <div class="w-6 h-6 rounded-full bg-teal-500 ring-2 ring-teal-300 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow-lg">
              S
            </div>
          `,
          className: 'custom-store-dest',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const storeMarker = L.marker(flow.to_coords, { icon: storeIcon });
        storeMarker.bindTooltip(`<b>Retail Destination:</b> ${flow.to_name}`);
        storeMarker.addTo(map);

        // Vector Polyline (connecting hub to store)
        const polyline = L.polyline([flow.from_coords, flow.to_coords], {
          color: '#14b8a6',
          weight: Math.max(3, Math.min(8, flow.volume_daily / 5000)),
          opacity: 0.85,
          dashArray: '8, 8',
        });

        polyline.bindTooltip(`
          <div class="p-1 font-sans">
            <div class="font-bold text-teal-300">${flow.from_name} ➔ ${flow.to_name}</div>
            <div class="text-[11px] text-white font-mono">${flow.volume_daily.toLocaleString()} daily pedestrians</div>
            <div class="text-[10px] text-slate-300">Mode: ${flow.mode} (${flow.avg_transit_minutes} mins)</div>
          </div>
        `, { className: 'custom-leaflet-tooltip' });

        polyline.addTo(map);
      });
    } catch (err) {
      console.warn('Mobility flow map initialization notice:', err);
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (err) {
        console.warn('Mobility map cleanup notice:', err);
      }
    };
  }, [flows]);

  // Handle tile switching
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

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] shadow-xl">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Zero API Key Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[11px] font-semibold text-emerald-300 shadow-xl">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Zero API Key Required • OpenStreetMap MBTA Transit Corridors</span>
      </div>

      {/* Satellite Imagery Toggle Button */}
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

      {/* Controls */}
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

      {/* Legend Badge */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg text-xs text-slate-300 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span className="text-[11px]">MBTA Transit Hub</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span className="text-[11px]">Retail Store Destination</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-teal-400 border-dashed border-t" />
          <span className="text-[11px]">Pedestrian Corridor</span>
        </div>
      </div>
    </div>
  );
};
