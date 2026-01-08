
import React, { useEffect, useRef } from 'react';
import { ItineraryDay } from '../types';

interface MapViewProps {
  days: ItineraryDay[];
}

const MapView: React.FC<MapViewProps> = ({ days }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).L || !mapContainerRef.current) return;

    const L = (window as any).L;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([19.7515, 75.7139], 7);

      // Using CartoDB 'Dark Matter' theme to match the app's dark aesthetic (Slate-950)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(mapRef.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const points: [number, number][] = [];

    days.forEach((day, index) => {
      const { lat, lng } = day.coordinates;
      points.push([lat, lng]);
      
      const icon = L.divIcon({
        className: 'custom-pin',
        html: `
          <div class="relative group">
            <div class="bg-emerald-500 text-slate-950 w-10 h-10 rounded-full border-4 border-slate-900 shadow-2xl flex items-center justify-center font-black text-sm transform -translate-y-2 transition-all group-hover:scale-125 group-hover:bg-emerald-400">
              ${index + 1}
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 32]
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      
      // Custom styled dark popup
      marker.bindPopup(`
        <div class="p-4 w-56 bg-slate-900 text-slate-100 rounded-2xl">
          <div class="flex items-center gap-1 mb-2">
            <span class="text-emerald-400 text-xs">★</span>
            <span class="text-xs font-black">${day.rating}</span>
            <span class="text-[10px] text-slate-500 font-bold ml-1">(${day.review_count} reviews)</span>
          </div>
          <b class="text-white font-black uppercase text-sm block mb-2 leading-tight">${day.location}</b>
          <div class="flex items-center gap-2 mb-4">
             <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             <p class="text-[10px] text-slate-400 font-black tracking-wide">${day.opening_hours}</p>
          </div>
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" 
             class="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl block text-center font-black transition-colors uppercase tracking-widest shadow-lg shadow-emerald-900/20">
            Open in Maps
          </a>
        </div>
      `, {
        className: 'travel-popup-dark',
        maxWidth: 300
      });
    });

    if (points.length > 1) {
      // Vibrant Emerald path for the dark map
      const polyline = L.polyline(points, { 
        color: '#10b981', // Emerald-500
        weight: 5, 
        opacity: 0.8,
        dashArray: '10, 15',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      map.fitBounds(polyline.getBounds(), { padding: [80, 80] });
    } else if (points.length === 1) {
      map.setView(points[0], 12);
    }

    return () => {};
  }, [days]);

  return (
    <div className="w-full h-[400px] md:h-[550px] rounded-[2.5rem] border-8 border-slate-900 shadow-2xl overflow-hidden relative group ring-1 ring-white/10">
      <div ref={mapContainerRef} className="w-full h-full bg-slate-950" />
      <div className="absolute top-6 left-6 z-[1000] bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Nocturnal Path Engine</span>
      </div>
      
      <style>{`
        .travel-popup-dark .leaflet-popup-content-wrapper {
          background: #0f172a;
          color: #f8fafc;
          border-radius: 1.5rem;
          padding: 0;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .travel-popup-dark .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .travel-popup-dark .leaflet-popup-tip {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .leaflet-container {
          background: #020617 !important;
        }
      `}</style>
    </div>
  );
};

export default MapView;
