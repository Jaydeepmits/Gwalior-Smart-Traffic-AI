import React, { useState } from 'react';
import {
  Download,
  Calendar,
  Layers,
  Filter,
  TrendingDown,
  TrendingUp,
  FileText,
  X,
  CheckCircle,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  GWALIOR_CITY_CONFIG,
  HOURLY_CONGESTION_DATA,
  ZONE_DENSITY_DATA,
  RESPONSE_TIME_TREND,
  WAITING_TIME_COMPARISON,
} from '../data/trafficData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsView({ intersections = [], incidents = [], theme = 'dark' }) {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [selectedIntersectionId, setSelectedIntersectionId] = useState('All');
  const [showExportModal, setShowExportModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isLight = theme === 'light';

  // Filter intersections based on selected zone
  const filteredTableData = intersections.filter((i) => {
    if (selectedZone !== 'All Zones' && !i.zone.includes(selectedZone.split(' - ')[1] || selectedZone)) {
      return false;
    }
    if (selectedIntersectionId !== 'All' && i.id !== selectedIntersectionId) {
      return false;
    }
    return true;
  });

  // Chart 1: Average Congestion by Hour
  const congestionHourlyData = {
    labels: HOURLY_CONGESTION_DATA.map((d) => d.hour),
    datasets: [
      {
        label: 'Average Congestion %',
        data: HOURLY_CONGESTION_DATA.map((d) => d.congestion),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
      },
    ],
  };

  // Chart 2: Signal Efficiency Score
  const signalEfficiencyData = {
    labels: intersections.map((i) => i.shortName),
    datasets: [
      {
        label: 'Efficiency %',
        data: intersections.map((i) => i.efficiency),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Chart 3: Emergency Response Time Trend (Legacy vs AI)
  const emergencyResponseData = {
    labels: RESPONSE_TIME_TREND.map((d) => d.day),
    datasets: [
      {
        label: 'Legacy Manual Transit (Minutes)',
        data: RESPONSE_TIME_TREND.map((d) => d.legacy),
        borderColor: '#ef4444',
        borderDash: [5, 5],
        borderWidth: 2,
        pointBackgroundColor: '#ef4444',
      },
      {
        label: 'TrafficAI Green Corridor (Minutes)',
        data: RESPONSE_TIME_TREND.map((d) => d.aiSystem),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: '#06b6d4',
      },
    ],
  };

  // Chart 4: Traffic Prediction Trend (Forecast vs Actual)
  const predictionTrendData = {
    labels: HOURLY_CONGESTION_DATA.map((d) => d.hour),
    datasets: [
      {
        label: 'Sensor Actual Vehicles',
        data: HOURLY_CONGESTION_DATA.map((d) => d.vehicles),
        borderColor: '#06b6d4',
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: 'AI Predictive Model',
        data: HOURLY_CONGESTION_DATA.map((d) => Math.round(d.vehicles * (1 + (Math.sin(d.vehicles) * 0.05)))),
        borderColor: '#a855f7',
        borderDash: [4, 4],
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Chart 5: Traffic Density by Zone
  const zoneDensityChartData = {
    labels: ZONE_DENSITY_DATA.map((z) => z.zone),
    datasets: [
      {
        data: ZONE_DENSITY_DATA.map((z) => z.density),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: isLight ? '#ffffff' : '#0a0e1a',
        borderWidth: 2,
      },
    ],
  };

  // Chart 6: Average Waiting Time Trend (Legacy vs AI Adaptive)
  const waitingTimeCompData = {
    labels: WAITING_TIME_COMPARISON.map((w) => w.name),
    datasets: [
      {
        label: 'Legacy Fixed Timing (sec)',
        data: WAITING_TIME_COMPARISON.map((w) => w.fixed),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderRadius: 4,
      },
      {
        label: 'AI Adaptive Timing (sec)',
        data: WAITING_TIME_COMPARISON.map((w) => w.adaptive),
        backgroundColor: 'rgba(6, 182, 212, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: isLight ? '#475569' : '#94a3b8', font: { size: 11 }, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: isLight ? '#ffffff' : '#111827',
        titleColor: isLight ? '#0f172a' : '#e2e8f0',
        bodyColor: '#06b6d4',
        borderColor: isLight ? 'rgba(8, 145, 178, 0.3)' : 'rgba(6, 182, 212, 0.3)',
        borderWidth: 1,
        padding: 8,
      },
    },
    scales: {
      x: {
        grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: isLight ? '#475569' : '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { color: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: isLight ? '#475569' : '#64748b', font: { size: 10 } },
      },
    },
  };

  const handleExportCSV = () => {
    let csv = 'ID,Name,Zone,Congestion,Vehicles,WaitTimeSec,Status\n';
    intersections.forEach((i) => {
      csv += `"${i.id}","${i.name}","${i.zone}",${i.density}%,${i.vehicles},${i.waitTime}s,"${i.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gwalior_Traffic_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* View Header & Export Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Analytics & Regional Reports
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              GWALIOR REGION
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprehensive traffic analysis, AI predictive models, corridor savings, and junction metrics
          </p>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="btn-primary text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
        >
          <Download className="w-3.5 h-3.5" />
          Export Report
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="glass-panel px-5 py-3 flex flex-wrap items-center gap-4">
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-[#1a2235] border border-cyan-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="today">Today (Live)</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-[#1a2235] border border-cyan-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {GWALIOR_CITY_CONFIG.zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        {/* Intersection Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedIntersectionId}
            onChange={(e) => setSelectedIntersectionId(e.target.value)}
            className="bg-[#1a2235] border border-cyan-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="All">All Gwalior Intersections</option>
            {intersections.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>

        {downloadSuccess && (
          <span className="text-xs text-emerald-400 ml-auto flex items-center gap-1 font-medium animate-fadeIn">
            <CheckCircle className="w-3.5 h-3.5" /> CSV Exported Successfully!
          </span>
        )}
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Avg Congestion
          </p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-bold font-mono text-amber-400">58%</p>
            <span className="text-xs font-medium text-red-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +6%
            </span>
          </div>
        </div>

        <div className="glass-panel p-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Signal Efficiency
          </p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-bold font-mono text-emerald-400">88%</p>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +4.2%
            </span>
          </div>
        </div>

        <div className="glass-panel p-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Avg Response Time
          </p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-bold font-mono text-cyan-400">6.8 min</p>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" /> -42%
            </span>
          </div>
        </div>

        <div className="glass-panel p-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Incidents Today
          </p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-2xl font-bold font-mono text-red-400">{incidents.length}</p>
            <span className="text-xs font-medium text-amber-400 flex items-center">
              Active: {incidents.filter((i) => i.status !== 'Cleared').length}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Analytics Charts */}
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            📊 Average Congestion by Hour
          </h3>
          <div style={{ height: '280px' }}>
            <Line data={congestionHourlyData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            🚦 Signal Efficiency Score (All Junctions)
          </h3>
          <div style={{ height: '280px' }}>
            <Bar data={signalEfficiencyData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            🚑 Emergency Response Time (Legacy vs TrafficAI Corridor)
          </h3>
          <div style={{ height: '280px' }}>
            <Line data={emergencyResponseData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            🔮 AI Traffic Prediction Trend (Actual vs Forecast)
          </h3>
          <div style={{ height: '280px' }}>
            <Line data={predictionTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            📈 Traffic Density by Zone
          </h3>
          <div style={{ height: '280px' }} className="flex items-center justify-center">
            <Doughnut
              data={zoneDensityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 } } },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            ⏱️ Average Waiting Time Trend (Static vs Adaptive Timers)
          </h3>
          <div style={{ height: '280px' }}>
            <Bar data={waitingTimeCompData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Performance Summary Table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-3 border-b border-cyan-500/15 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Gwalior Junction Performance Summary
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            Showing {filteredTableData.length} of {intersections.length} Junctions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#1a2235]/60 text-slate-400">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold uppercase tracking-wider">
                  Intersection
                </th>
                <th className="text-center px-4 py-2.5 font-semibold uppercase tracking-wider">
                  Congestion
                </th>
                <th className="text-center px-4 py-2.5 font-semibold uppercase tracking-wider">
                  Vehicles
                </th>
                <th className="text-center px-4 py-2.5 font-semibold uppercase tracking-wider">
                  Wait Time
                </th>
                <th className="text-center px-4 py-2.5 font-semibold uppercase tracking-wider">
                  Signal
                </th>
                <th className="text-center px-4 py-2.5 font-semibold uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {filteredTableData.map((item) => {
                const color =
                  item.status === 'heavy'
                    ? 'text-red-400'
                    : item.status === 'moderate'
                    ? 'text-amber-400'
                    : 'text-emerald-400';

                return (
                  <tr key={item.id} className="hover:bg-[#1a2235]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-slate-200 font-medium">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {item.id} • {item.zone}
                        </p>
                      </div>
                    </td>
                    <td className="text-center px-4 py-3 font-mono font-bold">
                      <span className={color}>{item.density}%</span>
                    </td>
                    <td className="text-center px-4 py-3 text-slate-300 font-mono">
                      {item.vehicles}
                    </td>
                    <td className="text-center px-4 py-3 text-slate-300 font-mono">
                      {item.waitTime}s
                    </td>
                    <td className="text-center px-4 py-3">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${
                          item.signalState === 'green'
                            ? 'traffic-green'
                            : item.signalState === 'yellow'
                            ? 'traffic-yellow'
                            : 'traffic-red'
                        }`}
                      ></span>
                    </td>
                    <td className="text-center px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          item.status === 'heavy'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : item.status === 'moderate'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-lg w-full bg-[#111827] border border-cyan-500/30 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Gwalior Traffic Executive Report
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-[#1a2235]/60 p-3 rounded-lg border border-cyan-500/15 space-y-1.5 font-mono">
                <p className="text-cyan-400 font-bold">SMART CITY COMMAND & CONTROL REPORT</p>
                <p>Region: Gwalior (MP-07), Madhya Pradesh</p>
                <p>Generated: {new Date().toLocaleString('en-GB')}</p>
                <p>Monitored Junctions: 12 Key Intersections</p>
                <p>System Congestion Average: 58%</p>
                <p>Emergency Time Savings: 4.8 min average per critical run</p>
              </div>

              <p className="text-slate-400 text-[11px]">
                This report consolidates sensor density readings, camera counts, emergency corridor preemption metrics, and SCATS-compatible signal cycles.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleExportCSV}
                  className="btn-primary flex-1 text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV Dataset
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setShowExportModal(false);
                  }}
                  className="btn-outline flex-1 text-xs"
                >
                  Print Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
