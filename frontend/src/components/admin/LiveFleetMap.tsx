import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin, Navigation, Gauge, Fuel, ShieldAlert, Radio, RefreshCw, Eye, Truck, User,
  Layers, Maximize2, Minimize2, Play, Pause, RotateCcw, Search, Filter, AlertTriangle,
  Zap, Wrench, CheckCircle2, Building2, Flame, Map as MapIcon, Sliders, Volume2, Shield
} from 'lucide-react';
import {
  INITIAL_FLEET_VEHICLES,
  generateLargeFleetDataset,
  INDIA_DEPOTS_AND_INFRA,
  INDIA_GEOFENCES,
} from '../../services/indiaGeospatialData';
import type {
  DetailedVehicleTelemetry,
  GeospatialPoint,
  GeofenceZone,
} from '../../services/indiaGeospatialData';
import { fleetSocketService } from '../../services/fleetSocket';
import { masterUnifiedStore } from '../../services/masterUnifiedStore';
import L from 'leaflet';

// Dynamically inject Leaflet CSS if not already loaded
if (typeof document !== 'undefined' && !document.getElementById('leaflet-css-cdn')) {
  const link = document.createElement('link');
  link.id = 'leaflet-css-cdn';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

export const LiveFleetMap: React.FC = () => {
  // State variables
  const [vehicles, setVehicles] = useState<DetailedVehicleTelemetry[]>(INITIAL_FLEET_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<DetailedVehicleTelemetry | null>(INITIAL_FLEET_VEHICLES[0]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Theme observer state
  const [isLightTheme, setIsLightTheme] = useState<boolean>(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('light-theme') : false
  );

  // Map Layer & Feature Toggles - Default to Google Roadmap View
  const [mapProvider, setMapProvider] = useState<'google_dark' | 'google_roadmap' | 'google_satellite' | 'google_terrain'>('google_roadmap');
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showGeofences, setShowGeofences] = useState<boolean>(true);
  const [showInfra, setShowInfra] = useState<boolean>(true);
  const [useLargeFleet, setUseLargeFleet] = useState<boolean>(false);

  // Fullscreen & Telemetry State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [socketStatus, setSocketStatus] = useState<string>('connecting');
  const [pingsCount, setPingsCount] = useState<number>(14820);
  const [isReplayingRoute, setIsReplayingRoute] = useState<boolean>(false);
  const [replayProgress, setReplayProgress] = useState<number>(0);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [isPlayingReplay, setIsPlayingReplay] = useState<boolean>(false);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const infraGroupRef = useRef<L.LayerGroup | null>(null);
  const geofencesGroupRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const replayMarkerRef = useRef<L.Marker | null>(null);
  const replayIntervalRef = useRef<number | null>(null);

  // Observe theme changes (light-theme class on html root)
  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light-theme');
      setIsLightTheme(isLight);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);


  // Load Large Fleet Dataset or Canonical Master Store on demand
  useEffect(() => {
    if (useLargeFleet) {
      const dataset = generateLargeFleetDataset(1000);
      setVehicles(dataset);
      setSelectedVehicle(dataset[0]);
      fleetSocketService.connect(dataset);
    } else {
      const canonicals = masterUnifiedStore.getVehicles();
      setVehicles(canonicals);
      setSelectedVehicle(canonicals[0]);
      fleetSocketService.connect(canonicals);
    }
  }, [useLargeFleet]);

  // Subscribe to Master Unified Store changes
  useEffect(() => {
    const syncFromStore = () => {
      if (!useLargeFleet) {
        const canonicals = masterUnifiedStore.getVehicles();
        setVehicles(canonicals);
        if (selectedVehicle) {
          const curr = canonicals.find((v) => v.id === selectedVehicle.id);
          if (curr) setSelectedVehicle(curr);
        }
      }
    };
    return masterUnifiedStore.subscribe(syncFromStore);
  }, [useLargeFleet, selectedVehicle?.id]);

  // Connect WebSockets / Socket.io GPS Telemetry Stream
  useEffect(() => {
    const unsubscribe = fleetSocketService.subscribe((updatedVehicles, count) => {
      setVehicles(updatedVehicles);
      setPingsCount(count);
      setSocketStatus(fleetSocketService.getStatus());
      // Update selected vehicle live references
      if (selectedVehicle) {
        const current = updatedVehicles.find((v) => v.id === selectedVehicle.id);
        if (current) setSelectedVehicle(current);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedVehicle?.id]);

  // Filtered vehicles calculation
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && v.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          v.vehicleNumber.toLowerCase().includes(q) ||
          v.driverName.toLowerCase().includes(q) ||
          v.currentLocation.toLowerCase().includes(q) ||
          v.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vehicles, statusFilter, categoryFilter, searchQuery]);

  // Status color mapper - soft, lightened, elegant corporate palette
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return '#4a80db'; // Soft Muted Blue
      case 'Available': return '#3bb074';  // Soft Muted Green
      case 'Idle': return '#e29b38';       // Soft Muted Warm Amber
      case 'Maintenance': return '#8c6be8';// Soft Muted Lavender
      case 'Blocked': return '#e05252';    // Soft Muted Coral Red
      default: return '#718096';
    }
  };

  // 1. Initialize Map Instance (Centered on India by default)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center of India: Lat 20.5937, Lng 78.9629, Zoom Level 5
    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Custom Layer Groups
    markersGroupRef.current = L.layerGroup().addTo(map);
    infraGroupRef.current = L.layerGroup().addTo(map);
    geofencesGroupRef.current = L.layerGroup().addTo(map);

    // Initial Tile Layer setup
    updateTileLayer(map, mapProvider);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Tile Provider Switcher (Google Maps / Enterprise Dark / Satellite / Terrain)
  const updateTileLayer = (map: L.Map, provider: string) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';

    if (provider === 'google_roadmap') {
      tileUrl = 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      subdomains = 'mt0,mt1,mt2,mt3';
    } else if (provider === 'google_satellite') {
      tileUrl = 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}';
      subdomains = 'mt0,mt1,mt2,mt3';
    } else if (provider === 'google_terrain') {
      tileUrl = 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      subdomains = 'mt0,mt1,mt2,mt3';
    }

    const newLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: subdomains.split(','),
    }).addTo(map);

    tileLayerRef.current = newLayer;
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateTileLayer(mapInstanceRef.current, mapProvider);
    }
  }, [mapProvider]);

  // 3. Render Geofences Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !geofencesGroupRef.current) return;
    geofencesGroupRef.current.clearLayers();

    if (!showGeofences) return;

    INDIA_GEOFENCES.forEach((zone) => {
      if (zone.type === 'circle' && zone.center) {
        const circle = L.circle([zone.center.lat, zone.center.lng], {
          radius: zone.radiusMeters || 10000,
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.12,
          weight: 2,
          dashArray: '4, 4',
        });
        circle.bindTooltip(`<b>${zone.name}</b><br/>Type: ${zone.category}`, {
          permanent: false,
          direction: 'top',
          className: 'custom-map-tooltip',
        });
        geofencesGroupRef.current?.addLayer(circle);
      }
    });
  }, [showGeofences]);

  // 4. Render Infrastructure Layer (Depots, Toll Plazas, Fuel Stations, Service Centers)
  useEffect(() => {
    if (!mapInstanceRef.current || !infraGroupRef.current) return;
    infraGroupRef.current.clearLayers();

    if (!showInfra) return;

    INDIA_DEPOTS_AND_INFRA.forEach((pt) => {
      let iconHtml = '🏢';
      let iconBg = '#38bdf8';
      if (pt.category === 'toll_plaza') { iconHtml = '🛑'; iconBg = '#ef4444'; }
      else if (pt.category === 'fuel_station') { iconHtml = '⛽'; iconBg = '#f59e0b'; }
      else if (pt.category === 'service_center') { iconHtml = '🔧'; iconBg = '#a855f7'; }

      const customIcon = L.divIcon({
        className: 'infra-map-marker',
        html: `
          <div style="
            background: ${iconBg};
            color: #fff;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            box-shadow: 0 0 10px ${iconBg}88;
            border: 2px solid #ffffff;
          ">
            ${iconHtml}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; color: #0f172a;">${pt.name}</h4>
          <p style="margin: 0; font-size: 11px; color: #475569;">${pt.address}, ${pt.city}</p>
          <span style="font-size: 10px; font-weight: 700; color: ${iconBg};">${pt.details || pt.category}</span>
        </div>
      `);

      infraGroupRef.current?.addLayer(marker);
    });
  }, [showInfra]);

  // 5. Render Vehicle Markers with Heading Rotation & Clustering
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();

    if (useLargeFleet) {
      // Clustering grid simulation for 1000+ vehicles
      const gridClusters: Record<string, DetailedVehicleTelemetry[]> = {};
      const zoom = mapInstanceRef.current.getZoom();
      const gridSize = zoom > 7 ? 0.5 : zoom > 5 ? 1.5 : 3.5;

      filteredVehicles.forEach((v) => {
        const gridKey = `${Math.floor(v.lat / gridSize)}_${Math.floor(v.lng / gridSize)}`;
        if (!gridClusters[gridKey]) gridClusters[gridKey] = [];
        gridClusters[gridKey].push(v);
      });

      Object.entries(gridClusters).forEach(([_, clusterList]) => {
        if (clusterList.length === 1) {
          renderSingleVehicleMarker(clusterList[0]);
        } else {
          // Render Cluster Badge Marker
          const avgLat = clusterList.reduce((acc, curr) => acc + curr.lat, 0) / clusterList.length;
          const avgLng = clusterList.reduce((acc, curr) => acc + curr.lng, 0) / clusterList.length;

          const clusterIcon = L.divIcon({
            className: 'vehicle-cluster-marker',
            html: `
              <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 2px solid #38bdf8;
                box-shadow: 0 0 16px rgba(56, 189, 248, 0.4);
                color: #ffffff;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 13px;
                cursor: pointer;
              ">
                <span>${clusterList.length}</span>
                <span style="font-size: 8px; color: #38bdf8;">FLEET</span>
              </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });

          const clusterMarker = L.marker([avgLat, avgLng], { icon: clusterIcon });
          clusterMarker.on('click', () => {
            mapInstanceRef.current?.setView([avgLat, avgLng], (mapInstanceRef.current?.getZoom() || 5) + 2);
          });
          markersGroupRef.current?.addLayer(clusterMarker);
        }
      });
    } else {
      // Standard Vehicle Marker rendering
      filteredVehicles.forEach((v) => renderSingleVehicleMarker(v));
    }
  }, [filteredVehicles, selectedVehicle?.id, useLargeFleet]);

  // Helper to render individual rotating vehicle marker
  const renderSingleVehicleMarker = (v: DetailedVehicleTelemetry) => {
    const isSelected = selectedVehicle?.id === v.id;
    const statusColor = getStatusColor(v.status);

    // Solid status-colored vehicle pointer badge with simple location pin logo
    const markerIconHtml = `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px 4px 6px;
        border-radius: 18px;
        background-color: ${statusColor};
        color: #ffffff;
        border: ${isSelected ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.25)'};
        box-shadow: ${isSelected ? '0 4px 14px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)'};
        transform: scale(${isSelected ? '1.12' : '1'});
        transition: all 0.2s ease;
      ">
        <!-- Truck Front Vector Logo matching user specification -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
        ">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7C8 4.79 9.79 3 12 3H20C22.21 3 24 4.79 24 7V10H8V7Z" fill="#ffffff"/>
            <rect x="5" y="9" width="22" height="18" rx="4" fill="#ffffff"/>
            <path d="M2 14C2 12.5 5 12 5 12V18C5 18 2 17.5 2 16V14Z" fill="#ffffff"/>
            <path d="M30 14C30 12.5 27 12 27 12V18C27 18 30 17.5 30 16V14Z" fill="#ffffff"/>
            <rect x="8" y="12" width="16" height="6.5" rx="2" fill="${statusColor}"/>
            <rect x="12" y="20.5" width="8" height="1.6" rx="0.8" fill="${statusColor}"/>
            <rect x="12" y="23" width="8" height="1.6" rx="0.8" fill="${statusColor}"/>
            <rect x="12" y="25.5" width="8" height="1.6" rx="0.8" fill="${statusColor}"/>
            <ellipse cx="8.5" cy="24.5" rx="1.8" ry="1.2" fill="${statusColor}"/>
            <ellipse cx="23.5" cy="24.5" rx="1.8" ry="1.2" fill="${statusColor}"/>
            <rect x="8" y="27" width="3.5" height="3" rx="1" fill="#ffffff"/>
            <rect x="20.5" y="27" width="3.5" height="3" rx="1" fill="#ffffff"/>
          </svg>
        </div>

        <!-- Registration Number -->
        <span style="font-size: 11px; font-weight: 800; color: #ffffff; white-space: nowrap; letter-spacing: 0.2px;">
          ${v.vehicleNumber}
        </span>

        <!-- Clean Speed Tag Pill -->
        ${v.status === 'In Transit' ? `
          <span style="
            font-size: 10px;
            font-weight: 800;
            color: #ffffff;
            background: rgba(0, 0, 0, 0.28);
            padding: 2px 7px;
            border-radius: 10px;
            white-space: nowrap;
            border: 1px solid rgba(255, 255, 255, 0.3);
          ">
            ⚡ ${v.speedKmH} km/h
          </span>
        ` : ''}
      </div>
    `;

    const vehicleDivIcon = L.divIcon({
      className: 'vehicle-live-marker',
      html: markerIconHtml,
      iconSize: [170, 44],
      iconAnchor: [85, 22],
    });

    const marker = L.marker([v.lat, v.lng], { icon: vehicleDivIcon });
    marker.on('click', () => {
      setSelectedVehicle(v);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([v.lat, v.lng], { animate: true, duration: 0.5 });
      }
    });

    markersGroupRef.current?.addLayer(marker);
  };

  // Pan to selected vehicle on click
  const handleSelectVehicle = (v: DetailedVehicleTelemetry) => {
    setSelectedVehicle(v);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([v.lat, v.lng], 10, { animate: true });
    }
  };

  // Pan to India view
  const handleResetMapFocus = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([20.5937, 78.9629], 5, { animate: true });
    }
  };

  // 6. Interactive Route Replay Animation
  const handleToggleRouteReplay = () => {
    if (!selectedVehicle || !selectedVehicle.routeHistory || selectedVehicle.routeHistory.length === 0) {
      alert('No breadcrumb route history available for this vehicle.');
      return;
    }

    if (isReplayingRoute) {
      // Stop replay
      setIsReplayingRoute(false);
      setIsPlayingReplay(false);
      if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
      if (routePolylineRef.current) routePolylineRef.current.remove();
      if (replayMarkerRef.current) replayMarkerRef.current.remove();
    } else {
      // Start replay
      setIsReplayingRoute(true);
      setIsPlayingReplay(true);
      setReplayProgress(0);

      const routePoints = selectedVehicle.routeHistory.map((p) => [p.lat, p.lng] as [number, number]);

      if (mapInstanceRef.current) {
        if (routePolylineRef.current) routePolylineRef.current.remove();
        routePolylineRef.current = L.polyline(routePoints, {
          color: '#38bdf8',
          weight: 4,
          dashArray: '8, 8',
        }).addTo(mapInstanceRef.current);

        mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
      }
    }
  };

  // Route Replay Playback Timer
  useEffect(() => {
    if (isPlayingReplay && selectedVehicle?.routeHistory) {
      const history = selectedVehicle.routeHistory;
      replayIntervalRef.current = window.setInterval(() => {
        setReplayProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingReplay(false);
            return 100;
          }
          return prev + 5 * replaySpeed;
        });
      }, 500);
    } else {
      if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    }

    return () => {
      if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    };
  }, [isPlayingReplay, replaySpeed, selectedVehicle]);

  // Update animated vehicle marker position during route replay
  useEffect(() => {
    if (!isReplayingRoute || !selectedVehicle?.routeHistory || !mapInstanceRef.current) return;

    const history = selectedVehicle.routeHistory;
    const index = Math.min(
      history.length - 1,
      Math.floor((replayProgress / 100) * history.length)
    );
    const point = history[index];

    if (replayMarkerRef.current) {
      replayMarkerRef.current.setLatLng([point.lat, point.lng]);
    } else {
      const replayIcon = L.divIcon({
        className: 'replay-anim-marker',
        html: `
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #0f172a;
            border: 2px solid #38bdf8;
            box-shadow: 0 0 16px #38bdf8;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 7C8 4.79 9.79 3 12 3H20C22.21 3 24 4.79 24 7V10H8V7Z" fill="#ffffff"/>
              <rect x="5" y="9" width="22" height="18" rx="4" fill="#ffffff"/>
              <path d="M2 14C2 12.5 5 12 5 12V18C5 18 2 17.5 2 16V14Z" fill="#ffffff"/>
              <path d="M30 14C30 12.5 27 12 27 12V18C27 18 30 17.5 30 16V14Z" fill="#ffffff"/>
              <rect x="8" y="12" width="16" height="6.5" rx="2" fill="#0f172a"/>
              <rect x="12" y="20.5" width="8" height="1.6" rx="0.8" fill="#0f172a"/>
              <rect x="12" y="23" width="8" height="1.6" rx="0.8" fill="#0f172a"/>
              <rect x="12" y="25.5" width="8" height="1.6" rx="0.8" fill="#0f172a"/>
              <ellipse cx="8.5" cy="24.5" rx="1.8" ry="1.2" fill="#0f172a"/>
              <ellipse cx="23.5" cy="24.5" rx="1.8" ry="1.2" fill="#0f172a"/>
              <rect x="8" y="27" width="3.5" height="3" rx="1" fill="#ffffff"/>
              <rect x="20.5" y="27" width="3.5" height="3" rx="1" fill="#ffffff"/>
            </svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      replayMarkerRef.current = L.marker([point.lat, point.lng], { icon: replayIcon }).addTo(
        mapInstanceRef.current
      );
    }
  }, [replayProgress, isReplayingRoute, selectedVehicle]);

  // Theme-aware dynamic style values
  const bgCard = isLightTheme ? 'var(--panel)' : 'var(--panel-1, #0b0f19)';
  const bgHeader = isLightTheme ? 'var(--panel-2)' : 'var(--panel-2, #0f172a)';
  const bgSection = isLightTheme ? 'var(--panel-3)' : '#1e293b';
  const bgSubtle = isLightTheme ? '#f5f6f2' : '#0f172a';
  const borderSoft = 'var(--border-soft)';
  const text1 = 'var(--text-1)';
  const text2 = 'var(--text-2)';
  const text3 = 'var(--text-3)';

  return (
    <div
      style={
        isFullscreen
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 99999,
              backgroundColor: bgCard,
              color: text1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }
          : {
              backgroundColor: bgCard,
              border: `1px solid ${borderSoft}`,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              color: text1,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }
      }
    >
      {/* Control Room Top Header */}
      <div
        style={{
          padding: '8px 14px',
          borderBottom: `1px solid ${borderSoft}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          backgroundColor: bgHeader,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <Radio size={16} color="var(--green, #38bdf8)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: text1, letterSpacing: -0.3 }}>
              India Fleet Command Map
            </h3>
            <p style={{ margin: 0, fontSize: 10, color: text3, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: socketStatus === 'connected' ? '#22c55e' : '#f59e0b' }} />
              WebSocket Telemetry: <strong>{socketStatus.toUpperCase()}</strong> ({pingsCount.toLocaleString()} Pings Processed)
            </p>
          </div>
        </div>

        {/* Top Control Tools & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={13} color="var(--text-3)" style={{ position: 'absolute', left: 8, top: 7 }} />
            <input
              type="text"
              placeholder="Search vehicle / driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '4px 10px 4px 28px',
                fontSize: 11,
                borderRadius: 6,
                border: `1px solid ${borderSoft}`,
                backgroundColor: bgCard,
                color: text1,
                outline: 'none',
                width: 180,
              }}
            />
          </div>

          {/* Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: 11,
              borderRadius: 6,
              border: `1px solid ${borderSoft}`,
              backgroundColor: bgCard,
              color: text1,
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="In Transit">In Transit</option>
            <option value="Available">Available</option>
            <option value="Idle">Idle</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Blocked">Blocked</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: 11,
              borderRadius: 6,
              border: `1px solid ${borderSoft}`,
              backgroundColor: bgCard,
              color: text1,
            }}
          >
            <option value="ALL">All Fleet Types</option>
            <option value="Owned">Owned Fleet</option>
            <option value="Vendor">Vendor Fleet</option>
          </select>

          {/* 1000+ Fleet Cluster Mode Toggle */}
          <button
            onClick={() => setUseLargeFleet(!useLargeFleet)}
            style={{
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 6,
              border: useLargeFleet ? '1px solid #38bdf8' : `1px solid ${borderSoft}`,
              backgroundColor: useLargeFleet ? 'rgba(56, 189, 248, 0.15)' : bgCard,
              color: useLargeFleet ? '#0284c7' : text1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Layers size={12} />
            <span>{useLargeFleet ? '1000+ Vehicles' : 'Active Fleet'}</span>
          </button>

          {/* Go Fullscreen Toggle Button */}
          <button
            onClick={() => {
              const next = !isFullscreen;
              setIsFullscreen(next);
              setTimeout(() => {
                mapInstanceRef.current?.invalidateSize();
              }, 200);
            }}
            style={{
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 6,
              border: isFullscreen ? '1px solid #0284c7' : `1px solid ${borderSoft}`,
              backgroundColor: isFullscreen ? '#0284c7' : bgCard,
              color: isFullscreen ? '#ffffff' : '#0284c7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s ease',
            }}
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Map Control Toolbar & Layer Switchers */}
      <div
        style={{
          padding: '5px 14px',
          backgroundColor: bgSection,
          borderBottom: `1px solid ${borderSoft}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 11,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: text3, fontWeight: 600 }}>Provider:</span>
          {[
            { key: 'google_roadmap', label: 'Google Roadmap' },
            { key: 'google_dark', label: 'Enterprise Dark' },
            { key: 'google_satellite', label: 'Satellite' },
            { key: 'google_terrain', label: 'Terrain' },
          ].map((pv) => (
            <button
              key={pv.key}
              onClick={() => setMapProvider(pv.key as any)}
              style={{
                padding: '2px 8px',
                borderRadius: 4,
                border: 'none',
                backgroundColor: mapProvider === pv.key ? '#0284c7' : 'transparent',
                color: mapProvider === pv.key ? '#ffffff' : text2,
                fontWeight: mapProvider === pv.key ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {pv.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: text2, fontSize: 11 }}>
            <input type="checkbox" checked={showGeofences} onChange={(e) => setShowGeofences(e.target.checked)} />
            Geofences
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: text2, fontSize: 11 }}>
            <input type="checkbox" checked={showInfra} onChange={(e) => setShowInfra(e.target.checked)} />
            Depots & Tolls
          </label>

          <button
            onClick={handleResetMapFocus}
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              border: `1px solid ${borderSoft}`,
              backgroundColor: bgCard,
              color: '#0284c7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600,
              fontSize: 10,
            }}
          >
            <MapIcon size={11} /> Center India
          </button>
        </div>
      </div>

      {/* Main Map Grid Layout: Interactive Map Canvas Left, Telemetry Drawer Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: isFullscreen ? 'calc(100vh - 85px)' : 380, position: 'relative' }}>
        {/* Leaflet Real-World Map Viewport */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', backgroundColor: bgSubtle }} />

          {/* Map Overlay Badge & Legend */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                backgroundColor: isLightTheme ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${borderSoft}`,
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                color: isLightTheme ? '#0284c7' : '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                pointerEvents: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              Live India Transport Network ({filteredVehicles.length} Vehicles Visible)
            </div>
          </div>

          {/* Bottom Floating Map Legend */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              zIndex: 1000,
              backgroundColor: isLightTheme ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${borderSoft}`,
              padding: '8px 14px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 11,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ color: text3, fontWeight: 700 }}>Status Colors:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
              <span style={{ color: text1 }}>In Transit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ color: text1 }}>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ color: text1 }}>Idle</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
              <span style={{ color: text1 }}>Maintenance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ color: text1 }}>Blocked</span>
            </div>
          </div>

          {/* Route Replay Bar Overlay (If active) */}
          {isReplayingRoute && selectedVehicle && (
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 1000,
                backgroundColor: isLightTheme ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid #0284c7',
                padding: '12px 16px',
                borderRadius: 10,
                width: 320,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0284c7' }}>
                  Route Replay: {selectedVehicle.vehicleNumber}
                </span>
                <button
                  onClick={handleToggleRouteReplay}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Close ✕
                </button>
              </div>

              {/* Progress Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={replayProgress}
                onChange={(e) => setReplayProgress(Number(e.target.value))}
                style={{ width: '100%', marginBottom: 10 }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setIsPlayingReplay(!isPlayingReplay)}
                  style={{
                    padding: '4px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 4,
                    border: 'none',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isPlayingReplay ? <Pause size={12} /> : <Play size={12} />}
                  {isPlayingReplay ? 'Pause' : 'Play'}
                </button>

                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 5, 10].map((sp) => (
                    <button
                      key={sp}
                      onClick={() => setReplaySpeed(sp)}
                      style={{
                        padding: '2px 6px',
                        fontSize: 10,
                        borderRadius: 3,
                        border: `1px solid ${borderSoft}`,
                        backgroundColor: replaySpeed === sp ? '#0284c7' : bgCard,
                        color: replaySpeed === sp ? '#ffffff' : text1,
                        cursor: 'pointer',
                      }}
                    >
                      {sp}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Vehicle Telemetry Side Drawer Panel */}
        <div
          style={{
            backgroundColor: bgHeader,
            borderLeft: `1px solid ${borderSoft}`,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxHeight: isFullscreen ? 'calc(100vh - 105px)' : 480,
            overflowY: 'auto',
          }}
        >
          {selectedVehicle ? (
            <div>
              {/* Status Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 20,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    backgroundColor: `${getStatusColor(selectedVehicle.status)}22`,
                    color: getStatusColor(selectedVehicle.status),
                    border: `1px solid ${getStatusColor(selectedVehicle.status)}66`,
                  }}
                >
                  ● {selectedVehicle.status}
                </span>
                <span style={{ fontSize: 11, color: text3 }}>
                  Last Ping: {selectedVehicle.lastPing}
                </span>
              </div>

              {/* 3D TRAVERSE Fleet Truck Preview Badge */}
              <div
                style={{
                  marginBottom: 16,
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: bgSection,
                  border: `1px solid ${borderSoft}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }}
              >
                <img
                  src="/traverse-truck.png"
                  alt="TRAVERSE 3D Logistics Truck"
                  style={{
                    width: 72,
                    height: 52,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
                  }}
                />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#0284c7', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    TRAVERSE FLEET ASSET
                  </div>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: 18, fontWeight: 800, color: text1 }}>
                    {selectedVehicle.vehicleNumber}
                  </h3>
                  <span style={{ fontSize: 11, color: text3 }}>
                    {selectedVehicle.category} Heavy Freight Vehicle
                  </span>
                </div>
              </div>

              {/* Location Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: bgSection,
                    border: `1px solid ${borderSoft}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <MapPin size={18} color="#22c55e" />
                  <div>
                    <span style={{ fontSize: 10, color: text3, display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Current GPS Address
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: text1, lineHeight: 1.3 }}>
                      {selectedVehicle.currentLocation}
                    </span>
                    <span style={{ fontSize: 10, color: text3, display: 'block', marginTop: 2 }}>
                      Geo: {selectedVehicle.lat.toFixed(4)}° N, {selectedVehicle.lng.toFixed(4)}° E (Heading: {selectedVehicle.heading}°)
                    </span>
                  </div>
                </div>

                {/* Driver Info */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: bgSection,
                    border: `1px solid ${borderSoft}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <User size={18} color="#3b82f6" />
                    <div>
                      <span style={{ fontSize: 10, color: text3, display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                        Assigned Driver
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: text1 }}>
                        {selectedVehicle.driverName}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#0284c7', fontWeight: 600, fontFamily: 'monospace' }}>{selectedVehicle.driverPhone}</span>
                </div>

                {/* Destination & ETA */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: bgSection,
                    border: `1px solid ${borderSoft}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Navigation size={18} color="#a855f7" />
                  <div>
                    <span style={{ fontSize: 10, color: text3, display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Destination & Calculated ETA
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: text1, display: 'block' }}>
                      {selectedVehicle.destination}
                    </span>
                    <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700 }}>
                      {selectedVehicle.eta}
                    </span>
                  </div>
                </div>
              </div>

              {/* Telemetry Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: bgSection,
                    border: `1px solid ${borderSoft}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: text3, fontSize: 11, marginBottom: 4 }}>
                    <Gauge size={14} /> Telemetry Speed
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: selectedVehicle.speedKmH > 75 ? '#ef4444' : text1 }}>
                    {selectedVehicle.speedKmH} <span style={{ fontSize: 11, fontWeight: 500, color: text3 }}>km/h</span>
                  </span>
                </div>

                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: bgSection,
                    border: `1px solid ${borderSoft}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: text3, fontSize: 11, marginBottom: 4 }}>
                    <Fuel size={14} /> Fuel Level
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: selectedVehicle.fuelLevel < 25 ? '#f59e0b' : '#22c55e' }}>
                    {selectedVehicle.fuelLevel}%
                  </span>
                </div>
              </div>

              {/* Diagnostics Box */}
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: bgSection,
                  border: `1px solid ${borderSoft}`,
                  marginBottom: 18,
                }}
              >
                <h5 style={{ margin: '0 0 8px 0', fontSize: 11, fontWeight: 700, color: text3, textTransform: 'uppercase' }}>
                  ECU Diagnostics & Vitals
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                  <div>
                    <span style={{ color: text3 }}>Engine Temp:</span>{' '}
                    <strong style={{ color: selectedVehicle.diagnostics.engineTempC > 90 ? '#ef4444' : text1 }}>
                      {selectedVehicle.diagnostics.engineTempC}°C
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: text3 }}>Tire Pressure:</span>{' '}
                    <strong style={{ color: text1 }}>{selectedVehicle.diagnostics.tirePressurePsi} PSI</strong>
                  </div>
                  <div>
                    <span style={{ color: text3 }}>Battery Volt:</span>{' '}
                    <strong style={{ color: text1 }}>{selectedVehicle.diagnostics.batteryVoltageV}V</strong>
                  </div>
                  <div>
                    <span style={{ color: text3 }}>Odometer:</span>{' '}
                    <strong style={{ color: text1 }}>{selectedVehicle.diagnostics.odometerKm.toLocaleString()} km</strong>
                  </div>
                </div>

                {selectedVehicle.diagnostics.faultCodes.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${borderSoft}`, color: '#ef4444', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={12} />
                    <span>Fault: {selectedVehicle.diagnostics.faultCodes.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: text3 }}>
              Select a vehicle on the map to view live telemetry
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              disabled={!selectedVehicle}
              onClick={handleToggleRouteReplay}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 6,
                border: 'none',
                backgroundColor: isReplayingRoute ? '#ef4444' : '#0284c7',
                color: '#ffffff',
                cursor: selectedVehicle ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <RotateCcw size={14} />
              {isReplayingRoute ? 'Exit Route Replay' : 'Launch Route Replay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
