import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const HeroSection: React.FC<{ onLaunchSim?: () => void }> = ({ onLaunchSim }) => {
  const { scrollY } = useScroll();
  
  // Parallax for the background
  const yParallax = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <section className="relative z-10 min-h-screen flex flex-col justify-center overflow-hidden bg-ink pt-32 pb-20">
      
      {/* 1. Base Dark Background */}
      <div className="absolute inset-0 bg-[#06080d] z-0" />

      {/* 2. Background Glow & Grid */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: yParallax }}
      >
        {/* Subtle Vertical & Horizontal Grid Lines (Brighter as requested) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,42,77,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,42,77,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
        
        {/* Massive Bottom Radiance Glow */}
        <div className="absolute bottom-0 left-1/2 w-[1200px] h-[600px] -translate-x-1/2 translate-y-1/2 bg-neon-red/20 rounded-full blur-[140px] pointer-events-none" />

        {/* Concentric Arcs at the bottom */}
        <div className="absolute bottom-[-20%] left-1/2 w-[150%] aspect-square -translate-x-1/2 rounded-full border-[1px] border-neon-red/20 pointer-events-none" />
        <div className="absolute bottom-[-30%] left-1/2 w-[120%] aspect-square -translate-x-1/2 rounded-full border-[1px] border-neon-red/30 pointer-events-none" />
        <div className="absolute bottom-[-40%] left-1/2 w-[90%] aspect-square -translate-x-1/2 rounded-full border-[1px] border-neon-red/40 pointer-events-none" />
      </motion.div>



      {/* Foreground Content Wrapper */}
      <div className="relative z-20 max-w-[1400px] w-full mx-auto px-6 lg:px-12 flex flex-col pt-10">
        
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-8 w-full">
          {/* LEFT CONTENT (Title) */}
          <div className="flex-1 max-w-[700px]">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="font-syne text-5xl md:text-[clamp(60px,7vw,96px)] font-bold leading-[1.05] tracking-tight text-ghost mb-6 md:mb-8 flex flex-col"
            >
              <div className="flex items-center gap-3 md:gap-6">
                <span>Threat</span>
                {/* Shield Icon mimicking the Figma design */}
                <svg className="w-10 h-10 md:w-20 md:h-20 text-neon-red opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M12 8v4"/>
                  <path d="M12 16h.01"/>
                </svg>
              </div>
              <span>Intelligence</span>
              <span className="text-mist">Networks</span>
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex items-center gap-4 text-mist font-inter text-sm md:text-base"
            >
              <div className="w-12 h-[1px] bg-neon-red" />
              <span>Designed for IoT Attack Simulation</span>
            </motion.div>
          </div>

          {/* RIGHT CONTENT (Desc + Stats) */}
          <div className="flex-1 lg:max-w-[500px] flex flex-col justify-center pt-4 lg:pt-12">
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="text-mist text-base md:text-lg leading-relaxed mb-12 font-inter"
            >
              Protecting your edge devices should be straightforward. Our platform provides top-tier simulation features, making network defense simple and accessible for everyone.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              className="flex gap-12 md:gap-20"
            >
              <div>
                <div className="text-4xl md:text-5xl font-syne text-ghost mb-2">17</div>
                <div className="text-sm font-inter text-mist/70">Attack Vectors</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-syne text-ghost mb-2">40k+</div>
                <div className="text-sm font-inter text-mist/70">Simulated Nodes</div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
              className="mt-12"
            >
              <button 
                onClick={onLaunchSim}
                className="px-8 py-4 bg-neon-red/10 border border-neon-red/50 hover:bg-neon-red text-ghost hover:text-ink font-mono text-sm font-bold tracking-widest uppercase transition-all duration-300 rounded-full"
              >
                Launch SimLabs
              </button>
            </motion.div>
          </div>
        </div>

      </div>

      {/* Footer Data / Ticker Area */}
      <div className="absolute bottom-10 left-0 w-full px-6 md:px-12 z-20">
        <div className="border-t border-neon-red/20 pt-6 flex justify-between items-center text-[10px] md:text-xs font-mono text-mist/60 tracking-[0.2em] uppercase">
          <span>Intrusion Detection</span>
          <span className="hidden md:block text-neon-red/80 font-bold tracking-[0.3em] glow-sm">Network Integrity</span>
          <span>End-To-End Encryption</span>
        </div>
      </div>

    </section>
  );
}
