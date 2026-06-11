import React, { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { LandingSections } from './components/LandingSections';
import { DashboardUI } from './components/DashboardUI';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  const handleLaunchSim = () => {
    setShowDashboard(true);
    // Give the DOM a moment to remove the 'hidden' class, then trigger a window resize
    // This is crucial for the legacy Three.js topology canvas to calculate its non-zero width/height.
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  return (
    <div className="min-h-screen bg-ink text-ghost selection:bg-neon-red/30 relative">
      
      {/* Animated Glowing Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,42,77,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,42,77,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)]"></div>
         <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-neon-red/10 to-transparent"></div>
      </div>

      {/* LANDING PAGE (Hidden when dashboard is open) */}
      <div id="hero-view" className={`transition-opacity duration-500 relative z-10 ${showDashboard ? 'opacity-0 h-0 overflow-hidden hidden' : 'opacity-100'}`}>
        <main className="flex flex-col">
          <HeroSection onLaunchSim={handleLaunchSim} />
          <LandingSections onLaunchSim={handleLaunchSim} />
        </main>
      </div>

      {/* DASHBOARD (Mounted to preserve IDs, toggles visibility based on state) */}
      <DashboardUI isVisible={showDashboard} onGoHome={() => setShowDashboard(false)} />
    </div>
  );
}

export default App;
