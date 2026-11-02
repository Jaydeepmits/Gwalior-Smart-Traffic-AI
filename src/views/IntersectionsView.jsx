import React, { useState, useEffect } from 'react';
import { Camera, Radio, Compass, Car, Clock, ShieldAlert, Scan, Video } from 'lucide-react';
import TrafficMap from '../components/TrafficMap';

export default function IntersectionsView({
  intersections = [],
  selectedIntersection,
  setSelectedIntersection,
  onNavigateView,
  theme = 'dark',
}) {
  const current = selectedIntersection || intersections[0] || {};
  const [vehicleDetectedCount, setVehicleDetectedCount] = useState(24);
  const [cctvTime, setCctvTime] = useState(new Date());

  // Simulate vehicle detections moving on the CCTV feed
  const [trackedObjects, setTrackedObjects] = useState([
    { id: 1, type: 'Auto', conf: 96, top: 44, left: 32, w: 50, h: 42 },
    { id: 2, type: 'Car', conf: 98, top: 58, left: 62, w: 65, h: 52 },
    { id: 3, type: 'Bus', conf: 92, top: 35, left: 54, w: 85, h: 60 },
    { id: 4, type: 'Bike', conf: 89, top: 68, left: 28, w: 32, h: 36 },
  ]);

  // Tick time & subtle vehicle detection jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setCctvTime(new Date());
      setTrackedObjects((prev) =>
        prev.map((obj) => ({
          ...obj,
          left: (obj.left + (Math.random() * 4 - 2) + 100) % 85 + 5,
          top: (obj.top + (Math.random() * 3 - 1.5) + 100) % 75 + 10,
        }))
      );
      setVehicleDetectedCount(Math.floor(20 + Math.random() * 15));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    if (status === 'heavy') return '#ef4444';
    if (status === 'moderate') return '#f59e0b';
    return '#10b981';
  };

  const statusColor = getStatusColor(current.status);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header and Junction Picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Intersection Monitoring
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              {current.id}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time camera feed, AI object detection, signal phase diagram, and lane statistics
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateView && (
            <button
              onClick={() => onNavigateView('video-ai')}
              className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3 shadow-md shadow-cyan-500/20"
              title="Open in YOLO & OpenCV Video Analyzer"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>YOLO Vision AI</span>
            </button>
          )}

          {/* Intersection Select Dropdown */}
          <select
            value={current.id}
            onChange={(e) => {
              const found = intersections.find((i) => i.id === e.target.value);
              if (found) setSelectedIntersection(found);
            }}
            className="bg-[#1a2235] border border-cyan-500/25 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-sans cursor-pointer shadow-lg"
          >
            {intersections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Live Camera Feed & Lane Density Heatmap (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Simulated CCTV Camera Feed */}
          <div className="relative bg-[#050811] rounded-xl overflow-hidden border border-cyan-500/20 h-[300px] shadow-2xl flex flex-col justify-between">
            {/* Background Road & Crossroad Graphic */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0a0e1a]">
              {/* Road markings */}
              <div className="absolute inset-0 opacity-25">
                <div className="absolute top-[38%] left-0 right-0 h-[24%] bg-slate-700"></div>
                <div className="absolute top-0 bottom-0 left-[38%] w-[24%] bg-slate-700"></div>
                {/* Yellow dividing stripes */}
                <div
                  className="absolute top-[49%] left-0 right-0 h-[2%] bg-amber-400/40"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(245,158,11,0.5) 15px, rgba(245,158,11,0.5) 35px)',
                  }}
                ></div>
                <div
                  className="absolute top-0 bottom-0 left-[49%] w-[2%] bg-amber-400/40"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(245,158,11,0.5) 15px, rgba(245,158,11,0.5) 35px)',
                  }}
                ></div>
              </div>

              {/* Laser scan line */}
              <div className="scanline"></div>

              {/* Dynamic AI Vehicle Detection Bounding Boxes */}
              {trackedObjects.map((obj) => (
                <div
                  key={obj.id}
                  style={{
                    position: 'absolute',
                    top: `${obj.top}%`,
                    left: `${obj.left}%`,
                    width: `${obj.w}px`,
                    height: `${obj.h}px`,
                    border: '1.5px solid #06b6d4',
                    background: 'rgba(6, 182, 212, 0.12)',
                    borderRadius: '3px',
                    transition: 'all 1.2s ease',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '0px',
                      fontSize: '8px',
                      fontFamily: 'monospace',
                      background: '#06b6d4',
                      color: '#000',
                      padding: '1px 3px',
                      fontWeight: 'bold',
                      borderRadius: '2px',
                    }}
                  >
                    {obj.type} {obj.conf}%
                  </span>
                </div>
              ))}
            </div>

            {/* Top CCTV Overlay */}
            <div className="relative p-3 flex items-center justify-between z-10 bg-gradient-to-b from-[#0a0e1a]/90 to-transparent">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 pulse-dot"></span>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Camera className="w-3 h-3 text-red-400" />
                  Live Feed
                </span>
                <span className="text-[9px] text-cyan-400 font-mono ml-2">29.4 FPS</span>
              </div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold bg-[#1a2235]/70 px-2 py-0.5 rounded border border-cyan-500/20">
                {current.camera}
              </div>
            </div>

            {/* Bottom CCTV Overlay */}
            <div className="relative p-3 flex items-center justify-between z-10 bg-[#0a0e1a]/90 border-t border-cyan-500/15">
              <div>
                <span className="text-[11px] text-slate-200 font-medium block">{current.name}</span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {cctvTime.toLocaleTimeString('en-GB')} • Lat {current.lat.toFixed(4)}, Lng {current.lng.toFixed(4)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-cyan-400 font-mono font-bold block">
                  {vehicleDetectedCount} vehicles detected
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">AI Inference: 11ms</span>
              </div>
            </div>
          </div>

          {/* Lane Density Heatmap */}
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Lane Density Heatmap
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {current.lanes &&
                Object.entries(current.lanes).map(([dir, info]) => {
                  const isHigh = info.density >= 75;
                  const isMed = info.density >= 50 && info.density < 75;
                  const bgColor = isHigh ? 'bg-red-500/20 border-red-500/40' : isMed ? 'bg-amber-500/20 border-amber-500/40' : 'bg-emerald-500/20 border-emerald-500/40';
                  const textColor = isHigh ? 'text-red-400' : isMed ? 'text-amber-400' : 'text-emerald-400';

                  return (
                    <div key={dir} className={`p-3 rounded-lg border ${bgColor} transition-all`}>
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] text-slate-400 font-medium capitalize">
                          {dir} Lane
                        </p>
                        <span className="text-[9px] text-slate-400 font-mono">{info.count} veh</span>
                      </div>
                      <p className={`text-lg font-bold font-mono mt-1 ${textColor}`}>
                        {info.density}%
                      </p>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">{info.name}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Middle Column: Interactive Junction Map & Phase Diagram (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Junction Focus Map */}
          <div className="glass-panel p-1 overflow-hidden">
            <div className="px-3 py-2 flex items-center justify-between border-b border-cyan-500/10">
              <div>
                <h3 className="text-sm font-semibold text-white">{current.shortName}</h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  {current.id} • Lat {current.lat}, Lng {current.lng}
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                {current.status}
              </span>
            </div>
            <div className="p-1">
              <TrafficMap
                intersections={intersections}
                selectedIntersection={current}
                mode="intersection"
                height="250px"
              />
            </div>
          </div>

          {/* 4-Way Signal Phase Diagram */}
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Signal Phase Diagram
            </h3>
            <div className="relative w-full h-36 bg-[#0a0e1a]/80 rounded-lg overflow-hidden border border-cyan-500/15 flex items-center justify-center">
              {/* Roads cross */}
              <div className="absolute top-[35%] left-0 right-0 h-[30%] bg-slate-800/70"></div>
              <div className="absolute top-0 bottom-0 left-[35%] w-[30%] bg-slate-800/70"></div>
              <div className="absolute top-[35%] left-[35%] w-[30%] h-[30%] bg-slate-700/40 border border-cyan-500/20"></div>

              {/* Traffic Signals on the 4 approaches */}
              {/* North light */}
              <div
                className={`absolute top-[22%] left-[48%] w-3.5 h-3.5 rounded-full ${
                  current.signalState === 'red' ? 'traffic-red' : 'traffic-off'
                }`}
              ></div>
              {/* East light */}
              <div
                className={`absolute top-[48%] right-[22%] w-3.5 h-3.5 rounded-full ${
                  current.signalState === 'red' ? 'traffic-red' : 'traffic-off'
                }`}
              ></div>
              {/* South light */}
              <div
                className={`absolute bottom-[22%] left-[48%] w-3.5 h-3.5 rounded-full ${
                  current.signalState === 'green' ? 'traffic-green' : 'traffic-off'
                }`}
              ></div>
              {/* West light */}
              <div
                className={`absolute top-[48%] left-[22%] w-3.5 h-3.5 rounded-full ${
                  current.signalState === 'yellow'
                    ? 'traffic-yellow'
                    : current.signalState === 'green'
                    ? 'traffic-green'
                    : 'traffic-off'
                }`}
              ></div>

              {/* Cardinal Labels */}
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">
                N ({current.lanes?.north?.name || 'North'})
              </span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">
                S ({current.lanes?.south?.name || 'South'})
              </span>
              <span className="absolute top-1/2 left-2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                W
              </span>
              <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                E
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Signal Box, Vehicle Count & Traffic Statistics (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Current Signal Card */}
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Current Signal Timing
            </h3>
            <div className="flex items-center gap-5">
              {/* Physical Signal Box */}
              <div className="bg-[#050811] rounded-2xl p-2.5 flex gap-2 border border-slate-700 shadow-xl">
                <div
                  className={`w-7 h-7 rounded-full ${
                    current.signalState === 'red' ? 'traffic-red' : 'traffic-off'
                  }`}
                ></div>
                <div
                  className={`w-7 h-7 rounded-full ${
                    current.signalState === 'yellow' ? 'traffic-yellow' : 'traffic-off'
                  }`}
                ></div>
                <div
                  className={`w-7 h-7 rounded-full ${
                    current.signalState === 'green' ? 'traffic-green' : 'traffic-off'
                  }`}
                ></div>
              </div>

              {/* Countdown Display */}
              <div>
                <p
                  className={`text-3xl font-bold font-mono ${
                    current.signalState === 'green'
                      ? 'text-emerald-400'
                      : current.signalState === 'yellow'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {current.countdown || 22}s
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Next Phase Change</p>
              </div>
            </div>
          </div>

          {/* Vehicle Count by Lane */}
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-cyan-400" />
              Vehicle Count by Approach
            </h3>
            <div className="space-y-2.5">
              {current.lanes &&
                Object.entries(current.lanes).map(([dir, info]) => (
                  <div key={dir} className="flex items-center justify-between py-1 border-b border-cyan-500/10 last:border-0">
                    <div>
                      <span className="text-xs text-slate-300 capitalize font-medium">{dir} Approach</span>
                      <p className="text-[9px] text-slate-500">{info.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-[#1a2235] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${info.density}%`,
                            backgroundColor:
                              info.density > 75 ? '#ef4444' : info.density > 50 ? '#f59e0b' : '#10b981',
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-200 w-8 text-right">
                        {info.count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Traffic Statistics */}
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Junction Traffic Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Overall Density</span>
                <span className="text-sm font-bold font-mono" style={{ color: statusColor }}>
                  {current.density}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Vehicles</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {current.vehicles}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Avg Wait Time</span>
                <span className="text-sm font-bold font-mono text-purple-400">
                  {current.waitTime}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Queue Length</span>
                <span className="text-sm font-bold font-mono text-amber-400">
                  {current.queueLength} vehicles
                </span>
              </div>
            </div>
          </div>

          {/* Congestion Level Banner */}
          <div
            className="glass-panel p-4 border-l-4"
            style={{ borderLeftColor: statusColor }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Congestion Level
                </p>
                <p className="text-lg font-bold uppercase font-mono" style={{ color: statusColor }}>
                  {current.status}
                </p>
              </div>
              <ShieldAlert className="w-6 h-6" style={{ color: statusColor }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
