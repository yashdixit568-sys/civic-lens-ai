'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ComplaintItem } from '@/lib/types';
import { PLAIN_CATEGORY_LABELS, PLAIN_STATUS_CONFIG, SupportedLanguage } from '@/lib/copy-helpers';
import { Eye, MapPin, ThumbsUp, Navigation } from 'lucide-react';

interface CivicMapInnerProps {
  complaints: ComplaintItem[];
  center: [number, number];
  zoom: number;
  userLocation: { lat: number; lng: number } | null;
  onSelectComplaint?: (complaint: ComplaintItem) => void;
  onSupportComplaint?: (complaint: ComplaintItem) => void;
  lang?: SupportedLanguage;
}

// Controller component to programmatically pan map when center/zoom changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Custom Leaflet DivIcon creator for issue pins
function createCustomPinIcon(cmp: ComplaintItem) {
  let pinBg = 'bg-blue-600 border-white text-white shadow-md';
  let pinBorder = 'ring-2 ring-blue-600/30';
  let sizeClass = 'h-8 w-8 text-xs';

  if (cmp.status === 'RESOLVED') {
    pinBg = 'bg-green-600 border-white text-white opacity-85';
    pinBorder = 'ring-1 ring-green-600/20';
    sizeClass = 'h-7 w-7 text-[10px]';
  } else if (cmp.status === 'IN_PROGRESS' || cmp.status === 'ASSIGNED') {
    pinBg = 'bg-amber-500 border-white text-white shadow-md';
    pinBorder = 'ring-2 ring-amber-500/30';
  } else if (cmp.severity === 'CRITICAL') {
    pinBg = 'bg-red-600 border-white text-white animate-bounce shadow-lg';
    pinBorder = 'ring-4 ring-red-600/40';
  }

  const catObj = PLAIN_CATEGORY_LABELS[cmp.category];
  const iconSymbol = catObj ? catObj.icon : '📍';

  const html = `
    <div className="relative flex items-center justify-center">
      <div className="${sizeClass} rounded-full ${pinBg} ${pinBorder} border-2 flex items-center justify-center font-bold shadow-sm transition-transform hover:scale-125 cursor-pointer">
        ${iconSymbol}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// Custom Leaflet DivIcon creator for clusters
function createClusterIcon(count: number) {
  const html = `
    <div className="relative flex items-center justify-center">
      <div className="h-10 w-10 rounded-full bg-blue-700 text-white border-2 border-white ring-4 ring-blue-600/30 flex items-center justify-center font-extrabold text-xs shadow-lg hover:scale-110 transition-transform cursor-pointer">
        ${count}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-cluster',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Custom Leaflet DivIcon for User Location
function createUserLocationIcon() {
  const html = `
    <div className="relative flex items-center justify-center">
      <div className="h-5 w-5 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-500/40 shadow-md animate-pulse"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Lightweight distance-based clustering algorithm
function clusterComplaints(complaints: ComplaintItem[], distanceThreshold: number = 0.008) {
  const clusters: { center: [number, number]; items: ComplaintItem[] }[] = [];

  complaints.forEach((cmp) => {
    let added = false;
    for (const cluster of clusters) {
      const latDiff = Math.abs(cluster.center[0] - cmp.location.latitude);
      const lngDiff = Math.abs(cluster.center[1] - cmp.location.longitude);
      if (latDiff < distanceThreshold && lngDiff < distanceThreshold) {
        cluster.items.push(cmp);
        added = true;
        break;
      }
    }
    if (!added) {
      clusters.push({
        center: [cmp.location.latitude, cmp.location.longitude],
        items: [cmp],
      });
    }
  });

  return clusters;
}

export const CivicMapInner: React.FC<CivicMapInnerProps> = ({
  complaints,
  center,
  zoom,
  userLocation,
  onSelectComplaint,
  onSupportComplaint,
  lang = 'en',
}) => {
  const clusters = clusterComplaints(complaints, zoom < 14 ? 0.015 : 0.004);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="w-full h-full rounded-2xl z-0"
    >
      <MapController center={center} zoom={zoom} />

      {/* Light Clean Voyager Map Tile Layer */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {/* User Current Location Dot & Accuracy Circle */}
      {userLocation && (
        <>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={250}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#3b82f6',
              fillOpacity: 0.12,
              weight: 1,
            }}
          />
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserLocationIcon()}
          >
            <Popup>
              <div className="p-1.5 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Navigation className="h-4 w-4 text-blue-600" />
                <span>📍 You are here</span>
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {/* Render Clusters and Individual Pins */}
      {clusters.map((cluster, idx) => {
        if (cluster.items.length > 1 && zoom < 15) {
          return (
            <Marker
              key={`cluster-${idx}`}
              position={cluster.center}
              icon={createClusterIcon(cluster.items.length)}
            >
              <Popup>
                <div className="p-2 space-y-2 text-xs max-w-xs">
                  <span className="font-bold text-slate-900 block text-xs border-b border-slate-100 pb-1">
                    {cluster.items.length} Nearby Issues Clustered
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {cluster.items.map((cmp) => {
                      const catObj = PLAIN_CATEGORY_LABELS[cmp.category];
                      return (
                        <div
                          key={cmp.id}
                          onClick={() => onSelectComplaint && onSelectComplaint(cmp)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <span className="font-medium text-slate-800 text-[11px] truncate flex items-center gap-1">
                            <span>{catObj?.icon || '⚠️'}</span> {cmp.title}
                          </span>
                          <span className="text-[10px] text-blue-600 font-bold">View →</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        }

        // Single Marker rendering
        const cmp = cluster.items[0];
        const catObj = PLAIN_CATEGORY_LABELS[cmp.category];
        const categoryName = catObj ? catObj[lang] : cmp.categoryLabel;
        const statusConf = PLAIN_STATUS_CONFIG[cmp.status] || PLAIN_STATUS_CONFIG.PENDING;
        const statusLabel = statusConf[lang] || statusConf.label;

        return (
          <Marker
            key={cmp.id}
            position={[cmp.location.latitude, cmp.location.longitude]}
            icon={createCustomPinIcon(cmp)}
          >
            <Popup className="civic-map-popup">
              <div className="p-2 space-y-2 text-xs max-w-xs font-sans">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <span>{catObj?.icon || '⚠️'}</span> {categoryName}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusConf.badgeClass}`}>
                    {statusLabel}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{cmp.description}</p>

                <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-100 text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-600" /> {cmp.location.ward}
                  </span>
                  <span>{cmp.reportCount} citizens reported</span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {onSupportComplaint && cmp.status !== 'RESOLVED' && (
                    <button
                      onClick={() => onSupportComplaint(cmp)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200 flex items-center justify-center gap-1 hover:bg-blue-100"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>Support</span>
                    </button>
                  )}

                  {onSelectComplaint && (
                    <button
                      onClick={() => onSelectComplaint(cmp)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center space-x-1 hover:bg-blue-700 shadow-sm"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View Report</span>
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default CivicMapInner;
