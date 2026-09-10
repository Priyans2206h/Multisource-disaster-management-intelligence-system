import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDisaster } from '../../store/disasterContext';
import { Severity } from '../../types';
import { 
  Layers, 
  Crosshair, 
  Filter, 
  MapPin, 
  AlertTriangle, 
  Siren, 
  Truck, 
  Home, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  Globe,
  Waves,
  Navigation,
  RotateCw,
  Check
} from 'lucide-react';

interface DisasterMapProps {
  height?: string;
  onSelectIncident?: (id: string) => void;
  showFilters?: boolean;
}

// Map Tile Layer Presets
const TILE_LAYERS = {
  osm_standard: {
    name: 'Standard View',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '',
    maxZoom: 19,
  },
  osm_hot: {
    name: 'Humanitarian / Relief View',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '',
    maxZoom: 19,
  },
  opentopomap: {
    name: 'Topographic Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '',
    maxZoom: 17,
  },
  carto_clean: {
    name: 'Clean Tactical View',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '',
    maxZoom: 19,
  },
};

type TileLayerKey = keyof typeof TILE_LAYERS;

export const DisasterMap: React.FC<DisasterMapProps> = ({
  height = '100%',
  onSelectIncident,
  showFilters = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hazardOverlayGroupRef = useRef<L.LayerGroup | null>(null);

  const {
    incidents,
    sosRequests,
    resources,
    shelters,
    selectedIncidentId,
    selectIncident,
    selectedCity,
    selectedLocality,
    activeCityInfo,
    activeLocalityInfo,
    emergencyHelps,
  } = useDisaster();

  // Active Tile Layer (Default to standard)
  const [activeTileSource, setActiveTileSource] = useState<TileLayerKey>('osm_standard');

  // Layer visibility toggles
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showSos, setShowSos] = useState<boolean>(true);
  const [showResources, setShowResources] = useState<boolean>(true);
  const [showShelters, setShowShelters] = useState<boolean>(true);
  const [showHelps, setShowHelps] = useState<boolean>(true);
  const [showFloodZones, setShowFloodZones] = useState<boolean>(true);

  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null); // in km

  const DEFAULT_CENTER: [number, number] = activeLocalityInfo
    ? [activeLocalityInfo.latitude, activeLocalityInfo.longitude]
    : [23.028, 72.572];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if container has one to prevent React StrictMode duplicate errors
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCenter: [number, number] = activeLocalityInfo
      ? [activeLocalityInfo.latitude, activeLocalityInfo.longitude]
      : activeCityInfo ? activeCityInfo.center : DEFAULT_CENTER;
    const initialZoom = 14;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Add standard Leaflet zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add Leaflet metric scale control (open source GIS standard)
    L.control.scale({ metric: true, imperial: false, position: 'bottomright' }).addTo(map);

    // Add initial Tile Layer
    const tileCfg = TILE_LAYERS[activeTileSource];
    const initialTileLayer = L.tileLayer(tileCfg.url, {
      attribution: tileCfg.attribution,
      maxZoom: tileCfg.maxZoom,
    }).addTo(map);
    activeTileLayerRef.current = initialTileLayer;

    // Layer groups for markers and overlays
    hazardOverlayGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Ensure Leaflet invalidates size on resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    // Also trigger delayed invalidation
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Smoothly auto-fly to locality coordinates when city or locality changes
  useEffect(() => {
    if (!mapInstanceRef.current || !activeLocalityInfo) return;
    mapInstanceRef.current.flyTo(
      [activeLocalityInfo.latitude, activeLocalityInfo.longitude],
      14,
      { duration: 0.8 }
    );
  }, [activeLocalityInfo?.latitude, activeLocalityInfo?.longitude]);

  // Switch Tile Layer when activeTileSource changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (activeTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(activeTileLayerRef.current);
    }
    const tileCfg = TILE_LAYERS[activeTileSource];
    const newTileLayer = L.tileLayer(tileCfg.url, {
      attribution: tileCfg.attribution,
      maxZoom: tileCfg.maxZoom,
    }).addTo(mapInstanceRef.current);
    activeTileLayerRef.current = newTileLayer;
    newTileLayer.bringToBack();
  }, [activeTileSource]);

  // Update Flood Hazard Zone Polygon Overlays (Leaflet Polygons)
  useEffect(() => {
    if (!mapInstanceRef.current || !hazardOverlayGroupRef.current) return;
    const group = hazardOverlayGroupRef.current;
    group.clearLayers();

    if (!showFloodZones) return;

    // Sabarmati River Inundation Corridor (Simulated Inundation Polygons in Leaflet)
    const floodCorridorCoords: [number, number][] = [
      [23.065, 72.585],
      [23.055, 72.580],
      [23.045, 72.576],
      [23.030, 72.572],
      [23.015, 72.564],
      [23.000, 72.560],
      [22.985, 72.568],
      [22.990, 72.580],
      [23.010, 72.578],
      [23.035, 72.584],
      [23.055, 72.592],
      [23.065, 72.585],
    ];

    const floodPolygon = L.polygon(floodCorridorCoords, {
      color: '#2563EB',
      weight: 2,
      fillColor: '#3B82F6',
      fillOpacity: 0.18,
      dashArray: '5, 5',
    });

    floodPolygon.bindPopup(`
      <div style="font-family: Inter, sans-serif; min-width: 180px;">
        <span style="font-size: 10px; font-weight: 800; color: #2563EB; text-transform: uppercase;">
          HIGH FLOOD RISK ZONE
        </span>
        <h4 style="font-size: 12px; font-weight: 700; margin: 4px 0;">
          Sabarmati Riverfront Corridor
        </h4>
        <p style="font-size: 11px; color: #475569; margin: 0;">
          Water level gauge: 136.4 ft (Breach threshold: 135.0 ft). Low-lying roads inundated.
        </p>
      </div>
    `);

    floodPolygon.addTo(group);
  }, [showFloodZones]);

  // Update Markers whenever data or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    const layerGroup = markersLayerGroupRef.current;
    layerGroup.clearLayers();

    // 0. Plot Selected Locality Center Pin
    if (activeLocalityInfo) {
      const locMarkerHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(37, 99, 235, 0.25);
            animation: subtle-pulse 1.5s infinite;
          "></div>
          <div style="
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #2563EB;
            border: 3px solid #FFFFFF;
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);
          "></div>
          <div style="
            position: absolute;
            top: -22px;
            background: #0B1220;
            color: #93C5FD;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            white-space: nowrap;
            border: 1px solid rgba(147, 197, 253, 0.4);
            letter-spacing: 0.04em;
          ">
            ${activeLocalityInfo.name.toUpperCase()}
          </div>
        </div>
      `;

      const locIcon = L.divIcon({
        html: locMarkerHtml,
        className: 'custom-locality-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const locMarker = L.marker([activeLocalityInfo.latitude, activeLocalityInfo.longitude], {
        icon: locIcon,
        title: `Selected Locality: ${activeLocalityInfo.name}, ${selectedCity}`,
      });

      locMarker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 200px; padding: 2px;">
          <div style="font-size: 9px; font-weight: 800; color: #2563EB; letter-spacing: 0.05em; text-transform: uppercase;">
            SELECTED LOCALITY
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin: 2px 0;">
            ${activeLocalityInfo.name}, ${selectedCity}
          </div>
          <div style="font-size: 11px; font-family: monospace; color: #1E293B; background: #F1F5F9; padding: 4px 6px; border-radius: 4px; margin: 4px 0; border: 1px solid #CBD5E1;">
            ${activeLocalityInfo.latitude.toFixed(4)}° N, ${activeLocalityInfo.longitude.toFixed(4)}° E
          </div>
          ${activeLocalityInfo.zone ? `<div style="font-size: 10px; color: #64748B; margin-top: 2px;">Zone: <strong>${activeLocalityInfo.zone}</strong></div>` : ''}
          <div style="font-size: 10px; color: #475569; margin-top: 4px; padding-top: 4px; border-top: 1px solid #E2E8F0;">
            Active municipal zone for citizen shelters, helplines, and distribution depots.
          </div>
        </div>
      `);
      locMarker.addTo(layerGroup);
    }

    // Dynamic Reference Center for Radius Filter
    const refCenter: [number, number] = activeLocalityInfo
      ? [activeLocalityInfo.latitude, activeLocalityInfo.longitude]
      : DEFAULT_CENTER;

    // 1. Draw Optional Radius Circle if active
    if (radiusFilter) {
      L.circle(refCenter, {
        radius: radiusFilter * 1000,
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(layerGroup);
    }

    // Helper: Severity Colors per design.MD
    const getSeverityColor = (sev: Severity) => {
      switch (sev) {
        case 'CRITICAL': return '#DC2626';
        case 'HIGH': return '#EA580C';
        case 'MEDIUM': return '#F59E0B';
        case 'LOW': return '#16A34A';
        case 'UNVERIFIED': return '#64748B';
        default: return '#64748B';
      }
    };

    // 2. Plot Incidents
    if (showIncidents) {
      incidents.forEach((inc) => {
        if (selectedSeverity !== 'ALL' && inc.severity !== selectedSeverity) return;
        if (selectedCategory !== 'ALL' && inc.type !== selectedCategory) return;
        if (radiusFilter) {
          const distKm = mapInstanceRef.current?.distance(refCenter, [inc.latitude, inc.longitude]) || 0;
          if (distKm > radiusFilter * 1000) return;
        }

        const color = getSeverityColor(inc.severity);
        const isVerified = inc.verified;
        const isSelected = inc.id === selectedIncidentId;

        const markerHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${isSelected ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 3px solid ${color}; opacity: 0.6; animation: subtle-pulse 1.5s infinite;"></div>` : ''}
            <div style="
              width: ${isSelected ? '34px' : '28px'};
              height: ${isSelected ? '34px' : '28px'};
              border-radius: 50%;
              background: ${color};
              border: ${isVerified ? '2.5px solid #FFFFFF' : '2.5px dashed #FFFFFF'};
              box-shadow: 0 2px 8px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: 11px;
            ">
              ${isVerified ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : '?'}
            </div>
            <div style="
              position: absolute;
              bottom: -16px;
              background: #0B1220;
              color: white;
              font-size: 9px;
              font-weight: 700;
              padding: 1px 4px;
              border-radius: 4px;
              white-space: nowrap;
              pointer-events: none;
              border: 1px solid rgba(255,255,255,0.2);
            ">
              #${inc.id}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'custom-incident-marker',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([inc.latitude, inc.longitude], { icon });

        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 220px; padding: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: #64748B;">INCIDENT #${inc.id}</span>
              <span style="font-size: 9px; font-weight: 700; background: ${color}; color: white; padding: 1px 6px; border-radius: 4px;">
                ${inc.severity}
              </span>
            </div>
            <h4 style="font-size: 12px; font-weight: 700; color: #111827; margin: 0 0 4px 0; line-height: 1.3;">
              ${inc.title}
            </h4>
            <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">
              ${inc.locationName}
            </p>
            <div style="font-size: 11px; color: #1F2937; margin-bottom: 8px;">
              <strong>People affected:</strong> ${inc.affectedPeople}
            </div>
            <button id="btn-select-incident-${inc.id}" style="
              width: 100%;
              background: #2563EB;
              color: white;
              font-size: 11px;
              font-weight: 600;
              padding: 6px;
              border-radius: 6px;
              border: none;
              cursor: pointer;
            ">
              Open Incident Detail Panel →
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-select-incident-${inc.id}`);
          if (btn) {
            btn.onclick = () => {
              selectIncident(inc.id);
              if (onSelectIncident) onSelectIncident(inc.id);
            };
          }
        });

        marker.on('click', () => {
          selectIncident(inc.id);
          if (onSelectIncident) onSelectIncident(inc.id);
        });

        marker.addTo(layerGroup);
      });
    }

    // 3. Plot SOS Requests
    if (showSos) {
      sosRequests.forEach((sos) => {
        if (sos.status === 'RESOLVED') return;

        const isNew = sos.status === 'NEW';
        const sosMarkerHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 42px;
              height: 42px;
              border-radius: 50%;
              background: rgba(220, 38, 38, 0.35);
              animation: subtle-pulse 1.2s infinite;
            "></div>
            <div style="
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: #DC2626;
              border: 2px solid #FFFFFF;
              box-shadow: 0 0 12px rgba(220, 38, 38, 0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 800;
              font-size: 10px;
            ">
              SOS
            </div>
            ${isNew ? `
              <div style="
                position: absolute;
                top: -8px;
                right: -6px;
                background: #F59E0B;
                color: #000;
                font-size: 8px;
                font-weight: 800;
                padding: 1px 3px;
                border-radius: 3px;
              ">NEW</div>
            ` : ''}
          </div>
        `;

        const icon = L.divIcon({
          html: sosMarkerHtml,
          className: 'custom-sos-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([sos.latitude, sos.longitude], { icon });
        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: #DC2626;">EMERGENCY SOS #${sos.id}</span>
              <span style="font-size: 9px; font-weight: 700; background: #DC2626; color: white; padding: 1px 6px; border-radius: 4px;">
                ${sos.status}
              </span>
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 4px;">
              ${sos.userName} (${sos.peopleCount} people)
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
              ${sos.locationName}
            </div>
            <p style="font-size: 11px; color: #1F2937; margin: 4px 0 8px 0; background: #FEF2F2; padding: 6px; border-radius: 4px; border: 1px solid #FEE2E2;">
              "${sos.description || 'Emergency assistance requested'}"
            </p>
            <div style="font-size: 11px; color: #64748B;">
              Contact: <strong>${sos.userPhone}</strong>
            </div>
          </div>
        `);
        marker.addTo(layerGroup);
      });
    }

    // 4. Plot Resources
    if (showResources) {
      resources.forEach((res) => {
        let resIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5"><path d="M10 17h4V5H10v12zm-4-4h12V9H6v4z"/></svg>';
        if (res.type === 'rescue_team') resIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EA580C" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>';
        if (res.type === 'fire_unit') resIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
        if (res.type === 'police') resIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
        if (res.type === 'supplies') resIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2.5"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>';

        const statusBg =
          res.status === 'AVAILABLE' ? '#16A34A' : res.status === 'DEPLOYED' ? '#EA580C' : '#2563EB';

        const resourceMarkerHtml = `
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 6px;
            background: #FFFFFF;
            border: 2px solid ${statusBg};
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${resIconSvg}
          </div>
        `;

        const icon = L.divIcon({
          html: resourceMarkerHtml,
          className: 'custom-resource-marker',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([res.latitude, res.longitude], { icon });
        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 180px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748B;">RESOURCE</div>
            <div style="font-size: 12px; font-weight: 700; color: #111827;">${res.name}</div>
            <div style="font-size: 10px; font-weight: 700; color: ${statusBg}; margin: 2px 0 4px 0;">
              Status: ${res.status}
            </div>
            <div style="font-size: 11px; color: #475569;">Zone: ${res.locationZone}</div>
            <div style="font-size: 11px; color: #475569;">Contact: ${res.contact}</div>
          </div>
        `);
        marker.addTo(layerGroup);
      });
    }

    // 5. Plot Shelters
    if (showShelters) {
      shelters.forEach((sh) => {
        const occupancyPct = Math.round((sh.currentOccupancy / sh.capacity) * 100);
        const isFull = sh.status === 'FULL' || occupancyPct >= 95;

        const shelterMarkerHtml = `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #7C3AED;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        `;

        const icon = L.divIcon({
          html: shelterMarkerHtml,
          className: 'custom-shelter-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([sh.latitude, sh.longitude], { icon });
        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 200px;">
            <div style="font-size: 10px; font-weight: 700; color: #7C3AED;">RELIEF SHELTER</div>
            <div style="font-size: 12px; font-weight: 700; color: #111827;">${sh.name}</div>
            <div style="font-size: 11px; color: #475569; margin: 2px 0;">${sh.locationName}</div>
            <div style="margin: 6px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 600;">
                <span>Occupancy:</span>
                <span>${sh.currentOccupancy} / ${sh.capacity} (${occupancyPct}%)</span>
              </div>
              <div style="width: 100%; height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden; margin-top: 2px;">
                <div style="width: ${Math.min(occupancyPct, 100)}%; height: 100%; background: ${isFull ? '#DC2626' : '#16A34A'};"></div>
              </div>
            </div>
            <div style="font-size: 10px; color: ${isFull ? '#DC2626' : '#16A34A'}; font-weight: 700;">
              ${isFull ? 'SHELTER AT CAPACITY' : 'ADMITTING CITIZENS'}
            </div>
          </div>
        `);
        marker.addTo(layerGroup);
      });
    }

    // 6. Plot Emergency Helps & Relief Facilities
    if (showHelps && emergencyHelps) {
      const cityHelps = emergencyHelps.filter((h) => h.city === selectedCity);
      cityHelps.forEach((help) => {
        let helpBg = '#2563EB';
        let helpIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';

        if (help.category === 'medical') {
          helpBg = '#DC2626';
          helpIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>';
        } else if (help.category === 'food_water') {
          helpBg = '#059669';
          helpIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
        } else if (help.category === 'assembly_point') {
          helpBg = '#D97706';
          helpIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>';
        }

        const helpMarkerHtml = `
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 6px;
            background: ${helpBg};
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          ">
            ${helpIconSvg}
          </div>
        `;

        const icon = L.divIcon({
          html: helpMarkerHtml,
          className: 'custom-help-marker',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([help.latitude, help.longitude], { icon });
        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 210px; padding: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
              <span style="font-size: 9px; font-weight: 800; color: ${helpBg}; text-transform: uppercase;">
                ${help.category.replace('_', ' ')}
              </span>
              <span style="font-size: 9px; font-weight: 700; color: #64748B; background: #F1F5F9; padding: 1px 5px; border-radius: 4px;">
                ${help.operationalHours}
              </span>
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">
              ${help.name}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
              ${help.address}
            </div>
            <div style="font-size: 11px; color: #334155; background: #F8FAFC; padding: 5px; border-radius: 4px; border: 1px solid #E2E8F0; margin-bottom: 5px;">
              ${help.details}
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #2563EB;">
              <a href="tel:${help.phone.split('/')[0].trim()}" style="color: #2563EB; text-decoration: none;">
                Call: ${help.phone}
              </a>
            </div>
          </div>
        `);
        marker.addTo(layerGroup);
      });
    }
  }, [
    incidents,
    sosRequests,
    resources,
    shelters,
    emergencyHelps,
    selectedIncidentId,
    showIncidents,
    showSos,
    showResources,
    showShelters,
    showHelps,
    showFloodZones,
    selectedSeverity,
    selectedCategory,
    radiusFilter,
    activeLocalityInfo,
    selectedCity,
  ]);

  // Center map on selected incident if changed
  useEffect(() => {
    if (!selectedIncidentId || !mapInstanceRef.current) return;
    const target = incidents.find((i) => i.id === selectedIncidentId);
    if (target) {
      mapInstanceRef.current.panTo([target.latitude, target.longitude], { animate: true, duration: 0.8 });
    }
  }, [selectedIncidentId, incidents]);

  const recenterMap = () => {
    if (mapInstanceRef.current && activeLocalityInfo) {
      mapInstanceRef.current.flyTo(
        [activeLocalityInfo.latitude, activeLocalityInfo.longitude],
        14,
        { duration: 0.8 }
      );
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-100 overflow-hidden" style={{ minHeight: height }}>
      {/* Top Filter & Open Source Layer Bar */}
      {showFilters && (
        <div className="z-20 bg-surface/95 backdrop-blur-sm border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          {/* Layer toggles */}
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Layers:
            </span>
            <button
              onClick={() => setShowIncidents(!showIncidents)}
              className={`px-2 py-1 rounded-md text-xs font-semibold border transition-all ${
                showIncidents
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              Incidents ({incidents.length})
            </button>
            <button
              onClick={() => setShowSos(!showSos)}
              className={`px-2 py-1 rounded-md text-xs font-semibold border transition-all ${
                showSos
                  ? 'bg-red-50 text-red-700 border-red-200 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              SOS ({sosRequests.filter((s) => s.status !== 'RESOLVED').length})
            </button>
            <button
              onClick={() => setShowResources(!showResources)}
              className={`px-2 py-1 rounded-md text-xs font-semibold border transition-all ${
                showResources
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              Resources ({resources.length})
            </button>
            <button
              onClick={() => setShowShelters(!showShelters)}
              className={`px-2 py-1 rounded-md text-xs font-semibold border transition-all ${
                showShelters
                  ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              Shelters ({shelters.filter((s) => s.city === selectedCity).length})
            </button>
            <button
              onClick={() => setShowHelps(!showHelps)}
              className={`px-2 py-1 rounded-md text-xs font-semibold border transition-all ${
                showHelps
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              Relief Helps ({emergencyHelps.filter((h) => h.city === selectedCity).length})
            </button>
            <button
              onClick={() => setShowFloodZones(!showFloodZones)}
              className={`px-2 py-1 rounded-md text-xs font-semibold border transition-all flex items-center gap-1 ${
                showFloodZones
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-200 shadow-sm'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
              title="Toggle River Inundation Hazard Polygon"
            >
              <Waves className="w-3 h-3 text-cyan-600" />
              Flood Zones
            </button>
          </div>

          {/* Open-Source Tile Switcher + Severity & Radius Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Open Source Map Layer Selector */}
            <div className="flex items-center gap-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] uppercase font-bold text-slate-500">Base:</span>
              <select
                value={activeTileSource}
                onChange={(e) => setActiveTileSource(e.target.value as TileLayerKey)}
                className="bg-blue-50 border border-blue-300 text-blue-900 text-xs rounded-md px-2 py-1 font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                title="Select Base Map Layer"
              >
                <option value="osm_standard">Standard View</option>
                <option value="osm_hot">Humanitarian Relief View</option>
                <option value="opentopomap">Topographic Terrain</option>
                <option value="carto_clean">Clean Tactical View</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500">Severity:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md px-2 py-1 font-medium focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="ALL">All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500">Radius:</span>
              <select
                value={radiusFilter === null ? 'ALL' : radiusFilter.toString()}
                onChange={(e) => setRadiusFilter(e.target.value === 'ALL' ? null : Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md px-2 py-1 font-medium focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="ALL">All</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
              </select>
            </div>

            <button
              onClick={recenterMap}
              className="p-1.5 rounded-md border transition-all flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border-blue-200 shadow-xs"
              title={`Recenter on ${activeLocalityInfo.name}, ${selectedCity}`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">{activeLocalityInfo.name}</span>
            </button>
          </div>
        </div>
      )}

      {/* Leaflet Map Surface */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full relative" />

      {/* Floating Locality Recenter FAB */}
      <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={recenterMap}
          className="w-11 h-11 bg-white hover:bg-blue-50 active:scale-95 text-blue-600 hover:text-blue-700 rounded-xl shadow-lg border border-slate-200 flex items-center justify-center transition-all"
          title={`Center Map on ${activeLocalityInfo.name}, ${selectedCity}`}
        >
          <MapPin className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* Operational Zone Badge in Top-Left */}
      <div className="absolute top-14 left-4 z-20 bg-surface/95 backdrop-blur-sm border border-slate-200 rounded-lg px-2.5 py-1 shadow-sm text-[10px] font-bold text-slate-700 flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
        <span className="text-emerald-700 font-extrabold">{selectedCity.toUpperCase()} &bull; {activeLocalityInfo.name.toUpperCase()}</span>
      </div>

      {/* Map Legend (Floating in Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 bg-surface/90 backdrop-blur-sm border border-slate-200 rounded-lg p-2.5 shadow-md text-[11px] text-slate-700 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-600 border border-white"></div>
          <span className="font-semibold text-slate-800">Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500 border border-white"></div>
          <span className="font-medium text-slate-700">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-ping"></div>
          <span className="font-bold text-red-700">Active SOS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-purple-600 border border-white"></div>
          <span className="font-medium text-slate-700">Shelter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-600 border border-white"></div>
          <span className="font-medium text-slate-700">Relief Help</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2 bg-blue-500/40 border border-blue-600 border-dashed"></div>
          <span className="font-medium text-blue-900">Flood Zone</span>
        </div>
      </div>
    </div>
  );
};
