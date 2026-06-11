import React, { useEffect } from 'react';

export const DashboardUI: React.FC<{ isVisible: boolean, onGoHome: () => void }> = ({ isVisible, onGoHome }) => {
  // Bind the go home button to the React state instead of the legacy app.js routing
  useEffect(() => {
    const btn = document.getElementById('btn-goto-home');
    if (btn) {
      const handler = () => {
        // We override the vanilla behavior to use our React state
        document.getElementById('dashboard-view')?.classList.add('hidden');
        onGoHome();
      };
      btn.addEventListener('click', handler);
      return () => btn.removeEventListener('click', handler);
    }
  }, [onGoHome]);

  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div 
      id="dashboard-view" 
      className={`fixed inset-0 z-50 bg-ink text-ghost flex flex-col font-space transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none hidden'}`}
    >
      {/* TRANSITION SPLASH SCREEN */}
      <div id="transition-splash" className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center hidden opacity-0 transition-opacity duration-1000">
        <h2 className="text-2xl text-neon-red font-bold font-syne animate-pulse tracking-widest">INITIALIZING SIMLAB SANDBOX...</h2>
        <div className="w-64 h-1 bg-slate-2/30 mt-6 rounded overflow-hidden">
          <div id="splash-progress-bar" className="h-full bg-neon-red w-0 transition-all duration-300"></div>
        </div>
        <div id="splash-status-console" className="mt-4 text-xs font-mono text-mist">
           <div className="console-line line-active">&gt; Starting platform engine...</div>
        </div>
      </div>

      {/* HEADER */}
      <header className="h-16 border-b border-neon-red/20 bg-ink/90 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-6">
          <h2 id="simulation-title" className="font-syne font-bold text-white text-lg tracking-wide">SIMULATION SANDBOX</h2>
          <div className="flex items-center gap-3 bg-slate-2/30 px-3 py-1.5 rounded border border-neon-red/10">
            <span id="sim-status-badge" className="text-neon-red text-xs uppercase tracking-widest font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse"></span> Idle
            </span>
            <span className="text-mist/50">|</span>
            <span id="sim-timer-val" className="text-mist font-mono text-xs">00:00:00</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button id="btn-goto-home" className="px-4 py-2 text-xs font-bold text-mist hover:text-white transition-colors uppercase tracking-widest">
            Close Sandbox
          </button>
          
          <div className="h-4 w-px bg-slate-2/50 mx-2"></div>

          <button id="btn-trigger-attack" className="px-5 py-2 bg-neon-red text-ink font-bold text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2 hover:bg-white hover:text-neon-red transition-all shadow-[0_0_15px_rgba(255,42,77,0.3)]">
            <span className="btn-icon"></span> <span className="btn-text">Launch</span>
          </button>
          <button id="btn-stop-attack" className="px-4 py-2 border border-neon-red/40 text-neon-red font-bold text-xs uppercase tracking-widest rounded hover:bg-neon-red/10 transition-colors">
            Stop
          </button>
          <button id="btn-reset-sim" className="px-4 py-2 border border-slate-2 text-mist font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-2/50 transition-colors">
            Reset
          </button>
          
          <div className="h-4 w-px bg-slate-2/50 mx-2"></div>

          <div className="flex bg-slate-2/30 p-1 rounded">
            <button id="btn-mode-sim" className="px-3 py-1 text-xs font-bold rounded bg-neon-red/20 text-neon-red">SIM</button>
            <button id="btn-mode-twin" className="px-3 py-1 text-xs font-bold rounded text-mist hover:text-white">TWIN</button>
          </div>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT SIDEBAR - ATTACKS */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r border-neon-red/10 bg-ink-2/80 backdrop-blur flex flex-col z-10`}>
          <div className={`p-4 border-b border-neon-red/10 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && <span className="text-xs font-bold text-neon-red uppercase tracking-widest whitespace-nowrap">Attack Vectors</span>}
            <button id="btn-toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-mist hover:text-white shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transform transition-transform ${!sidebarOpen && 'rotate-180'}`}><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 custom-scrollbar">
            {[
              { id: 1, name: "Eavesdropping" },
              { id: 2, name: "Man-in-the-Middle" },
              { id: 3, name: "Replay Attack" },
              { id: 4, name: "Spoofing Attack" },
              { id: 5, name: "Packet Injection" },
              { id: 6, name: "Denial of Service" },
              { id: 7, name: "Distributed DoS" },
              { id: 8, name: "Jamming Attack" },
              { id: 9, name: "Credential Theft" },
              { id: 10, name: "Session Hacking" },
              { id: 11, name: "Rogue Insertion" },
              { id: 12, name: "Routing Attack" },
              { id: 13, name: "Sybil Attack" },
              { id: 14, name: "Sensor Tampering" },
              { id: 15, name: "Timing Attack" },
              { id: 16, name: "Physical Access" },
              { id: 17, name: "Delay Attack" }
            ].map(atk => (
              <button key={atk.id} title={!sidebarOpen ? atk.name : ""} className={`vector-item w-full text-left rounded text-sm text-mist hover:bg-neon-red/10 hover:text-white group flex items-center transition-colors ${sidebarOpen ? 'px-3 py-2 gap-3' : 'justify-center p-2'}`} data-vector={atk.id.toString()}>
                 <span className="vector-status-icon shrink-0 w-1.5 h-1.5 rounded-full bg-slate-2 group-hover:bg-neon-red transition-colors"></span>
                 {sidebarOpen && <span className="vector-name whitespace-nowrap truncate">{atk.name}</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* MIDDLE - 3D CANVAS */}
        <main className="flex-1 relative bg-ink">
          <div id="three-container" className="absolute inset-0 z-0"></div>
          
          {/* FLOATING OVERLAYS */}
          <div id="flow-explanation-banner" className="absolute top-6 left-1/2 -translate-x-1/2 bg-ink-2/90 border border-neon-red/30 px-4 py-2 rounded backdrop-blur-md shadow-2xl flex items-center gap-3 z-20 pointer-events-none hidden">
              <span id="flow-banner-badge" className="text-xs font-bold text-neon-red uppercase tracking-wider">STATUS</span>
              <span id="flow-banner-text" className="text-sm text-ghost">System standing by.</span>
          </div>

          <div id="node-labels-container" className="absolute inset-0 pointer-events-none z-10"></div>
          <div id="node-hover-tooltip" className="absolute bg-ink-2/90 border border-slate-2 px-3 py-2 rounded text-xs text-ghost z-30 hidden pointer-events-none backdrop-blur shadow-lg"></div>

          {/* LIST VIEW */}
          <div id="topology-list-overlay" className="absolute inset-0 bg-ink/95 z-40 hidden p-8 overflow-auto">
             <h3 className="text-neon-red font-syne text-xl mb-6">Device Registry</h3>
             <table className="w-full text-left text-sm text-mist">
               <thead className="border-b border-neon-red/20 text-xs uppercase tracking-wider">
                 <tr><th>Device</th><th>IP Address</th><th>MAC</th><th>Role</th><th>Status</th></tr>
               </thead>
               <tbody id="list-view-table-body" className="divide-y divide-slate-2/30"></tbody>
             </table>
          </div>

          {/* TOOLBAR */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-ink-2/80 border border-neon-red/20 backdrop-blur-md rounded-lg p-2 flex items-center gap-2 z-20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" id="viewport-toolbar">
            <div id="toolbar-drag-handle" className="cursor-move text-slate-2 px-2 hover:text-neon-red transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2"></circle><circle cx="9" cy="12" r="2"></circle><circle cx="9" cy="19" r="2"></circle><circle cx="15" cy="5" r="2"></circle><circle cx="15" cy="12" r="2"></circle><circle cx="15" cy="19" r="2"></circle></svg>
            </div>
            <div className="h-6 w-px bg-slate-2/30"></div>
            <button id="btn-view-3d" className="p-2 text-neon-red bg-neon-red/10 rounded hover:bg-neon-red/20">3D</button>
            <button id="btn-view-topo" className="p-2 text-mist hover:text-white">TOP</button>
            <button id="btn-view-list" className="p-2 text-mist hover:text-white">LST</button>
            <div className="h-6 w-px bg-slate-2/30 mx-1"></div>
            <button id="btn-zoom-out" className="p-2 text-mist hover:text-white">-</button>
            <span id="zoom-val" className="text-xs font-mono text-neon-red min-w-[40px] text-center">100%</span>
            <button id="btn-zoom-in" className="p-2 text-mist hover:text-white">+</button>
            <div className="h-6 w-px bg-slate-2/30 mx-1"></div>
            <button id="btn-tool-rotate" className="p-2 text-neon-red bg-neon-red/10 rounded hover:bg-neon-red/20">ROT</button>
            <button id="btn-tool-pan" className="p-2 text-mist hover:text-white">PAN</button>
            <button id="btn-tool-reset" className="p-2 text-mist hover:text-white">RST</button>
          </div>
        </main>

        {/* RIGHT SIDEBAR - DETAILS & METRICS */}
        <aside className="w-[340px] border-l border-neon-red/10 bg-ink-2/80 backdrop-blur flex flex-col z-10">
          
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {/* Controls */}
            <div className="border border-slate-2/50 rounded bg-ink p-3 shadow-inner">
              <div className="text-[10px] font-bold text-mist uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neon-red rounded-full"></span> Vector Controls
              </div>
              <div id="dynamic-controls" className="space-y-2 text-sm text-ghost">
                {/* Injected by app.js */}
              </div>
            </div>

            {/* Metrics */}
            <div className="border border-slate-2/50 rounded bg-ink p-3 shadow-inner flex flex-col gap-3">
              <div className="text-[10px] font-bold text-mist uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neon-red rounded-full"></span> Telemetry Engine
              </div>
              
              {/* CPU */}
              <div>
                <div className="flex justify-between text-[10px] text-ghost mb-1"><span>CPU LOAD</span><span id="metric-cpu-val" className="font-mono text-neon-red">0%</span></div>
                <div className="h-1 w-full bg-slate-2/30 rounded overflow-hidden"><div id="metric-cpu-bar" className="h-full bg-neon-red w-0 transition-all"></div></div>
              </div>

              {/* HEAP */}
              <div>
                <div className="flex justify-between text-[10px] text-ghost mb-1"><span>FREE HEAP</span><span id="metric-heap-val" className="font-mono text-neon-red">0 KB</span></div>
                <div className="h-1 w-full bg-slate-2/30 rounded overflow-hidden"><div id="metric-heap-bar" className="h-full bg-white w-0 transition-all"></div></div>
              </div>

              {/* LOSS */}
              <div>
                <div className="flex justify-between text-[10px] text-ghost mb-1"><span>PACKET LOSS</span><span id="metric-loss-val" className="font-mono text-neon-red">0%</span></div>
                <div className="h-1 w-full bg-slate-2/30 rounded overflow-hidden"><div id="metric-loss-bar" className="h-full bg-red-500 w-0 transition-all"></div></div>
              </div>

              {/* RSSI */}
              <div>
                <div className="flex justify-between text-[10px] text-ghost mb-1"><span>RSSI</span><span id="metric-rssi-val" className="font-mono text-neon-red">0 dBm</span></div>
                <div className="h-1 w-full bg-slate-2/30 rounded overflow-hidden"><div id="metric-rssi-bar" className="h-full bg-green-400 w-0 transition-all"></div></div>
              </div>
              
              <div className="flex justify-between items-center text-xs mt-2 border-t border-slate-2/30 pt-2">
                <span className="text-mist">ACTIVE NODES</span>
                <span id="metric-nodes-val" className="font-mono font-bold text-white">0 Nodes</span>
              </div>

              <div className="h-32 mt-2 w-full relative">
                <canvas id="chart-metrics" className="w-full h-full"></canvas>
              </div>
            </div>

            {/* Explanation panel */}
            <div id="explanations-collapsible" className="border border-slate-2/50 rounded bg-ink flex flex-col">
              <div className="p-3 text-[10px] font-bold text-mist uppercase tracking-widest border-b border-slate-2/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neon-red rounded-full"></span> Theory
              </div>
              <div id="attack-info-body" className="p-3 text-xs text-ghost leading-relaxed max-h-32 overflow-y-auto">
                Select an attack vector to load details.
              </div>
            </div>

            {/* ESP Board Panel (Hidden by default, triggered by app.js) */}
            <div id="window-board" className="hidden border border-slate-2/50 rounded bg-ink">
              <div className="p-3 text-[10px] font-bold text-mist uppercase tracking-widest border-b border-slate-2/50 flex justify-between items-center">
                 <span>Schematic</span>
                 <button id="btn-toggle-window-board" className="hidden"></button>
              </div>
              <div id="esp-board-body" className="p-3"></div>
            </div>

          </div>

          {/* CONSOLE */}
          <div className="h-48 border-t border-neon-red/20 bg-ink flex flex-col">
             <div className="px-3 py-2 border-b border-neon-red/10 flex justify-between items-center">
                <span className="text-[10px] font-bold text-neon-red uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-neon-red rounded-full animate-pulse"></span> Live Event Log
                </span>
                <div className="flex gap-2">
                  <button id="btn-export-logs" className="text-[9px] text-mist hover:text-white uppercase tracking-widest px-2 py-1 rounded border border-slate-2/50">Export</button>
                  <button id="btn-clear-console" className="text-[9px] text-mist hover:text-white uppercase tracking-widest px-2 py-1 rounded border border-slate-2/50">Clear</button>
                </div>
             </div>
             <div id="console-log-body" className="flex-1 overflow-y-auto p-3 text-[11px] font-mono text-mist space-y-1 custom-scrollbar">
                <div>&gt; Kernel ready...</div>
             </div>
          </div>
        </aside>
      </div>

    </div>
  );
};
