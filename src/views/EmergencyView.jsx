import React, { useState } from 'react';
import { Siren, MapPin, Navigation, Clock, ShieldCheck, Plus, CheckCircle, Zap } from 'lucide-react';
import TrafficMap from '../components/TrafficMap';

export default function EmergencyView({
  emergencyVehicles = [],
  intersections = [],
  onToggleCorridor,
  onAddNewEmergencyVehicle,
  theme = 'dark',
}) {
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    emergencyVehicles[0]?.id || 'EMV-GWL-101'
  );
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // New dispatch modal state
  const [newType, setNewType] = useState('Ambulance');
  const [newHospital, setNewHospital] = useState('Jaya Arogya (J.A.) Hospital, Kampoo');
  const [newOrigin, setNewOrigin] = useState('Padav Chouraha (Railway Station)');

  const currentVehicle =
    emergencyVehicles.find((v) => v.id === selectedVehicleId) || emergencyVehicles[0];

  const activeCount = emergencyVehicles.filter((v) => v.status === 'Active').length;

  const handleCreateDispatch = (e) => {
    e.preventDefault();
    const id = `EMV-GWL-${Math.floor(400 + Math.random() * 500)}`;
    const icon = newType === 'Ambulance' ? '🚑' : newType === 'Fire Truck' ? '🚒' : '🚓';
    
    // Choose coordinates based on origin
    const originJunction = intersections.find((i) => i.name.includes(newOrigin)) || intersections[2];
    const destJunction = intersections.find((i) => i.name.includes('Kampoo') || i.name.includes('Morar')) || intersections[6];

    const newVeh = {
      id,
      type: newType,
      icon,
      name: `Emergency Response Unit (${newType})`,
      hospital: newHospital,
      driver: 'Rapid Response Team (GWL)',
      currentCoords: [originJunction.lat, originJunction.lng],
      destinationCoords: [destJunction.lat, destJunction.lng],
      eta: '5 min',
      etaMinutes: 5,
      status: 'Active',
      signalsPreempted: 3,
      routeDistance: '4.2 km',
      avgSpeed: '55 km/h',
      timeSaved: '~4 min',
      corridorName: `${originJunction.shortName} - ${destJunction.shortName} Priority Corridor`,
      routePath: [
        [originJunction.lat, originJunction.lng],
        [(originJunction.lat + destJunction.lat) / 2, (originJunction.lng + destJunction.lng) / 2],
        [destJunction.lat, destJunction.lng],
      ],
    };

    onAddNewEmergencyVehicle(newVeh);
    setSelectedVehicleId(id);
    setShowDispatchModal(false);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Title & Dispatch Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Emergency Corridor Management
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              GREEN WAVE ACTIVE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic green wave routing & preemption for ambulances, fire tenders, and police in Gwalior
          </p>
        </div>

        <button
          onClick={() => setShowDispatchModal(true)}
          className="btn-primary text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          Dispatch New Emergency Corridor
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Route Map (col-span-8) */}
        <div className="lg:col-span-8">
          <div className="glass-panel p-1 overflow-hidden">
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-cyan-500/15">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Siren className="w-4 h-4 text-cyan-400" />
                  Gwalior Emergency Priority Routes
                </h2>
                <p className="text-[10px] text-slate-400">
                  {activeCount} active green wave corridors preempting upcoming traffic signals
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-sm">🚑</span>
                  <span className="text-[10px] text-slate-400">Ambulance</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm">🚒</span>
                  <span className="text-[10px] text-slate-400">Fire Truck</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm">🚓</span>
                  <span className="text-[10px] text-slate-400">Police</span>
                </div>
              </div>
            </div>

            <div className="p-1">
              <TrafficMap
                intersections={intersections}
                emergencyVehicles={emergencyVehicles}
                selectedVehicle={currentVehicle}
                mode="emergency"
                height="420px"
                theme={theme}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Vehicle List & Details (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Vehicles List */}
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Active Emergency Units</span>
              <span className="text-[9px] text-cyan-400 font-mono">{emergencyVehicles.length} Units</span>
            </h3>

            <div className="space-y-2">
              {emergencyVehicles.map((veh) => {
                const isSelected = veh.id === currentVehicle?.id;
                const isActive = veh.status === 'Active';

                return (
                  <button
                    key={veh.id}
                    onClick={() => setSelectedVehicleId(veh.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'bg-[#1a2235]/40 border-cyan-500/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{veh.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          {veh.id}
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400">{veh.type}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {veh.status}
                      </span>
                      {isActive && (
                        <p className="text-[9px] text-amber-400 font-mono mt-0.5">ETA: {veh.eta}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Vehicle Detail Card */}
          {currentVehicle && (
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-cyan-500/15">
                <span className="text-3xl">{currentVehicle.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-white">{currentVehicle.name}</h3>
                  <p className="text-[10px] font-medium text-cyan-400 font-mono">
                    {currentVehicle.id} • {currentVehicle.driver}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">Current GPS Location</p>
                    <p className="text-xs text-slate-200 font-mono font-medium">
                      Lat {currentVehicle.currentCoords[0].toFixed(4)}, Lng{' '}
                      {currentVehicle.currentCoords[1].toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Navigation className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">Destination Facility</p>
                    <p className="text-xs text-slate-200 font-medium">{currentVehicle.hospital}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">Estimated Arrival (ETA)</p>
                    <p className="text-xs font-bold text-amber-400 font-mono">
                      {currentVehicle.eta} (Priority Green Wave)
                    </p>
                  </div>
                </div>
              </div>

              {/* Corridor Toggle Action */}
              <div className="mt-4 pt-3 border-t border-cyan-500/15">
                <button
                  onClick={() => onToggleCorridor(currentVehicle.id)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    currentVehicle.status === 'Active'
                      ? 'btn-danger'
                      : 'btn-success'
                  }`}
                >
                  <Siren className="w-4 h-4" />
                  {currentVehicle.status === 'Active'
                    ? 'Deactivate Green Corridor'
                    : 'Activate Priority Corridor'}
                </button>
              </div>
            </div>
          )}

          {/* Corridor Statistics Card */}
          {currentVehicle && (
            <div className="glass-panel p-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Corridor Performance Impact
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Signals Preempted</span>
                  <span className="font-bold font-mono text-cyan-400">
                    {currentVehicle.signalsPreempted} Junctions
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Route Distance</span>
                  <span className="font-bold font-mono text-slate-200">
                    {currentVehicle.routeDistance}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Average Transit Speed</span>
                  <span className="font-bold font-mono text-emerald-400">
                    {currentVehicle.avgSpeed}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Estimated Time Saved</span>
                  <span className="font-bold font-mono text-amber-400">
                    {currentVehicle.timeSaved}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dispatch New Emergency Vehicle Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full bg-[#111827] border border-cyan-500/30 shadow-2xl animate-scaleUp">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Siren className="w-5 h-5 text-cyan-400" />
              Dispatch Emergency Corridor
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Override traffic signals along the route in Gwalior to clear the path.
            </p>

            <form onSubmit={handleCreateDispatch} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Vehicle Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-[#1a2235] border border-cyan-500/20 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="Ambulance">🚑 Ambulance (108 ALS / Trauma)</option>
                  <option value="Fire Truck">🚒 Fire Tender (Rescue 101)</option>
                  <option value="Police">🚓 Police Interceptor (Dial 112)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Origin Junction in Gwalior
                </label>
                <select
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="w-full bg-[#1a2235] border border-cyan-500/20 rounded-lg p-2 text-xs text-slate-200"
                >
                  {intersections.map((i) => (
                    <option key={i.id} value={i.name}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Destination Medical / Incident Facility
                </label>
                <select
                  value={newHospital}
                  onChange={(e) => setNewHospital(e.target.value)}
                  className="w-full bg-[#1a2235] border border-cyan-500/20 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="Jaya Arogya (J.A.) Hospital, Kampoo">
                    🏥 Jaya Arogya (J.A.) Hospital & GRMC Trauma, Kampoo
                  </option>
                  <option value="BIMR Hospitals (Birla Hospital), Morar">
                    🏥 BIMR Hospitals (Birla Hospital), Residency Rd, Morar
                  </option>
                  <option value="District Hospital Morar">🏥 District Hospital, Morar</option>
                  <option value="Cancer Hospital & Research Institute, Lashkar">
                    🏥 Cancer Hospital & Research Institute (Mandre Ki Mata)
                  </option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="btn-outline text-xs flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs flex-1">
                  Dispatch & Preempt Signals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
