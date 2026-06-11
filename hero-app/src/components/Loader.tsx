import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const Loader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Hard cut out after sequence completes
        gsap.to(containerRef.current, { opacity: 0, duration: 0.3, onComplete });
      }
    });

    // Initial setup
    gsap.set(logoRef.current, { scale: 0.7, opacity: 0, filter: 'blur(10px)' });
    gsap.set(textRef.current, { opacity: 0, y: 10 });
    gsap.set(ringsRef.current, { scale: 0.8, opacity: 0 });
    gsap.set(barRef.current, { width: "0%" });

    const dummyProgress = { val: 0 };

    tl.to(logoRef.current, {
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: "power3.out"
      })
      .to(ringsRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.5)"
      }, "-=0.5")
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4
      }, "-=0.3")
      // Fast fake progress
      .to(dummyProgress, {
        val: 100,
        duration: 1.2,
        ease: "power1.inOut",
        onUpdate: () => {
          if (progressRef.current && barRef.current) {
            const p = Math.floor(dummyProgress.val);
            progressRef.current.innerText = `BOOT SEQUENCE: ${p}%`;
            barRef.current.style.width = `${p}%`;
          }
        }
      })
      // Glitch effect on logo when hitting 100%
      .to(logoRef.current, {
        x: () => Math.random() * 10 - 5,
        y: () => Math.random() * 10 - 5,
        scale: 1.05,
        filter: "drop-shadow(0 0 30px rgba(255, 42, 77, 1)) hue-rotate(90deg)",
        duration: 0.05,
        yoyo: true,
        repeat: 5
      })
      .to(logoRef.current, {
        x: 0,
        y: 0,
        scale: 1,
        filter: "drop-shadow(0 0 15px rgba(255, 42, 77, 0.8)) hue-rotate(0deg)",
        duration: 0.1
      })
      .add(() => {
        if (progressRef.current) progressRef.current.innerText = "SYSTEM SECURE";
        if (progressRef.current) progressRef.current.classList.add("text-emerald-400");
      })
      // Hold for a beat
      .to({}, { duration: 0.4 });

    // Infinite rotation for rings
    gsap.to(ringsRef.current, {
      rotate: 360,
      duration: 8,
      repeat: -1,
      ease: "linear"
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(ringsRef.current);
    };
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[200] bg-ink flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,42,77,0.15)_0%,transparent_50%)] animate-pulse" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,42,77,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,42,77,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        {/* Logo Image */}
        <img 
          ref={logoRef}
          src="/assets/logo.png" 
          alt="ISLP Logo"
          className="w-full h-full object-contain relative z-10"
        />
        
        {/* Orbital Rings */}
        <div ref={ringsRef} className="absolute inset-[-20px] z-0">
          <div className="absolute inset-0 border border-neon-red/20 rounded-full border-t-neon-red/60" />
          <div className="absolute inset-[10px] border border-neon-red/10 rounded-full border-b-neon-red/40" style={{ transform: 'rotate(45deg)' }} />
          <div className="absolute inset-[20px] border border-dashed border-neon-red/20 rounded-full" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-3 w-64">
        <div ref={textRef} className="font-mono text-neon-red tracking-widest text-sm uppercase font-bold text-center glow-sm">
          ISLP KERNEL INITIALIZING
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full bg-ink-2 border border-neon-red/30 p-1 rounded">
          <div ref={barRef} className="h-1 bg-neon-red w-0 shadow-[0_0_10px_rgba(255,42,77,0.8)]" />
        </div>
        
        <div ref={progressRef} className="font-mono text-[10px] text-slate-2 tracking-widest uppercase">
          BOOT SEQUENCE: 0%
        </div>
      </div>
    </div>
  );
};
