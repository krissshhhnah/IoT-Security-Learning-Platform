import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const TransitionOwl: React.FC<{ onCoverComplete: () => void, onComplete: () => void }> = ({ onCoverComplete, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Wait a tiny bit then call onComplete
        setTimeout(onComplete, 300);
      }
    });

    // Initial state: instantly cover screen with background
    gsap.set(containerRef.current, { opacity: 1 });
    gsap.set(imgRef.current, { scale: 0.5, opacity: 0, y: 20 });
    gsap.set(textRef.current, { opacity: 0, y: 10 });
    
    // Let dashboard mount behind the cover immediately
    setTimeout(onCoverComplete, 10);
    
    // Fast, snappy animation sequence
    tl.to(imgRef.current, { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" })
      .to(textRef.current, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, "-=0.1")
      // quick glitch pulse
      .to(imgRef.current, { 
        filter: "drop-shadow(0 0 40px rgba(255, 42, 77, 1))", 
        scale: 1.1,
        duration: 0.08, 
        yoyo: true, 
        repeat: 3 
      })
      // No fade out for the container - just wait a tiny bit then unmount instantly for a hard cut
      .to(containerRef.current, { duration: 0.1 });

    return () => {
      tl.kill();
    };
  }, [onCoverComplete, onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,42,77,0.2)_0%,transparent_60%)]" />
      
      <div className="relative w-48 h-48 flex items-center justify-center">
        <img 
          ref={imgRef}
          src="/assets/logo.png"
          alt="ISLP Logo"
          className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,42,77,0.5)]"
        />
      </div>

      <div ref={textRef} className="mt-8 font-mono text-neon-red tracking-widest text-lg font-bold uppercase drop-shadow-[0_0_8px_rgba(255,42,77,0.8)]">
        SimLabs
      </div>
      <div className="mt-2 text-xs text-mist font-mono animate-pulse">
        Deploying Attack Vectors...
      </div>
    </div>
  );
};
