import React from 'react';
import {
  MapPin,
  TrendingUp,
  Siren,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  Layers,
  ChevronRight,
  Scan,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import TrafficMap from '../components/TrafficMap';
import { HOURLY_CONGESTION_DATA } from '../data/trafficData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardView({
  intersections = [],
  emergencyVehicles = [],
  incidents = [],
  onSelectIntersection,
  onNavigateView,
  theme = 'dark',
}) {
  const isLight = theme === 'light';
  const activeIntersectionsCount = intersections.length;
  const avgCongestion = Math.round(
    intersections.reduce((acc, curr) => acc + curr.density, 0) / (intersections.length || 1)
  );
  const activeCorridors = emergencyVehicles.filter((v) => v.status === 'Active').length;
  const activeIncidents = incidents.filter((i) => i.status !== 'Cleared').length;

  // Chart 1: Traffic Density Over Time
  const densityChartData = {
    labels: HOURLY_CONGESTION_DATA.map((d) => d.hour),
    datasets: [
      {
        label: 'Congestion %',
        data: HOURLY_CONGESTION_DATA.map((d) => d.congestion),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: isLight ? '#ffffff' : '#0a0e1a',
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  // Chart 2: Average Waiting Time by Top Intersections
  const waitTimeChartData = {
    labels: intersections.slice(0, 6).map((i) => i.shortName),
    datasets: [
      {
        label: 'Avg Wait (seconds)',
        data: intersections.slice(0, 6).map((i) => i.waitTime),
        backgroundColor: 'rgba(245, 158, 11, 0.75)',
        borderColor: '#f59e0b',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Chart 3: Signal Efficiency
  const efficiencyChartData = {
    labels: intersections.slice(0, 6).map((i) => i.shortName),
    datasets: [
      {
        label: 'Signal Efficiency %',
        data: intersections.slice(0, 6).map((i) => i.efficiency),
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isLight ? '#ffffff' : '#111827',
        titleColor: isLight ? '#0f172a' : '#e2e8f0',
        bodyColor: '#06b6d4',
        borderColor: isLight ? 'rgba(8, 145, 178, 0.3)' : 'rgba(6, 182, 212, 0.25)',
        borderWidth: 1,
        padding: 8,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: isLight ? '#64748b' : '#64748b', font: { size: 9 } },
      },
      y: {
        grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: isLight ? '#64748b' : '#64748b', font: { size: 9 } },
      },
    },
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title & Gwalior Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
            Dashboard Overview
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
              MP-07 GWALIOR
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Real-time AI traffic monitoring & signal optimization across Gwalior metropolitan area
          </p>
        </div>

        {/* Quick Actions & Corridor Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigateView('video-ai')}
            className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3 shadow-md shadow-cyan-500/20"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>YOLO Vision AI</span>
          </button>

          <div
            onClick={() => onNavigateView('emergency')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium cursor-pointer hover:bg-emerald-500/20 transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot"></span>
            <span>{activeCorridors} Emergency Corridors</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 4 Sleek Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Active Intersections */}
        <div
          onClick={() => onNavigateView('intersections')}
          className="stat-card p-3.5 bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border border-cyan-500/20 cursor-pointer hover:border-cyan-400/40"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Active Intersections
              </p>
              <p className="text-2xl font-bold text-cyan-400 font-mono leading-none">
                {activeIntersectionsCount}
              </p>
              <p className="text-[11px] mt-1.5 font-medium text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> 100% online in Gwalior
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#1a2235]/70 text-cyan-400 shadow-md">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 2: Avg Congestion Score */}
        <div
          onClick={() => onNavigateView('analytics')}
          className="stat-card p-3.5 bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/20 cursor-pointer hover:border-amber-400/40"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Avg Congestion Score
              </p>
              <p className="text-2xl font-bold text-amber-400 font-mono leading-none">
                {avgCongestion}%
              </p>
              <p className="text-[11px] mt-1.5 font-medium text-red-400 flex items-center gap-0.5">
                ↑ +6% peak hour trend
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#1a2235]/70 text-amber-400 shadow-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 3: Emergency Corridors */}
        <div
          onClick={() => onNavigateView('emergency')}
          className="stat-card p-3.5 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 cursor-pointer hover:border-emerald-400/40"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Emergency Corridors
              </p>
              <p className="text-2xl font-bold text-emerald-400 font-mono leading-none">
                {activeCorridors}
              </p>
              <p className="text-[11px] mt-1.5 font-medium text-emerald-400 flex items-center gap-0.5">
                <Shield className="w-3 h-3" /> Green Wave Active (JAH / Morar)
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#1a2235]/70 text-emerald-400 shadow-md">
              <Siren className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 4: Active Incidents */}
        <div
          onClick={() => onNavigateView('incidents')}
          className="stat-card p-3.5 bg-gradient-to-br from-red-500/15 to-red-500/5 border border-red-500/20 cursor-pointer hover:border-red-400/40"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Active Incidents
              </p>
              <p className="text-2xl font-bold text-red-400 font-mono leading-none">
                {activeIncidents}
              </p>
              <p className="text-[11px] mt-1.5 font-medium text-amber-400 flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" /> Response teams dispatched
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#1a2235]/70 text-red-400 shadow-md">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Gwalior Traffic Map Panel */}
      <div className="glass-panel p-1 overflow-hidden border-cyan-500/20">
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-cyan-500/15">
          <div>
            <h2 className="text-xs lg:text-sm font-semibold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Gwalior Smart City Traffic Map
            </h2>
            <p className="text-[10px] text-slate-400">
              Live intersection status across Lashkar, City Center, Morar & Maharajpura
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-slate-400">Low (&lt;40%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-[10px] text-slate-400">Moderate (40-75%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-[10px] text-slate-400">Heavy (&gt;75%)</span>
            </div>
          </div>
        </div>

        <div className="p-1">
          <TrafficMap
            intersections={intersections}
            emergencyVehicles={emergencyVehicles}
            incidents={incidents}
            mode="all"
            height="310px"
            allowExpand={true}
            theme={theme}
            onSelectIntersection={(item) => {
              onSelectIntersection(item);
              onNavigateView('intersections');
            }}
          />
        </div>
      </div>

      {/* 3 Compact Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Chart 1 */}
        <div className="chart-container p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold text-slate-200">
              📊 Traffic Density Over Time
            </h3>
            <span className="text-[9px] text-cyan-400 font-mono">Today (IST)</span>
          </div>
          <div style={{ height: '190px' }}>
            <Line data={densityChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2 */}
        <div className="chart-container p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold text-slate-200">
              ⏱️ Average Waiting Time
            </h3>
            <span className="text-[9px] text-amber-400 font-mono">Seconds</span>
          </div>
          <div style={{ height: '190px' }}>
            <Bar data={waitTimeChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 3 */}
        <div className="chart-container p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold text-slate-200">
              🚦 Signal Efficiency
            </h3>
            <span className="text-[9px] text-emerald-400 font-mono">AI Adaptive %</span>
          </div>
          <div style={{ height: '190px' }}>
            <Bar data={efficiencyChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
