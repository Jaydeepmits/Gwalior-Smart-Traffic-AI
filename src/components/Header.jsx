import React, { useState, useEffect } from 'react';
import { Search, Bell, X, AlertTriangle, ChevronRight, Sun, Moon } from 'lucide-react';

export default function Header({
  searchTerm,
  setSearchTerm,
  incidents = [],
  intersections = [],
  onSelectIntersection,
  onNavigateView,
  theme = 'dark',
  onToggleTheme,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Search autocomplete
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const q = searchTerm.toLowerCase();

    const matchedIntersections = intersections
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          i.zone.toLowerCase().includes(q)
      )
      .map((i) => ({ ...i, searchType: 'intersection' }));

    const matchedIncidents = incidents
      .filter((inc) => inc.title.toLowerCase().includes(q) || inc.type.toLowerCase().includes(q))
      .map((inc) => ({ ...inc, searchType: 'incident' }));

    setSearchResults([...matchedIntersections.slice(0, 4), ...matchedIncidents.slice(0, 3)]);
  }, [searchTerm, intersections, incidents]);

  const activeIncidentsCount = incidents.filter((i) => i.status !== 'Cleared').length;

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="h-13 shrink-0 bg-[#111827]/90 backdrop-blur-xl border-b border-cyan-500/15 flex items-center justify-between px-5 z-20 select-none transition-colors duration-200">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm lg:max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search Gwalior intersection, signal, or incident..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a2235]/70 border border-cyan-500/20 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all font-sans"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearching && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#111827] border border-cyan-500/25 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 px-2 py-1 font-semibold">
              Search Results
            </p>
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (item.searchType === 'intersection') {
                    onSelectIntersection(item);
                    onNavigateView('intersections');
                  } else {
                    onNavigateView('incidents');
                  }
                  setSearchTerm('');
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1a2235] cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-white">
                    {item.name || item.title}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.searchType === 'intersection'
                      ? `${item.id} • ${item.zone}`
                      : `${item.type} • ${item.status}`}
                  </p>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {item.searchType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Traffic Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a2235]/50 border border-cyan-500/15">
          <span className="w-2 h-2 rounded-full bg-amber-400 pulse-dot"></span>
          <span className="text-xs font-medium text-amber-400">Moderate Traffic (58%)</span>
        </div>

        {/* Live Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
          <span className="w-2 h-2 rounded-full bg-red-500 pulse-dot"></span>
          <span className="text-xs font-semibold text-red-500">LIVE</span>
        </div>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-lg border border-cyan-500/20 bg-[#1a2235]/40 hover:bg-[#1a2235] transition-all cursor-pointer text-slate-300 hover:text-cyan-400 flex items-center justify-center shadow-sm"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-fadeIn" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-500 animate-fadeIn" />
          )}
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-lg hover:bg-[#1a2235]/60 transition-colors cursor-pointer text-slate-400 hover:text-white"
          >
            <Bell className="w-4 h-4" />
            {activeIncidentsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-lg shadow-red-500/40">
                {activeIncidentsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Modal */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#111827] border border-cyan-500/20 rounded-xl shadow-2xl p-3 z-50 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Active Incident Alerts
                </span>
                <span className="text-[10px] text-red-400 font-mono bg-red-500/10 px-1.5 py-0.5 rounded">
                  {activeIncidentsCount} Active
                </span>
              </div>

              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
                {incidents.slice(0, 4).map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      onNavigateView('incidents');
                      setShowNotifications(false);
                    }}
                    className="p-2 rounded-lg bg-[#1a2235]/40 hover:bg-[#1a2235] border border-cyan-500/10 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-amber-400">{inc.type}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{inc.detectedTime}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 truncate">{inc.title}</p>
                    <p className="text-[9px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Status: {inc.status}</span>
                      <span className="text-cyan-400 flex items-center">
                        View <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  onNavigateView('incidents');
                  setShowNotifications(false);
                }}
                className="w-full mt-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/25 transition-colors cursor-pointer"
              >
                Open Incidents Monitor
              </button>
            </div>
          )}
        </div>

        {/* Live Date and Real-Time Clock */}
        <div className="text-right border-l border-cyan-500/15 pl-3">
          <p className="text-[9px] text-slate-500 font-medium">{formattedDate}</p>
          <p className="text-xs text-slate-200 font-mono font-semibold tracking-wider">
            {formattedTime} <span className="text-[8px] text-cyan-400">IST</span>
          </p>
        </div>
      </div>
    </header>
  );
}
