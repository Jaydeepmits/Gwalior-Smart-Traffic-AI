import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Radio,
  Siren,
  AlertTriangle,
  BarChart3,
  Cpu,
  Camera,
  Activity,
  ShieldCheck,
  Video,
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, systemStatus }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'intersections', label: 'Intersections', icon: MapPin },
    { id: 'video-ai', label: 'YOLO Vision AI', icon: Video, badge: 'NEW' },
    { id: 'signals', label: 'Signals', icon: Radio },
    { id: 'emergency', label: 'Emergency', icon: Siren },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-[220px] lg:w-[230px] shrink-0 h-screen bg-[#111827]/95 backdrop-blur-xl border-r border-cyan-500/15 flex flex-col justify-between z-30 select-none overflow-y-auto">
      {/* Brand Header */}
      <div>
        <div className="px-4 py-4 border-b border-cyan-500/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                TrafficAI
                <span className="text-[8px] bg-cyan-500/20 text-cyan-400 px-1 py-0.2 rounded font-mono">
                  GWL
                </span>
              </h1>
              <p className="text-[9px] text-cyan-400/80 font-medium uppercase tracking-widest">
                Gwalior ICCC
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-2.5 py-3 space-y-1">
          <p className="px-2.5 mb-2 text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
            Command Center
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full sidebar-link text-xs py-2 px-2.5 flex items-center justify-between ${isActive ? 'active' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[8px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-cyan-500/15">
        <div className="glass-panel p-2.5 bg-[#0a0e1a]/85 border-cyan-500/15">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              System Status
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span>
              <span className="text-[9px] text-emerald-400 font-medium">Online</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">AI Engine</span>
            <span className="text-cyan-400 font-medium font-mono text-[9px]">
              Active v3.8
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] mt-1">
            <span className="text-slate-500 flex items-center gap-1">
              <Camera className="w-2.5 h-2.5 text-slate-500" /> Cameras
            </span>
            <span className="text-slate-300 font-medium font-mono text-[10px]">
              {systemStatus?.camerasOnline || 156}/{systemStatus?.camerasTotal || 160}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] mt-1">
            <span className="text-slate-500 flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 text-slate-500" /> Sensors
            </span>
            <span className="text-slate-300 font-medium font-mono text-[10px]">
              {systemStatus?.sensorsOnline || 342}/{systemStatus?.sensorsTotal || 350}
            </span>
          </div>

          <div className="mt-2 pt-1.5 border-t border-cyan-500/10 text-center">
            <span className="text-[8px] text-slate-500 font-medium block">
              Smart City Development Corp (SCDCL)
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
