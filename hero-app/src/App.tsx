import { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { LandingSections } from './components/LandingSections';
import { DashboardUI } from './components/DashboardUI';
import { Loader } from './components/Loader';
import { TransitionOwl } from './components/TransitionOwl';
import { AttackInfoModal } from './components/AttackInfoModal';
import { CustomCursor } from './components/CustomCursor';

function App() {
  const [appReady, setAppReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetAttackId, setTargetAttackId] = useState<number | null>(null);
  const [currentDashboardAttackId, setCurrentDashboardAttackId] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  // Optional React state for header visibility, though manual DOM toggle is safer for canvases
  const [inDashboard, setInDashboard] = useState(false);

  // Expose a callback so legacy app.js can sync the active attack into React state
  React.useEffect(() => {
    (window as any).__setReactAttackId = (id: number) => setCurrentDashboardAttackId(id);
    return () => { delete (window as any).__setReactAttackId; };
  }, []);

  const handleLaunchSim = (attackId: number) => {
    setTargetAttackId(attackId);
    setIsTransitioning(true);
    // Play UI sound
    const audio = new Audio('/legacy/assets/click.wav');
    audio.volume = 0.2;
    audio.play().catch(e => console.log('Audio blocked', e));
  };

  const prepareLaunchSim = () => {
    setInDashboard(true);
    
    // Switch attack and trigger resize after a short delay
    setTimeout(() => {
        if ((window as any).app) {
            const id = targetAttackId || 8;
            (window as any).app.switchAttack(id);
            setCurrentDashboardAttackId(id);
            if ((window as any).app.topology) (window as any).app.topology.onWindowResize();
            if ((window as any).app.charts) (window as any).app.charts.resize();
        }
    }, 100);
  };

  const completeLaunchSim = () => {
    setIsTransitioning(false);
  };

  const handleGoHome = () => {
    setInDashboard(false);
  };

  return (
    <div className="min-h-screen bg-ink text-ghost selection:bg-neon-red/30 relative">
      <CustomCursor />
      
      {!appReady && <Loader onComplete={() => setAppReady(true)} />}
      {isTransitioning && <TransitionOwl onCoverComplete={prepareLaunchSim} onComplete={completeLaunchSim} />}


      {/* Global Header */}
      <header className={`fixed top-0 left-0 w-full z-[60] flex justify-between items-center px-6 md:px-12 py-6 bg-ink/80 backdrop-blur-md border-b border-neon-red/10 ${!appReady || inDashboard ? 'hidden' : 'block'}`}>
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

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 bg-ink pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,42,77,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,42,77,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)]"></div>
         <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-neon-red/10 to-transparent"></div>
      </div>

      {/* LANDING PAGE (Hidden when dashboard is open) */}
      <div id="hero-view" className={`relative z-10 ${!appReady || inDashboard ? 'hidden' : 'block'}`}>
        <main className="flex flex-col">
          <HeroSection onLaunchSim={() => handleLaunchSim(8)} />
          <LandingSections onLaunchSim={handleLaunchSim} />
        </main>
      </div>

      {/* DASHBOARD (Mounted to preserve IDs, toggles visibility based on state) */}
      <DashboardUI isVisible={inDashboard} onGoHome={handleGoHome} onShowInfo={() => setShowInfo(true)} />

      {/* ATTACK INFO MODAL - uses currentDashboardAttackId when in dashboard, else targetAttackId */}
      <AttackInfoModal isOpen={showInfo} attackId={inDashboard ? (currentDashboardAttackId ?? targetAttackId) : targetAttackId} onClose={() => setShowInfo(false)} />
    </div>
  );
}

export default App;
