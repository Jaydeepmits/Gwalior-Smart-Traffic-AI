import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Maximize2, Minimize2, Crosshair } from 'lucide-react';

export default function TrafficMap({
  intersections = [],
  emergencyVehicles = [],
  incidents = [],
  selectedIntersection = null,
  selectedVehicle = null,
  mode = 'all', // 'all', 'intersection', 'emergency', 'incident'
  height = '320px',
  onSelectIntersection = null,
  allowExpand = true,
  theme = 'dark',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routesLayerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const gwaliorCenter = selectedIntersection
      ? [selectedIntersection.lat, selectedIntersection.lng]
      : [26.2183, 78.1828];
    const initialZoom = selectedIntersection ? 15 : 13;

    const map = L.map(mapContainerRef.current, {
      center: gwaliorCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom positioned zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layers dynamically on theme change (Light / Dark)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    if (labelsLayerRef.current) {
      map.removeLayer(labelsLayerRef.current);
    }

    const isLight = theme === 'light';
    const baseServer = isLight ? 'World_Light_Gray_Base' : 'World_Dark_Gray_Base';
    const refServer = isLight ? 'World_Light_Gray_Reference' : 'World_Dark_Gray_Reference';

    tileLayerRef.current = L.tileLayer(
      `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${baseServer}/MapServer/tile/{z}/{y}/{x}`,
      {
        maxZoom: 18,
        attribution: 'Esri, HERE, Garmin, OpenStreetMap',
      }
    ).addTo(map);

    labelsLayerRef.current = L.tileLayer(
      `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${refServer}/MapServer/tile/{z}/{y}/{x}`,
      {
        maxZoom: 18,
        opacity: isLight ? 0.9 : 0.85,
      }
    ).addTo(map);
  }, [theme]);

  // Recalculate size when isExpanded or height changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 200);
    }
  }, [isExpanded, height]);

  // Recenter map on Gwalior center
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const center = selectedIntersection
      ? [selectedIntersection.lat, selectedIntersection.lng]
      : [26.2183, 78.1828];
    mapInstanceRef.current.setView(center, selectedIntersection ? 15 : 13, {
      animate: true,
    });
  };

  // Update map view and markers when data or mode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !routesLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();

    const isLight = theme === 'light';
    const markerBg = isLight ? '#ffffff' : '#0a0e1a';
    const popupBg = isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(17, 24, 39, 0.95)';
    const textColor = isLight ? '#0f172a' : '#ffffff';
    const subTextColor = isLight ? '#475569' : '#94a3b8';

    // Mode 1: Single Intersection Focus
    if (mode === 'intersection' && selectedIntersection) {
      map.setView([selectedIntersection.lat, selectedIntersection.lng], 15);

      const color =
        selectedIntersection.status === 'heavy'
          ? '#ef4444'
          : selectedIntersection.status === 'moderate'
          ? '#f59e0b'
          : '#10b981';

      const customIcon = L.divIcon({
        className: 'custom-junction-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            background: ${markerBg};
            border: 2px solid ${color};
            border-radius: 50%;
            box-shadow: 0 0 16px ${color};
          ">
            <span style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: ${color};
              animation: pulse-glow 1.5s infinite;
            "></span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([selectedIntersection.lat, selectedIntersection.lng], {
        icon: customIcon,
      }).addTo(markersLayerRef.current);

      marker.bindPopup(`
        <div style="padding: 4px; font-family: inherit; color: ${textColor};">
          <h4 style="font-weight: 700; color: ${textColor}; font-size: 13px; margin-bottom: 2px;">${selectedIntersection.name}</h4>
          <p style="color: ${subTextColor}; font-size: 10px; margin-bottom: 6px;">${selectedIntersection.id} • ${selectedIntersection.zone}</p>
          <div style="display: flex; gap: 8px; font-size: 11px;">
            <span style="color: ${color}; font-weight: bold;">Density: ${selectedIntersection.density}%</span>
            <span style="color: #06b6d4;">Vehicles: ${selectedIntersection.vehicles}</span>
          </div>
        </div>
      `).openPopup();

      return;
    }

    // Mode 2: Emergency Corridors
    if (mode === 'emergency') {
      emergencyVehicles.forEach((veh) => {
        const isActive = veh.status === 'Active';
        const isSelected = selectedVehicle && selectedVehicle.id === veh.id;

        // Draw Route Polyline
        if (veh.routePath && veh.routePath.length > 0) {
          const polyline = L.polyline(veh.routePath, {
            color: isActive ? '#06b6d4' : '#64748b',
            weight: isSelected ? 5 : 3,
            opacity: isSelected ? 0.95 : 0.6,
            dashArray: isActive ? '6, 8' : '4, 4',
          }).addTo(routesLayerRef.current);

          if (isSelected) {
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
          }
        }

        // Draw Destination Hospital Marker
        if (veh.destinationCoords) {
          const hospIcon = L.divIcon({
            className: 'hosp-marker',
            html: `
              <div style="
                background: ${isLight ? '#ffffff' : '#111827'};
                border: 2px solid #ef4444;
                border-radius: 8px;
                padding: 4px 8px;
                font-size: 11px;
                box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
                color: ${textColor};
                white-space: nowrap;
                font-weight: 600;
              ">
                🏥 ${veh.hospital.split(',')[0]}
              </div>
            `,
            iconSize: [140, 28],
            iconAnchor: [70, 14],
          });
          L.marker(veh.destinationCoords, { icon: hospIcon }).addTo(markersLayerRef.current);
        }

        // Vehicle marker
        const vehIcon = L.divIcon({
          className: 'emergency-veh-marker',
          html: `
            <div style="
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: ${isActive ? 'rgba(6, 182, 212, 0.25)' : 'rgba(51, 65, 85, 0.4)'};
              border: 2px solid ${isActive ? '#06b6d4' : '#64748b'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              box-shadow: 0 0 ${isActive ? '20px #06b6d4' : '0px'};
              animation: ${isActive ? 'pulse-glow 1.5s infinite' : 'none'};
            ">
              ${veh.icon}
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const vMarker = L.marker(veh.currentCoords, { icon: vehIcon }).addTo(markersLayerRef.current);
        vMarker.bindPopup(`
          <div style="padding: 4px; font-family: inherit; color: ${textColor};">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 16px;">${veh.icon}</span>
              <strong style="color: ${textColor};">${veh.name}</strong>
            </div>
            <p style="color: #06b6d4; font-size: 10px; margin-top: 2px;">Facility: ${veh.hospital}</p>
            <p style="color: #f59e0b; font-size: 11px; font-weight: 600; margin-top: 4px;">ETA: ${veh.eta} (${veh.routeDistance})</p>
          </div>
        `);
      });

      return;
    }

    // Mode 3: Incidents
    if (mode === 'incident') {
      incidents.forEach((inc) => {
        const color = inc.severity === 'critical' ? '#ef4444' : inc.severity === 'high' ? '#f59e0b' : '#a855f7';
        const incIcon = L.divIcon({
          className: 'incident-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: ${color}25;
              border: 2px solid ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              box-shadow: 0 0 15px ${color};
              animation: pulse-glow 1.5s infinite;
            ">
              ${inc.type === 'Accident' ? '⚠️' : inc.type === 'Blockage' ? '🚧' : '⚡'}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const iMarker = L.marker([inc.lat, inc.lng], { icon: incIcon }).addTo(markersLayerRef.current);
        iMarker.bindPopup(`
          <div style="padding: 4px; max-width: 220px; font-family: inherit; color: ${textColor};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: ${color}; font-size: 12px;">${inc.type}</strong>
              <span style="color: ${subTextColor}; font-size: 9px;">${inc.status}</span>
            </div>
            <p style="color: ${textColor}; font-size: 11px; margin-top: 4px; font-weight: 600;">${inc.title}</p>
            <p style="color: ${subTextColor}; font-size: 10px; margin-top: 4px;">${inc.description}</p>
          </div>
        `);
      });
      return;
    }

    // Mode 4: Overview (All 12 Gwalior Intersections)
    intersections.forEach((item) => {
      const color =
        item.status === 'heavy' ? '#ef4444' : item.status === 'moderate' ? '#f59e0b' : '#10b981';

      const customIcon = L.divIcon({
        className: 'city-junction-marker',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: ${markerBg};
            border: 2px solid ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 0 12px ${color};
            transition: all 0.2s;
          ">
            <span style="
              width: 9px;
              height: 9px;
              border-radius: 50%;
              background: ${color};
            "></span>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(markersLayerRef.current);

      marker.on('click', () => {
        if (onSelectIntersection) {
          onSelectIntersection(item);
        }
      });

      marker.bindPopup(`
        <div style="padding: 4px; font-family: inherit; color: ${textColor};">
          <h4 style="font-weight: 700; color: ${textColor}; font-size: 12px; margin-bottom: 2px;">${item.name}</h4>
          <p style="color: ${subTextColor}; font-size: 9px; margin-bottom: 6px;">${item.id} • ${item.zone}</p>
          <div style="display: flex; justify-content: space-between; gap: 8px; font-size: 10px; margin-bottom: 4px;">
            <span style="color: ${color}; font-weight: bold;">Congestion: ${item.density}%</span>
            <span style="color: #06b6d4;">Vehicles: ${item.vehicles}</span>
          </div>
          <div style="font-size: 10px; color: ${subTextColor};">
            Avg Wait: <strong style="color: #f59e0b;">${item.waitTime}s</strong> | Queue: ${item.queueLength}
          </div>
        </div>
      `);
    });
  }, [intersections, emergencyVehicles, incidents, selectedIntersection, selectedVehicle, mode, theme]);

  const mapHeight = isExpanded ? '520px' : height;

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      {/* Map Control Toolbar */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-[#0a0e1a]/80 backdrop-blur-md p-1 rounded-lg border border-cyan-500/20 shadow-lg">
        <button
          onClick={handleRecenter}
          title="Recenter Gwalior"
          className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-[#1a2235] transition-colors cursor-pointer"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
        {allowExpand && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Map' : 'Expand Map'}
            className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-[#1a2235] transition-colors cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: mapHeight,
          background: theme === 'light' ? '#f1f5f9' : '#0a0e1a',
          transition: 'height 0.3s ease',
        }}
      />
    </div>
  );
}
