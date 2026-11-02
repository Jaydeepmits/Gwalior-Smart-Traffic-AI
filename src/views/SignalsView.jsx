import React from 'react';
import { Radio, Play, Pause, RotateCcw, Zap } from 'lucide-react';

export default function SignalsView({
  intersections = [],
  onUpdateSignalState,
  onForceGreen,
  onPauseSignal,
  onResetSignal,
}) {
  const greenCount = intersections.filter((i) => i.signalState === 'green').length;
  const yellowCount = intersections.filter((i) => i.signalState === 'yellow').length;
  const redCount = intersections.filter((i) => i.signalState === 'red').length;
  const avgEfficiency = Math.round(
    intersections.reduce((acc, curr) => acc + curr.efficiency, 0) / (intersections.length || 1)
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* View Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          Signal Control & Adaptive Optimization
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            12 JUNCTIONS
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          AI-powered adaptive signal management with manual override, priority waves, and Gwalior SCATS integration
        </p>
      </div>

      {/* Top Status Bar */}
      <div className="flex flex-wrap items-center gap-6 glass-panel px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full traffic-green"></span>
          <span className="text-xs text-slate-400">
            Green: <strong className="text-emerald-400 font-mono text-sm">{greenCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full traffic-yellow"></span>
          <span className="text-xs text-slate-400">
            Yellow: <strong className="text-amber-400 font-mono text-sm">{yellowCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full traffic-red"></span>
          <span className="text-xs text-slate-400">
            Red: <strong className="text-red-400 font-mono text-sm">{redCount}</strong>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          Avg System Efficiency:{' '}
          <strong className="text-cyan-400 font-mono text-sm">{avgEfficiency}%</strong>
        </div>
      </div>

      {/* Grid of 12 Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {intersections.map((signal) => {
          const isPaused = signal.isPaused;
          const isOverridden = signal.isOverridden;

          return (
            <div
              key={signal.id}
              className={`glass-panel p-5 transition-all duration-300 relative overflow-hidden ${
                isOverridden ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white hover:text-cyan-400 transition-colors">
                    {signal.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {signal.signalId || signal.id} • {signal.zone.split('-')[0]}
                  </p>
                </div>
                <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-mono">
                  {signal.efficiency}% Efficient
                </div>
              </div>

              {/* Traffic Light Visual + Big Countdown */}
              <div className="flex items-center justify-center gap-6 mb-5">
                {/* Traffic Light Housing */}
                <div className="bg-[#050811] rounded-2xl p-3 flex flex-col gap-2.5 border border-slate-700 shadow-xl">
                  {/* Red light */}
                  <div
                    className={`w-9 h-9 rounded-full transition-all duration-300 ${
                      signal.signalState === 'red' ? 'traffic-red' : 'traffic-off'
                    }`}
                  ></div>
                  {/* Yellow light */}
                  <div
                    className={`w-9 h-9 rounded-full transition-all duration-300 ${
                      signal.signalState === 'yellow' ? 'traffic-yellow' : 'traffic-off'
                    }`}
                  ></div>
                  {/* Green light */}
                  <div
                    className={`w-9 h-9 rounded-full transition-all duration-300 ${
                      signal.signalState === 'green' ? 'traffic-green' : 'traffic-off'
                    }`}
                  ></div>
                </div>

                {/* Live Countdown Timer */}
                <div className="text-center">
                  <p
                    className={`text-4xl font-bold font-mono tracking-tight ${
                      signal.signalState === 'green'
                        ? 'text-emerald-400 glow-green'
                        : signal.signalState === 'yellow'
                        ? 'text-amber-400 glow-amber'
                        : 'text-red-400 glow-red'
                    }`}
                  >
                    {signal.countdown}s
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-medium">
                    {isPaused ? '⏸️ TIMER PAUSED' : 'Next Change'}
                  </p>
                  {isOverridden && (
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded mt-1 inline-block">
                      PRIORITY GREEN OVERRIDE
                    </span>
                  )}
                </div>
              </div>

              {/* AI Recommended Timing Box */}
              <div className="bg-[#1a2235]/60 rounded-lg p-3 mb-4 border border-cyan-500/10">
                <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>🤖 AI Recommended Timing</span>
                  <span className="text-[9px] text-slate-400">Flow: {signal.vehicles} v/h</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs font-bold font-mono text-emerald-400">
                      {signal.timing?.green || 40}s
                    </p>
                    <p className="text-[9px] text-slate-400">Green</p>
                  </div>
                  <div className="text-center p-1.5 rounded bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs font-bold font-mono text-amber-400">
                      {signal.timing?.yellow || 5}s
                    </p>
                    <p className="text-[9px] text-slate-400">Yellow</p>
                  </div>
                  <div className="text-center p-1.5 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-xs font-bold font-mono text-red-400">
                      {signal.timing?.red || 30}s
                    </p>
                    <p className="text-[9px] text-slate-400">Red</p>
                  </div>
                </div>
              </div>

              {/* Manual Control Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onForceGreen(signal.id)}
                  className="btn-success text-xs flex-1 py-1.5 flex items-center justify-center gap-1 shadow-md hover:shadow-emerald-500/20"
                >
                  <Play className="w-3 h-3" />
                  Force Green
                </button>
                <button
                  onClick={() => onPauseSignal(signal.id)}
                  className={`btn-outline text-xs flex-1 py-1.5 flex items-center justify-center gap-1 ${
                    isPaused ? 'border-amber-400 text-amber-400' : ''
                  }`}
                >
                  <Pause className="w-3 h-3" />
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={() => onResetSignal(signal.id)}
                  className="btn-danger text-xs flex-1 py-1.5 flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
