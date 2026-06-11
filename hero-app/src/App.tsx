import { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { LandingSections } from './components/LandingSections';
import { DashboardUI } from './components/DashboardUI';
import { Loader } from './components/Loader';
import { TransitionOwl } from './components/TransitionOwl';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLaunchSim = () => {
    setIsTransitioning(true);
  };

  const completeLaunchSim = () => {
    setShowDashboard(true);
    setIsTransitioning(false);
    // Give the DOM a moment to remove the 'hidden' class, then trigger a window resize
    // This is crucial for the legacy Three.js topology canvas to calculate its non-zero width/height.
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  return (
    <div className="min-h-screen bg-ink text-ghost selection:bg-neon-red/30 relative">
      
      {!appReady && <Loader onComplete={() => setAppReady(true)} />}
      {isTransitioning && <TransitionOwl onComplete={completeLaunchSim} />}

      {/* Global Header */}
      <header className={`fixed top-0 left-0 w-full z-[60] flex justify-between items-center px-6 md:px-12 py-6 bg-ink/80 backdrop-blur-md border-b border-neon-red/10 transition-all duration-500 ${!appReady || showDashboard ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'}`}>
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="ISLP Logo" className="w-8 h-8 object-contain" />
          <div className="text-xl font-bold font-syne text-ghost tracking-wide">ISLP<span className="text-neon-red hidden md:inline ml-2 text-sm font-inter text-mist font-normal tracking-normal uppercase">IoT Security Learning Platform</span></div>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-inter text-mist">
          <a href="#" className="text-ghost font-medium hover:text-neon-red transition-colors">Home</a>
          <a href="#attacks" className="hover:text-neon-red transition-colors">Attacks</a>
          <a href="#impact" className="hover:text-neon-red transition-colors">Impact</a>
          <a href="#team" className="hover:text-neon-red transition-colors">Team</a>
        </nav>
      </header>

      {/* Animated Glowing Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,42,77,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,42,77,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)]"></div>
         <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-neon-red/10 to-transparent"></div>
      </div>

      {/* LANDING PAGE (Hidden when dashboard is open) */}
      <div id="hero-view" className={`transition-opacity duration-500 relative z-10 ${showDashboard || !appReady ? 'opacity-0 h-0 overflow-hidden hidden' : 'opacity-100'}`}>
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
