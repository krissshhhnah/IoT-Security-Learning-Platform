import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { attacks } from './LandingSections';

export const AttackInfoModal: React.FC<{ isOpen: boolean, attackId: number | null, onClose: () => void }> = ({ isOpen, attackId, onClose }) => {
  const attack = attacks.find(a => a.id === attackId) || attacks[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/90 backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,42,77,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,42,77,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
          </motion.div>
          
          {/* Modal Content */}
          <motion.div 
            layoutId="info-modal-container"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-ink border border-slate-2/30 rounded-xl shadow-[0_0_80px_rgba(255,42,77,0.15)] flex flex-col md:flex-row overflow-hidden"
          >
            {/* Left Accent Panel */}
            <div className="hidden md:flex flex-col justify-between w-48 bg-ink-2 border-r border-slate-2/30 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-neon-red/10 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <span className="text-neon-red font-mono text-xs uppercase tracking-widest font-bold">Vector ID</span>
                <div className="text-6xl font-syne font-bold text-ghost mt-2 opacity-80">{attack?.id.toString().padStart(2, '0')}</div>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 border border-neon-red/30 rounded-full flex items-center justify-center mb-4">
                  <div className="w-2 h-2 bg-neon-red rounded-full animate-pulse"></div>
                </div>
                <div className="font-mono text-[10px] text-slate-2 uppercase tracking-widest break-words">
                  STATUS: SECURE<br/>
                  HASH: {Math.random().toString(36).substring(2, 10).toUpperCase()}<br/>
                  LAYER: {attack?.layer}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative z-10 bg-gradient-to-br from-ink to-ink-2/50">
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-slate-2/20 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-neon-red/20 text-neon-red text-[10px] font-mono uppercase tracking-widest rounded border border-neon-red/30">
                      {attack?.layer} Layer
                    </span>
                    <span className="text-slate-2 text-[10px] font-mono tracking-widest uppercase flex items-center gap-1">
                      <span className="w-1 h-1 bg-slate-2 rounded-full"></span> Threat Analysis
                    </span>
                  </div>
                  <h3 className="font-syne font-bold text-3xl text-white tracking-wide">{attack?.name}</h3>
                </div>
                <button 
                  onClick={onClose}
                  className="text-slate-2 hover:text-neon-red hover:rotate-90 transition-all p-2 rounded-full hover:bg-neon-red/10"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              {/* Body */}
              <div className="p-6 md:p-8 text-mist text-sm leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar relative">
                
                <div className="mb-6 relative">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      In Simple Terms
                    </h4>
                    <span className="text-[9px] font-mono text-emerald-400/80 border border-emerald-400/30 px-1.5 py-0.5 rounded bg-emerald-400/10">TL;DR</span>
                  </div>
                  
                  <div className="p-4 bg-emerald-400/5 border-l-2 border-emerald-400/50 rounded-r text-ghost text-[13px] leading-loose font-inter">
                    {/* @ts-ignore */}
                    {attack?.tldr || attack?.desc}
                  </div>
                </div>

                <div className="mb-8 relative">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Technical Deep Dive
                    </h4>
                    <span className="text-[9px] font-mono text-neon-red/70 border border-neon-red/30 px-1.5 py-0.5 rounded">SYS.LOG.V2</span>
                  </div>
                  
                  {/* Highly Decorated Text Container */}
                  <div className="relative p-5 bg-ink-2/80 text-ghost text-[13px] leading-loose shadow-inner font-inter group">
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-neon-red/50"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-neon-red/50"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-neon-red/50"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-neon-red/50"></div>
                    
                    {/* Scanline Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,42,77,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
                    
                    {/* Text Content */}
                    <div className="relative z-10">
                      {attack?.desc}
                      <span className="inline-block w-1.5 h-3.5 bg-neon-red ml-1 animate-pulse align-middle"></span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-2/20 pb-2">
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                      SimLab Operating Procedures
                    </h4>
                    <span className="text-[9px] font-mono text-slate-2 uppercase">Protocol Active</span>
                  </div>
                  
                  <ul className="space-y-4 font-inter mt-4">
                    <li className="flex gap-4 items-start p-3 border border-slate-2/10 bg-ink-2/40 rounded hover:border-neon-red/30 transition-colors">
                      <div className="flex flex-col items-center">
                        <span className="text-neon-red font-mono font-bold text-xs">01</span>
                        <div className="w-[1px] h-4 bg-neon-red/30 mt-1"></div>
                      </div>
                      <span className="text-mist text-xs leading-relaxed pt-0.5">Observe the network topology for anomalous packet flows. Normal traffic routes will deviate under attack pressure.</span>
                    </li>
                    <li className="flex gap-4 items-start p-3 border border-slate-2/10 bg-ink-2/40 rounded hover:border-neon-red/30 transition-colors">
                      <div className="flex flex-col items-center">
                        <span className="text-neon-red font-mono font-bold text-xs">02</span>
                        <div className="w-[1px] h-4 bg-neon-red/30 mt-1"></div>
                      </div>
                      <span className="text-mist text-xs leading-relaxed pt-0.5">Monitor the <strong className="text-white">Telemetry Engine</strong> for unexpected spikes in CPU load, memory corruption, or elevated RF noise floors.</span>
                    </li>
                    <li className="flex gap-4 items-start p-3 border border-slate-2/10 bg-ink-2/40 rounded hover:border-neon-red/30 transition-colors">
                      <div className="flex flex-col items-center">
                        <span className="text-neon-red font-mono font-bold text-xs">03</span>
                        <div className="w-[1px] h-1 bg-neon-red/30 mt-1"></div>
                      </div>
                      <span className="text-mist text-xs leading-relaxed pt-0.5">Use the <strong className="text-white">Vector Controls</strong> on the HUD to actively modulate the intensity, frequency, or payload structure of the attack.</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-5 md:px-8 md:py-6 border-t border-slate-2/20 bg-ink flex justify-between items-center mt-auto relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-red/50 to-transparent"></div>
                
                <div className="font-mono text-[10px] text-slate-2 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> ISLP SECURE CONNECTION
                  </div>
                  <span className="text-neon-red opacity-60">UPLINK ESTABLISHED</span>
                </div>
                
                <button 
                  onClick={onClose}
                  className="group relative px-8 py-3 bg-neon-red/10 text-neon-red border border-neon-red/50 rounded text-xs font-bold uppercase tracking-widest hover:bg-neon-red hover:text-white transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 w-0 bg-neon-red transition-all duration-300 ease-out group-hover:w-full z-0"></div>
                  <span className="relative z-10">Initialize Vector</span>
                </button>
              </div>
            </div>
            
            {/* Decorative Corner Borders */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-red/50 pointer-events-none rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-red/50 pointer-events-none rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-red/50 pointer-events-none rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-red/50 pointer-events-none rounded-br-xl"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
