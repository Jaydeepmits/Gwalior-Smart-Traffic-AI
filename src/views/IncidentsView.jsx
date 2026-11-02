import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  AlertOctagon,
  Zap,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import TrafficMap from '../components/TrafficMap';

export default function IncidentsView({
  incidents = [],
  intersections = [],
  onResolveIncident,
  onAddNewIncident,
  theme = 'dark',
}) {
  const [filterType, setFilterType] = useState('All');
  const [showReportModal, setShowReportModal] = useState(false);

  // Form state for reporting new incident
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Accident');
  const [newSeverity, setNewSeverity] = useState('high');
  const [newDescription, setNewDescription] = useState('');
  const [selectedJunctionId, setSelectedJunctionId] = useState(
    intersections[0]?.id || 'INT-GWL-001'
  );

  const filteredIncidents = incidents.filter((inc) => {
    if (filterType === 'All') return true;
    if (filterType === 'Accident') return inc.type === 'Accident';
    if (filterType === 'Blockage') return inc.type === 'Blockage';
    if (filterType === 'Congestion') return inc.type === 'Congestion Spike';
    return true;
  });

  const accidentsCount = incidents.filter((i) => i.type === 'Accident').length;
  const blockagesCount = incidents.filter((i) => i.type === 'Blockage').length;
  const congestionCount = incidents.filter((i) => i.type === 'Congestion Spike').length;
  const activeCount = incidents.filter((i) => i.status !== 'Cleared').length;

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    const junction = intersections.find((i) => i.id === selectedJunctionId) || intersections[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB');

    const createdIncident = {
      id: `INC-GWL-${Math.floor(100 + Math.random() * 900)}`,
      type: newType,
      badgeType: newType.toLowerCase().includes('accident')
        ? 'accident'
        : newType.toLowerCase().includes('blockage')
        ? 'blockage'
        : 'congestion',
      title: newTitle,
      description: newDescription || `Incident reported near ${junction.name}. Traffic police dispatched.`,
      severity: newSeverity,
      status: 'Active',
      detectedTime: timeStr,
      lat: junction.lat + (Math.random() * 0.003 - 0.0015),
      lng: junction.lng + (Math.random() * 0.003 - 0.0015),
      intersectionId: junction.id,
      actionTaken: 'Emergency monitoring activated. Patrol car alerted.',
    };

    onAddNewIncident(createdIncident);
    setShowReportModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const getSeverityBadge = (sev) => {
    if (sev === 'critical') {
      return 'bg-red-500/20 border-red-500/40 text-red-400';
    }
    if (sev === 'high') {
      return 'bg-red-500/15 border-red-500/30 text-red-400';
    }
    if (sev === 'medium') {
      return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
    }
    return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Incident Monitoring & Response
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              {activeCount} ACTIVE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time incident detection, automatic camera trigger alerts, and road hazard dispatch in Gwalior
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Accident', 'Blockage', 'Congestion'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'bg-[#1a2235]/50 text-slate-400 border border-cyan-500/10 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
          <button
            onClick={() => setShowReportModal(true)}
            className="btn-primary text-xs flex items-center gap-1.5 ml-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Report Incident
          </button>
        </div>
      </div>

      {/* Incident Counters Banner */}
      <div className="flex flex-wrap items-center gap-6 glass-panel px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <span className="text-xs text-slate-400">
            Accidents: <strong className="text-red-400 font-mono text-sm">{accidentsCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">🚧</span>
          <span className="text-xs text-slate-400">
            Blockages: <strong className="text-amber-400 font-mono text-sm">{blockagesCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <span className="text-xs text-slate-400">
            Congestion Spikes:{' '}
            <strong className="text-purple-400 font-mono text-sm">{congestionCount}</strong>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 pulse-dot"></span>
          <span className="text-xs font-semibold text-red-400 font-mono">
            {activeCount} Active in Gwalior Area
          </span>
        </div>
      </div>

      {/* Main Grid: Map (col-span-8) & Incident Cards (col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Incident Map */}
        <div className="lg:col-span-8">
          <div className="glass-panel p-1 overflow-hidden">
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-cyan-500/15">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Gwalior Incident Heat & Hazard Map
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Real-time GPS Tracking</span>
            </div>
            <div className="p-1">
              <TrafficMap
                intersections={intersections}
                incidents={filteredIncidents}
                mode="incident"
                height="420px"
                theme={theme}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Incident Cards List */}
        <div className="lg:col-span-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {filteredIncidents.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No Incidents Found</p>
              <p className="text-xs text-slate-500 mt-1">
                Selected category has no active reports at this moment.
              </p>
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const isCleared = inc.status === 'Cleared';
              const sevClass = getSeverityBadge(inc.severity);

              return (
                <div
                  key={inc.id}
                  className={`glass-panel p-4 transition-all duration-200 border ${
                    isCleared ? 'opacity-50 border-slate-700' : 'hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg border shrink-0 ${
                        inc.type === 'Accident'
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : inc.type === 'Blockage'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                      }`}
                    >
                      {inc.type === 'Accident' ? (
                        <Flame className="w-4 h-4" />
                      ) : inc.type === 'Blockage' ? (
                        <AlertOctagon className="w-4 h-4" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            inc.type === 'Accident'
                              ? 'text-red-400'
                              : inc.type === 'Blockage'
                              ? 'text-amber-400'
                              : 'text-purple-400'
                          }`}
                        >
                          {inc.type}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCleared
                                ? 'bg-emerald-400'
                                : inc.status === 'Responding'
                                ? 'bg-amber-400 pulse-dot'
                                : 'bg-red-500 pulse-dot'
                            }`}
                          ></span>
                          <span
                            className={`text-[10px] font-medium ${
                              isCleared
                                ? 'text-emerald-400'
                                : inc.status === 'Responding'
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }`}
                          >
                            {inc.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-medium text-slate-200 mt-1 truncate">{inc.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        {inc.description}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border font-mono ${sevClass}`}
                          >
                            {inc.severity}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {inc.detectedTime}
                          </span>
                        </div>

                        {!isCleared && (
                          <button
                            onClick={() => onResolveIncident(inc.id)}
                            className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium hover:bg-emerald-500/25 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Report New Incident Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full bg-[#111827] border border-cyan-500/30 shadow-2xl animate-scaleUp">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              Report Traffic Incident (Gwalior Region)
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Enter incident information to alert ICCC control center and notify emergency units.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Incident Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-[#1a2235] border border-cyan-500/20 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="Accident">⚠️ Road Accident / Collision</option>
                  <option value="Blockage">🚧 Road Blockage / Construction / Breakdown</option>
                  <option value="Congestion Spike">⚡ Rapid Congestion Spike</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Location / Junction in Gwalior
                </label>
                <select
                  value={selectedJunctionId}
                  onChange={(e) => setSelectedJunctionId(e.target.value)}
                  className="w-full bg-[#1a2235] border border-cyan-500/20 rounded-lg p-2 text-xs text-slate-200"
                >
                  {intersections.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Incident Title & Landmark
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Phoolbagh Overbridge descent"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#1a2235] border border-cyan-500/20 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Severity Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['critical', 'high', 'medium', 'low'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewSeverity(s)}
                      className={`py-1 rounded text-[10px] font-bold uppercase transition-all border ${
                        newSeverity === s
                          ? s === 'critical'
                            ? 'bg-red-500/30 border-red-500 text-red-400'
                            : s === 'high'
                            ? 'bg-red-500/20 border-red-500/50 text-red-400'
                            : s === 'medium'
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          : 'bg-[#1a2235] border-cyan-500/10 text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Incident Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Details of vehicle collision or obstruction..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#1a2235] border border-cyan-500/20 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="btn-outline text-xs flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-danger text-xs flex-1">
                  Broadcast Incident Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
