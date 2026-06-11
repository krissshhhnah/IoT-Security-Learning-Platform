import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Loader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(onComplete, 500); // give time for exit animation
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,42,77,0.15)_0%,transparent_50%)] animate-pulse" />
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Logo Image */}
            <motion.img 
              src="/assets/logo.png" 
              alt="ISLP Logo"
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,42,77,0.8)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            
            {/* Orbital Rings */}
            <motion.div 
              className="absolute inset-0 border border-neon-red/30 rounded-full"
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-[-10px] border border-t-neon-red/50 border-transparent rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="mt-8 font-mono text-neon-red tracking-widest text-sm uppercase glow-sm"
          >
            Initializing ISLP...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
