import React from 'react';
import { motion } from 'framer-motion';

const LegacyCanvas = React.memo(() => (
  <div id="three-container" className="flex-1 relative w-full h-full"></div>
));

const LegacyMetrics = React.memo(() => (
  <div className="h-32 mt-2 w-full relative">
    <canvas id="chart-metrics" className="w-full h-full"></canvas>
  </div>
));

export const DashboardUI: React.FC<{ isVisible: boolean, onGoHome: () => void, onShowInfo: () => void }> = ({ isVisible, onGoHome, onShowInfo }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [widgets, setWidgets] = React.useState({
    controls: true,
    telemetry: true,
    theory: true,
    console: true
  });
  const [widgetMenuOpen, setWidgetMenuOpen] = React.useState(false);

  return (
    <div 
      id="dashboard-view" 
      className={`fixed inset-0 z-50 bg-ink text-ghost flex flex-col font-space ${isVisible ? 'block' : 'hidden'}`}
    >


      {/* HEADER */}
      <header className="h-16 border-b border-neon-red/20 bg-ink/90 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-6">
          <h2 id="simulation-title" className="font-syne font-bold text-white text-lg tracking-wide">SIMLABS</h2>
          <div className="flex items-center gap-3 bg-slate-2/30 px-3 py-1.5 rounded border border-neon-red/10">
            <span id="sim-status-badge" className="text-neon-red text-xs uppercase tracking-widest font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse"></span> Idle
            </span>
            <span className="text-mist/50">|</span>
            <span id="sim-timer-val" className="text-mist font-mono text-xs">00:00:00</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button id="btn-goto-home" onClick={onGoHome} className="px-4 py-2 text-xs font-bold text-mist hover:text-white transition-colors uppercase tracking-widest">
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
            <button id="btn-mode-sim" className="px-3 py-1 text-xs font-bold rounded text-mist hover:text-white active">SIM</button>
            <button id="btn-mode-twin" className="px-3 py-1 text-xs font-bold rounded text-mist hover:text-white">TWIN</button>
          </div>
          
          <div className="h-4 w-px bg-slate-2/50 mx-2"></div>
          
          <div className="relative">
            <button onClick={() => setWidgetMenuOpen(!widgetMenuOpen)} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${widgetMenuOpen ? 'bg-white text-ink' : 'text-mist hover:text-white border border-slate-2/30 hover:bg-slate-2/20'}`}>
              Widgets
            </button>
            {widgetMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-ink-2/95 backdrop-blur border border-slate-2/50 rounded shadow-2xl p-2 z-50 flex flex-col gap-1">
                <button onClick={() => setWidgets({...widgets, controls: !widgets.controls})} className="text-left px-3 py-2 text-xs text-mist hover:bg-slate-2/30 rounded flex items-center justify-between">
                  Vector Controls <span className={widgets.controls ? "text-neon-red" : "text-transparent"}>●</span>
                </button>
                <button onClick={() => setWidgets({...widgets, telemetry: !widgets.telemetry})} className="text-left px-3 py-2 text-xs text-mist hover:bg-slate-2/30 rounded flex items-center justify-between">
                  Telemetry Engine <span className={widgets.telemetry ? "text-neon-red" : "text-transparent"}>●</span>
                </button>
                <button onClick={() => setWidgets({...widgets, theory: !widgets.theory})} className="text-left px-3 py-2 text-xs text-mist hover:bg-slate-2/30 rounded flex items-center justify-between">
                  Theory <span className={widgets.theory ? "text-neon-red" : "text-transparent"}>●</span>
                </button>
                <button onClick={() => setWidgets({...widgets, console: !widgets.console})} className="text-left px-3 py-2 text-xs text-mist hover:bg-slate-2/30 rounded flex items-center justify-between">
                  Event Log <span className={widgets.console ? "text-neon-red" : "text-transparent"}>●</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT SIDEBAR - ATTACKS */}
        <aside className={`transition-all duration-300 border-r border-neon-red/10 bg-ink/50 backdrop-blur-md flex flex-col z-20 ${sidebarOpen ? 'w-64 shadow-[4px_0_24px_rgba(0,0,0,0.4)]' : 'w-0 border-none shadow-none opacity-0 overflow-hidden'}`}>
          <div className="p-4 border-b border-neon-red/10 flex items-center justify-between">
            <span className="text-xs font-bold text-neon-red uppercase tracking-widest whitespace-nowrap">Attack Vectors</span>
            <button id="btn-toggle-sidebar" onClick={() => setSidebarOpen(false)} className="text-mist hover:text-white shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
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
              <button key={atk.id} className="vector-item w-full text-left rounded text-sm text-mist hover:bg-neon-red/10 hover:text-white group flex items-center px-3 py-2 gap-3 transition-colors" data-vector={atk.id.toString()}>
                 <span className="vector-status-icon shrink-0 w-1.5 h-1.5 rounded-full bg-slate-2 group-hover:bg-neon-red transition-colors"></span>
                 <span className="vector-name whitespace-nowrap truncate">{atk.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 relative bg-[#07080b] flex flex-col">
          
          {/* FLOATING REOPEN BUTTON */}
          {!sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-20 px-4 py-2 bg-ink/80 backdrop-blur-md border border-neon-red/30 rounded text-xs font-bold text-neon-red uppercase tracking-widest hover:bg-neon-red/10 transition-colors shadow-lg flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              Attack Vectors
            </button>
          )}

          <LegacyCanvas />
          
          {/* Floating Info Button */}
          <motion.button
            layoutId="info-modal-container"
            onClick={onShowInfo}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-ink-2/80 backdrop-blur-md border border-neon-red/30 shadow-[0_0_15px_rgba(255,42,77,0.2)] flex items-center justify-center text-neon-red hover:bg-neon-red hover:text-ink hover:shadow-[0_0_25px_rgba(255,42,77,0.5)] transition-all duration-300 z-[100]"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </motion.button>

          <div id="flow-explanation-banner" className="absolute top-6 left-1/2 -translate-x-1/2 bg-ink-2/90 border border-neon-red/30 px-4 py-2 rounded backdrop-blur-md shadow-2xl flex items-center gap-3 z-20 pointer-events-none hidden">
              <span id="flow-banner-badge" className="text-xs font-bold text-neon-red uppercase tracking-wider">STATUS</span>
              <span id="flow-banner-text" className="text-sm text-ghost">System standing by.</span>
          </div>

          <div id="node-labels-container" className="absolute inset-0 pointer-events-none z-10"></div>
          <div id="node-hover-tooltip" className="absolute bg-ink-2/90 border border-slate-2 px-3 py-2 rounded text-xs text-ghost z-30 hidden pointer-events-none backdrop-blur shadow-lg"></div>

          {/* LIST VIEW */}
          <div id="topology-list-overlay" className="absolute inset-0 bg-ink-2/60 backdrop-blur-md z-40 hidden p-8 overflow-auto">
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
            <button id="btn-view-3d" className="p-2 text-mist hover:text-white active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </button>
            <button id="btn-view-topo" className="p-2 text-mist hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </button>
            <button id="btn-view-list" className="p-2 text-mist hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
            <div className="h-6 w-px bg-slate-2/30 mx-1"></div>
            <button id="btn-zoom-out" className="p-2 text-mist hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <span id="zoom-val" className="text-xs font-mono text-neon-red min-w-[40px] text-center">100%</span>
            <button id="btn-zoom-in" className="p-2 text-mist hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <div className="h-6 w-px bg-slate-2/30 mx-1"></div>
            <button id="btn-tool-rotate" className="p-2 text-mist hover:text-white active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.46-5.46"></path></svg>
            </button>
            <button id="btn-tool-pan" className="p-2 text-mist hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="19 9 22 12 19 15"></polyline><polyline points="9 19 12 22 15 19"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
            </button>
            <button id="btn-tool-reset" className="p-2 text-mist hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </button>
          </div>

          {/* FLOATING WIDGETS (Draggable Overlays) */}
        
          {/* Controls Overlay */}
          {widgets.controls && (
            <motion.div drag dragMomentum={false} className="absolute top-24 right-6 z-40 w-72 border border-slate-2/50 rounded bg-ink-2/95 backdrop-blur-md shadow-2xl flex flex-col">
              <div className="p-3 text-[10px] font-bold text-mist uppercase tracking-widest border-b border-slate-2/50 flex items-center justify-between cursor-move bg-slate-2/10">
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-neon-red rounded-full"></span> Vector Controls</div>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setWidgets({...widgets, controls: false})} className="hover:text-neon-red text-slate-2 transition-colors">✕</button>
              </div>
              <div onPointerDown={(e) => e.stopPropagation()} id="dynamic-controls" className="p-3 space-y-2 text-sm text-ghost max-h-[40vh] overflow-y-auto custom-scrollbar">
                {/* Injected by app.js */}
              </div>
            </motion.div>
          )}

          {/* Telemetry Overlay */}
          {widgets.telemetry && (
            <motion.div drag dragMomentum={false} className="absolute top-[360px] right-6 z-40 w-72 border border-slate-2/50 rounded bg-ink-2/95 backdrop-blur-md shadow-2xl flex flex-col">
              <div className="p-3 text-[10px] font-bold text-mist uppercase tracking-widest border-b border-slate-2/50 flex items-center justify-between cursor-move bg-slate-2/10">
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-neon-red rounded-full"></span> Telemetry Engine</div>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setWidgets({...widgets, telemetry: false})} className="hover:text-neon-red text-slate-2 transition-colors">✕</button>
              </div>
              
              <div onPointerDown={(e) => e.stopPropagation()} className="p-3 flex flex-col gap-3">
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

                <LegacyMetrics />
              </div>
            </motion.div>
          )}

          {/* Theory Overlay */}
          {widgets.theory && (
            <motion.div drag dragMomentum={false} className="absolute top-24 left-6 z-40 w-72 border border-slate-2/50 rounded bg-ink-2/95 backdrop-blur-md shadow-2xl flex flex-col">
              <div className="p-3 text-[10px] font-bold text-mist uppercase tracking-widest border-b border-slate-2/50 flex items-center justify-between cursor-move bg-slate-2/10">
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-neon-red rounded-full"></span> Theory</div>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setWidgets({...widgets, theory: false})} className="hover:text-neon-red text-slate-2 transition-colors">✕</button>
              </div>
              <div onPointerDown={(e) => e.stopPropagation()} id="attack-info-body" className="p-3 text-xs text-ghost leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                Select an attack vector to load details.
              </div>
            </motion.div>
          )}

          {/* ESP Board Panel Overlay */}
          <div id="window-board" className="hidden absolute z-50 w-72 border border-slate-2/50 rounded bg-ink-2/95 backdrop-blur-md shadow-2xl flex-col" style={{ top: '100px', left: '100px' }}>
            <div className="p-3 text-[10px] font-bold text-mist uppercase tracking-widest border-b border-slate-2/50 flex justify-between items-center cursor-move bg-slate-2/10">
              <span>Schematic</span>
              <button id="btn-toggle-window-board" className="hover:text-neon-red text-slate-2 transition-colors">✕</button>
            </div>
            <div id="esp-board-body" className="p-3"></div>
          </div>

          {/* CONSOLE Overlay */}
          {widgets.console && (
            <motion.div drag dragMomentum={false} className="absolute bottom-6 left-[300px] z-40 w-[500px] h-48 border border-slate-2/50 rounded bg-ink-2/95 backdrop-blur-md shadow-2xl flex flex-col">
              <div className="px-3 py-2 border-b border-slate-2/50 flex justify-between items-center cursor-move bg-slate-2/10">
                <span className="text-[10px] font-bold text-neon-red uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-neon-red rounded-full animate-pulse"></span> Live Event Log
                </span>
                <div className="flex gap-2 items-center">
                  <button id="btn-export-logs" className="text-[9px] text-mist hover:text-white uppercase tracking-widest px-2 py-1 rounded border border-slate-2/50">Export</button>
                  <button id="btn-clear-console" className="text-[9px] text-mist hover:text-white uppercase tracking-widest px-2 py-1 rounded border border-slate-2/50">Clear</button>
                  <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setWidgets({...widgets, console: false})} className="hover:text-neon-red text-slate-2 transition-colors ml-2 font-bold text-xs">✕</button>
                </div>
              </div>
              <div onPointerDown={(e) => e.stopPropagation()} id="console-log-body" className="flex-1 overflow-y-auto p-3 text-[11px] font-mono text-mist space-y-1 custom-scrollbar">
                <div>&gt; Kernel ready...</div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};
