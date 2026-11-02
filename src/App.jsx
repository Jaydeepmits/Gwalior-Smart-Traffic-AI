import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import IntersectionsView from './views/IntersectionsView';
import SignalsView from './views/SignalsView';
import EmergencyView from './views/EmergencyView';
import IncidentsView from './views/IncidentsView';
import AnalyticsView from './views/AnalyticsView';
import VideoAiView from './views/VideoAiView';

import {
  GWALIOR_CITY_CONFIG,
  INITIAL_INTERSECTIONS,
  INITIAL_EMERGENCY_VEHICLES,
  INITIAL_INCIDENTS,
} from './data/trafficData';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [intersections, setIntersections] = useState(INITIAL_INTERSECTIONS);
  const [selectedIntersection, setSelectedIntersection] = useState(INITIAL_INTERSECTIONS[0]);
  const [emergencyVehicles, setEmergencyVehicles] = useState(INITIAL_EMERGENCY_VEHICLES);
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('trafficai_theme') || 'dark';
  });

  // Keep HTML document class and localStorage in sync with theme state
  useEffect(() => {
    localStorage.setItem('trafficai_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Trigger floating feedback toast
  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Master Timer: Updates signal countdowns and phases every second
  useEffect(() => {
    const timer = setInterval(() => {
      setIntersections((prevIntersections) =>
        prevIntersections.map((intersection) => {
          if (intersection.isPaused) return intersection;

          let newCount = intersection.countdown - 1;
          let newState = intersection.signalState;
          let isOverridden = intersection.isOverridden;

          if (newCount <= 0) {
            isOverridden = false; // Reset manual override upon phase complete
            if (newState === 'green') {
              newState = 'yellow';
              newCount = intersection.timing?.yellow || 5;
            } else if (newState === 'yellow') {
              newState = 'red';
              newCount = intersection.timing?.red || 30;
            } else {
              newState = 'green';
              newCount = intersection.timing?.green || 40;
            }
          }

          // Subtle live jitter in vehicle count
          let newVehicles = intersection.vehicles;
          if (Math.random() < 0.15) {
            newVehicles = Math.max(20, newVehicles + (Math.floor(Math.random() * 5) - 2));
          }

          return {
            ...intersection,
            countdown: newCount,
            signalState: newState,
            vehicles: newVehicles,
            isOverridden,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Sync selected intersection when list updates
  useEffect(() => {
    if (selectedIntersection) {
      const updated = intersections.find((i) => i.id === selectedIntersection.id);
      if (updated) setSelectedIntersection(updated);
    }
  }, [intersections]);

  // Handler: Manual Force Green
  const handleForceGreen = (signalId) => {
    setIntersections((prev) =>
      prev.map((item) => {
        if (item.id === signalId || item.signalId === signalId) {
          return {
            ...item,
            signalState: 'green',
            countdown: item.timing?.green || 45,
            isPaused: false,
            isOverridden: true,
          };
        }
        return item;
      })
    );
    const target = intersections.find((i) => i.id === signalId || i.signalId === signalId);
    showToast(`🟢 Forced Priority Green Signal at ${target?.name || signalId}!`, 'success');
  };

  // Handler: Pause / Hold Signal
  const handlePauseSignal = (signalId) => {
    let paused = false;
    setIntersections((prev) =>
      prev.map((item) => {
        if (item.id === signalId || item.signalId === signalId) {
          paused = !item.isPaused;
          return { ...item, isPaused: paused };
        }
        return item;
      })
    );
    const target = intersections.find((i) => i.id === signalId || i.signalId === signalId);
    showToast(
      paused
        ? `⏸️ Signal Countdown Paused for ${target?.shortName || signalId}`
        : `▶️ Signal Countdown Resumed for ${target?.shortName || signalId}`,
      'info'
    );
  };

  // Handler: Reset Signal to AI Automated Loop
  const handleResetSignal = (signalId) => {
    setIntersections((prev) =>
      prev.map((item) => {
        if (item.id === signalId || item.signalId === signalId) {
          return {
            ...item,
            signalState: 'green',
            countdown: item.timing?.green || 40,
            isPaused: false,
            isOverridden: false,
          };
        }
        return item;
      })
    );
    const target = intersections.find((i) => i.id === signalId || i.signalId === signalId);
    showToast(`🔄 Signal Reset to Autonomous AI Cycle: ${target?.shortName || signalId}`, 'info');
  };

  // Handler: Toggle Emergency Corridor
  const handleToggleCorridor = (vehicleId) => {
    let newStatus = 'Active';
    setEmergencyVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          newStatus = v.status === 'Active' ? 'Inactive' : 'Active';
          return { ...v, status: newStatus };
        }
        return v;
      })
    );

    const veh = emergencyVehicles.find((v) => v.id === vehicleId);

    if (newStatus === 'Active') {
      showToast(
        `🚨 Green Wave Corridor Activated for ${veh?.name}! Preempting signals toward ${veh?.hospital}`,
        'warning'
      );
    } else {
      showToast(`Corridor Deactivated for ${veh?.name}. Normal signal cycling restored.`, 'info');
    }
  };

  // Handler: Add new Emergency Vehicle
  const handleAddNewEmergencyVehicle = (newVeh) => {
    setEmergencyVehicles((prev) => [newVeh, ...prev]);
    showToast(`🚨 New Emergency Unit ${newVeh.id} dispatched with Green Wave priority!`, 'success');
  };

  // Handler: Resolve an incident
  const handleResolveIncident = (incidentId) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: 'Cleared' } : inc))
    );
    const inc = incidents.find((i) => i.id === incidentId);
    showToast(`✅ Incident ${inc?.type} at ${inc?.title} marked as Cleared!`, 'success');
  };

  // Handler: Add new Incident
  const handleAddNewIncident = (newIncident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    showToast(`⚠️ New ${newIncident.type} reported in Gwalior: ${newIncident.title}`, 'warning');
  };

  // Handler: Apply AI Recommended Timing from YOLO Vision Analyzer
  const handleApplyRecommendedTiming = (intersectionId, newTiming) => {
    setIntersections((prev) =>
      prev.map((i) => {
        if (i.id === intersectionId) {
          return {
            ...i,
            timing: { ...i.timing, ...newTiming },
            countdown: newTiming.green || i.countdown,
          };
        }
        return i;
      })
    );
    const target = intersections.find((i) => i.id === intersectionId);
    showToast(
      `⚡ Applied YOLO AI Timing to ${target?.shortName || intersectionId}: Green ${newTiming.green}s, Red ${newTiming.red}s`,
      'success'
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0e1a] text-slate-200">
      {/* Sidebar: In-flow docked left column */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        systemStatus={GWALIOR_CITY_CONFIG.systemStatus}
      />

      {/* Main Container: Flex column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Docked Header: In-flow top bar */}
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          incidents={incidents}
          intersections={intersections}
          onSelectIntersection={setSelectedIntersection}
          onNavigateView={setActiveView}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Scrollable Main Content: Perfectly docked beneath header, zero overlapping */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
          {activeView === 'dashboard' && (
            <DashboardView
              intersections={intersections}
              emergencyVehicles={emergencyVehicles}
              incidents={incidents}
              onSelectIntersection={setSelectedIntersection}
              onNavigateView={setActiveView}
              theme={theme}
            />
          )}

          {activeView === 'intersections' && (
            <IntersectionsView
              intersections={intersections}
              selectedIntersection={selectedIntersection}
              setSelectedIntersection={setSelectedIntersection}
              onNavigateView={setActiveView}
              theme={theme}
            />
          )}

          {activeView === 'video-ai' && (
            <VideoAiView
              intersections={intersections}
              onApplyRecommendedTiming={handleApplyRecommendedTiming}
              onForceGreen={handleForceGreen}
              theme={theme}
            />
          )}

          {activeView === 'signals' && (
            <SignalsView
              intersections={intersections}
              onForceGreen={handleForceGreen}
              onPauseSignal={handlePauseSignal}
              onResetSignal={handleResetSignal}
              theme={theme}
            />
          )}

          {activeView === 'emergency' && (
            <EmergencyView
              emergencyVehicles={emergencyVehicles}
              intersections={intersections}
              onToggleCorridor={handleToggleCorridor}
              onAddNewEmergencyVehicle={handleAddNewEmergencyVehicle}
              theme={theme}
            />
          )}

          {activeView === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              intersections={intersections}
              onResolveIncident={handleResolveIncident}
              onAddNewIncident={handleAddNewIncident}
              theme={theme}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              intersections={intersections}
              incidents={incidents}
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* Floating Interactive Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] border border-cyan-500/30 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 backdrop-blur-xl animate-slideUp text-xs">
          <span>{toastMessage.msg}</span>
        </div>
      )}
    </div>
  );
}
