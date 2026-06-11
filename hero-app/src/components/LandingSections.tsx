import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export const attacks = [
  { id: 1, layer: "Data Link", name: "Man-in-the-Middle", tldr: "Secretly standing between two devices to change their messages.", desc: "Intercepts transit frames between gateway and sensors to manipulate payloads or spoof active commands." },
  { id: 2, layer: "Physical", name: "Eavesdropping", tldr: "Listening in on invisible radio waves to steal passwords.", desc: "Sniffs raw RF carrier signals over unencrypted wireless links to capture credential hashes." },
  { id: 3, layer: "Network", name: "Replay Attack", tldr: "Recording a valid login code and using it again later to break in.", desc: "Captures valid authentication tokens and broadcasts them later to bypass hardware verification." },
  { id: 4, layer: "Data Link", name: "Spoofing Attack", tldr: "Pretending to be a trusted device by stealing its ID.", desc: "Forges MAC addresses of trusted IoT devices to gain illegal network entry." },
  { id: 5, layer: "Network", name: "Packet Injection", tldr: "Sneaking fake data packets into the network to cause chaos.", desc: "Crafts and injects malicious hex payloads into active routing queues." },
  { id: 6, layer: "Transport", name: "Denial of Service", tldr: "Overwhelming a single device with so much junk data that it crashes.", desc: "Floods the local IoT gateway router with junk request frames, causing CPU overhead." },
  { id: 7, layer: "Transport", name: "Distributed DoS", tldr: "Using a massive army of hacked devices to take down the entire network.", desc: "Inundates target router queues using multiple compromised zombie nodes." },
  { id: 8, layer: "Physical", name: "Jamming Attack", tldr: "Blasting loud radio noise so no devices can communicate.", desc: "Emits high-intensity RF carrier noise to flood the radio spectrum." },
  { id: 9, layer: "Application", name: "Credential Theft", tldr: "Stealing the master password database.", desc: "Exfiltrates password databases and device cryptographic handshakes." },
  { id: 10, layer: "Session", name: "Session Hacking", tldr: "Taking over someone's active login session while they are still logged in.", desc: "Hijacks active BLE connection states or session keys." },
  { id: 11, layer: "Physical", name: "Rogue Insertion", tldr: "Plugging an evil, unverified device directly into the network.", desc: "Injects unverified rogue hardware modules into active physical connections." },
  { id: 12, layer: "Network", name: "Routing Attack", tldr: "Messing with the GPS of the network so data gets lost or sent to the hacker.", desc: "Manipulates mesh routing tables to blackhole payloads or reroute data paths." },
  { id: 13, layer: "Network", name: "Sybil Attack", tldr: "Creating hundreds of fake clone devices to confuse the network.", desc: "Spawns multiple pseudonymous virtual clone nodes to flood mesh routing algorithms." },
  { id: 14, layer: "Presentation", name: "Sensor Tampering", tldr: "Sending fake temperature or status readings to trigger an emergency shutdown.", desc: "Injects forged telemetry data to trigger false system shutdowns." },
  { id: 15, layer: "Physical", name: "Timing Attack", tldr: "Watching how fast a computer thinks to guess its password.", desc: "Uses side-channel exfiltration to monitor microcontroller crypto execution cycles." },
  { id: 16, layer: "Physical", name: "Physical Access", tldr: "Tearing open the device and plugging wires straight into its brain.", desc: "Taps target board JTAG/UART headers to probe raw memory dumps." },
  { id: 17, layer: "Transport", name: "Delay Attack", tldr: "Holding back important messages so the system goes completely out of sync.", desc: "Holds back and buffers packet delivery times to compromise control-loop synchronization." }
];

const impacts = [
  { threat: "HIGH THREAT", title: "Physical Infrastructure Damage", desc: "Manipulated sensor telemetry and delayed commands can trigger mechanical failure in water treatment facilities, smart generators, and assembly line robots.", badgeColor: "text-red-500 border-red-500/30 bg-red-500/10" },
  { threat: "MEDIUM THREAT", title: "Confidential Data Exfiltration", desc: "Unencrypted wireless communication enables RF eavesdropping, allowing malicious actors to sniff authentication keys, usernames, and sensor tracking records.", badgeColor: "text-orange-400 border-orange-400/30 bg-orange-400/10" },
  { threat: "CRITICAL THREAT", title: "Network Failure & Spectrum Denial", desc: "Continuous RF spectrum jamming or flood-based Denial of Service renders network nodes unreachable, completely shutting down smart monitoring queues.", badgeColor: "text-neon-red border-neon-red/50 bg-neon-red/20 shadow-[0_0_15px_rgba(255,42,77,0.3)]" }
];

export const LandingSections: React.FC<{ onLaunchSim: (id: number) => void }> = ({ onLaunchSim }) => {
  return (
    <div className="w-full flex flex-col bg-ink text-ghost relative">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
           style={{ backgroundImage: 'linear-gradient(rgba(255, 42, 77, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 42, 77, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-32 w-full z-10 flex flex-col gap-32">
        
        {/* ATTACK VECTORS */}
        <motion.section id="attacks" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="flex flex-col gap-12">
          <motion.div variants={fadeUpVariant} className="flex flex-col gap-4 max-w-2xl">
            <span className="text-neon-red font-mono text-sm tracking-widest uppercase">// Attack Surface</span>
            <h2 className="text-4xl md:text-5xl font-syne font-bold text-white leading-tight">17 OSI-Aligned<br/>IoT Attack Vectors</h2>
            <p className="text-mist text-lg leading-relaxed">Comprehensive simulations categorized across the OSI model layers. Analyze and execute attacks directly in the browser sandbox.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {attacks.map((atk) => (
              <motion.div key={atk.id} variants={fadeUpVariant} className="group relative bg-ink-2 border border-slate-2/30 rounded-xl p-6 hover:border-neon-red/50 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-3xl font-syne font-bold text-slate-2/50 group-hover:text-neon-red/30 transition-colors">
                      {atk.id.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest uppercase border border-slate-2/50 px-2 py-1 rounded text-mist group-hover:border-neon-red/30 group-hover:text-neon-red transition-colors">
                      {atk.layer}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 font-syne">{atk.name}</h3>
                  <p className="text-mist text-sm leading-relaxed mb-8 flex-grow">{atk.desc}</p>
                  
                  <button onClick={() => onLaunchSim(atk.id)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neon-red hover:text-white transition-colors group/btn w-fit" data-attack-id={atk.id}>
                    Simulate <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* IMPACT MATRIX */}
        <motion.section id="impact" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="flex flex-col gap-12">
          <motion.div variants={fadeUpVariant} className="flex flex-col gap-4 text-center items-center">
            <span className="text-neon-red font-mono text-sm tracking-widest uppercase">// Impact Matrix</span>
            <h2 className="text-4xl md:text-5xl font-syne font-bold text-white leading-tight">Security impact<br/>in the real world</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 items-stretch">
            {impacts.map((impact, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="bg-ink-2/50 border border-slate-2/20 p-8 rounded-xl backdrop-blur-sm flex flex-col gap-4 relative overflow-hidden h-full">
                <div className={`absolute top-0 left-0 w-full h-1 ${impact.badgeColor.includes('neon') ? 'bg-neon-red shadow-[0_0_10px_#ff2a4d]' : 'bg-slate-2'}`}></div>
                <span className={`text-[10px] font-bold tracking-widest uppercase border rounded px-2 py-1 w-fit ${impact.badgeColor}`}>
                  {impact.threat}
                </span>
                <h3 className="text-2xl font-bold text-white font-syne mt-2 flex-grow-0">{impact.title}</h3>
                <p className="text-mist text-sm leading-relaxed flex-grow">{impact.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* TEAM & MENTORS */}
        <motion.section id="team" initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.01 }} variants={staggerContainer} className="flex flex-col gap-16 pt-24 mt-8 border-t border-neon-red/20">

          {/* Section header */}
          <motion.div variants={fadeUpVariant} className="flex flex-col gap-4 items-center text-center">
            <span className="text-neon-red font-mono text-xs tracking-[0.3em] uppercase border border-neon-red/30 px-4 py-1 rounded-full">// Team & Mentors</span>
            <h2 className="text-4xl md:text-5xl font-syne font-bold text-white">Built at <span className="text-neon-red">CSD</span>,<br/>NITK Surathkal</h2>
            <p className="text-mist text-sm max-w-md">Research, hardware, and software — forged together at the Computer Science & Engineering Dept.</p>
          </motion.div>

          {/* Supervisor + Mentor Row */}
          <motion.div variants={fadeUpVariant} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Supervisor Card */}
            <a href="https://www.linkedin.com/in/kvganga/" target="_blank" rel="noopener noreferrer"
              className="group relative flex items-center gap-6 p-6 bg-ink-2/60 border border-slate-2/30 rounded-xl hover:border-mist/60 transition-all duration-300 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-2/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-16 h-16 rounded-xl bg-ink-2 border border-slate-2/50 flex items-center justify-center font-bold text-mist text-sm font-mono shrink-0">SUP</div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-mist uppercase tracking-widest font-mono">Project Supervisor</span>
                <h4 className="text-white font-syne font-bold text-lg group-hover:text-neon-red transition-colors">Dr. K. V. Gangadharan</h4>
                <span className="text-mist text-xs">Professor & Advisor, CSD — NITK</span>
              </div>
              <svg className="ml-auto text-mist group-hover:text-neon-red transition-colors shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>

            {/* Mentor Card */}
            <a href="https://www.linkedin.com/in/alisha-joy25a/" target="_blank" rel="noopener noreferrer"
              className="group relative flex items-center gap-6 p-6 bg-ink-2/60 border border-slate-2/30 rounded-xl hover:border-mist/60 transition-all duration-300 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-2/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-16 h-16 rounded-xl bg-ink-2 border border-slate-2/50 flex items-center justify-center font-bold text-mist text-sm font-mono shrink-0">MNT</div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-mist uppercase tracking-widest font-mono">Project Mentor</span>
                <h4 className="text-white font-syne font-bold text-lg group-hover:text-neon-red transition-colors">Alisha A Joy</h4>
                <span className="text-mist text-xs">Project Mentor — NITK</span>
              </div>
              <svg className="ml-auto text-mist group-hover:text-neon-red transition-colors shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>

          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-neon-red/10"></div>
            <span className="text-mist font-mono text-xs tracking-widest uppercase">Core Development</span>
            <div className="flex-1 h-px bg-neon-red/10"></div>
          </div>

          {/* Dev Cards Row */}
          <motion.div variants={fadeUpVariant} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Dev 1 */}
            <a href="https://www.linkedin.com/in/rudranarayan18" target="_blank" rel="noopener noreferrer"
              className="group relative flex items-center gap-6 p-6 bg-ink-2/60 border border-neon-red/20 rounded-xl hover:border-neon-red/60 hover:shadow-[0_0_24px_rgba(255,42,77,0.12)] transition-all duration-300 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-16 h-16 rounded-xl bg-neon-red/10 border border-neon-red/30 flex items-center justify-center font-bold text-neon-red text-sm font-mono shrink-0">DEV</div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-neon-red/70 uppercase tracking-widest font-mono">Lead Developer</span>
                <h4 className="text-white font-syne font-bold text-lg group-hover:text-neon-red transition-colors">Rudranarayan</h4>
                <span className="text-mist text-xs">Hardware & Digital Twin Engineering</span>
              </div>
              <svg className="ml-auto text-neon-red/40 group-hover:text-neon-red transition-colors shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>

            {/* Dev 2 */}
            <a href="https://www.linkedin.com/in/krishnendu-prasanth" target="_blank" rel="noopener noreferrer"
              className="group relative flex items-center gap-6 p-6 bg-ink-2/60 border border-neon-red/20 rounded-xl hover:border-neon-red/60 hover:shadow-[0_0_24px_rgba(255,42,77,0.12)] transition-all duration-300 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-16 h-16 rounded-xl bg-neon-red/10 border border-neon-red/30 flex items-center justify-center font-bold text-neon-red text-sm font-mono shrink-0">DEV</div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-neon-red/70 uppercase tracking-widest font-mono">Lead Developer</span>
                <h4 className="text-white font-syne font-bold text-lg group-hover:text-neon-red transition-colors">Krishnendu Prasanth</h4>
                <span className="text-mist text-xs">Interactive WebGL & Web Development</span>
              </div>
              <svg className="ml-auto text-neon-red/40 group-hover:text-neon-red transition-colors shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>

          </motion.div>

        </motion.section>

      </div>
    </div>
  );
};
