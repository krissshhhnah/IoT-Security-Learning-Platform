/**
 * Cybersecurity Testbed Attack Simulator Engine
 * Encapsulates definitions, simulation rules, telemetry models, and logs for the 17 attacks.
 */

export const ATTACKS = {
    1: {
        id: 1,
        name: "Man-in-the-Middle (MitM)",
        layer: "Link & Network",
        explanation: "A Man-in-the-Middle (MitM) attack occurs when a rogue actor intercepts, alters, or drops communication between two legitimate endpoints without their knowledge. In wireless networks, this is often achieved by forcing nodes to disconnect from their legitimate peer and reconnect to a malicious node masquerading as the target routing partner.",
        simInstructions: "Enter a custom payload in the input panel and click 'LAUNCH EXPLOIT' or type to see the attacker intercept and modify it mid-transit in 3D.",
        defaultControls: `
            <div class="control-item">
                <label>INTERCEPTED PAYLOAD</label>
                <input type="text" id="ctrl-mitm-payload" class="input-cyber" value="TX_DATA: TEMP=24.5C">
            </div>
            <div class="control-item">
                <label>MODIFIED BY ATTACKER</label>
                <input type="text" id="ctrl-mitm-mod" class="input-cyber" value="TX_DATA: TEMP=99.9C">
            </div>
        `,
        getDefaultTelemetry: () => ({ cpu: 12, heap: 280, rssi: -58, latency: 4 }),
        generateLog: (state, controls) => {
            const original = controls.mitmPayload || "TX_DATA: TEMP=24.5C";
            const modified = controls.mitmMod || "TX_DATA: TEMP=99.9C";
            return [
                { type: "info", text: `[ESP-NOW] Packet captured from Node A (MAC: 24:6F:28:1A:3B:10) -> Gateway B` },
                { type: "alert", text: `[ATTACKER] Intercepted payload: "${original}"` },
                { type: "success", text: `[ATTACKER] Injecting altered payload to Gateway B: "${modified}"` },
                { type: "error", text: `[GATEWAY B] Warning: Processing altered state command!` }
            ];
        }
    },
    2: {
        id: 2,
        name: "Eavesdropping",
        layer: "Link & Network",
        explanation: "Eavesdropping is a passive attack where an unauthorized party sniffs unencrypted wireless traffic. Because radio frequencies are a shared medium, any device within range operating in promiscuous mode can capture raw frames, compromising confidentiality without disrupting operations.",
        simInstructions: "Observe the glowing radio wave expanding from Node A. The Attacker sniffed the confidential telemetry key.",
        defaultControls: `
            <div class="control-item">
                <label>TARGET RF CHANNEL</label>
                <select class="input-cyber" id="ctrl-eaves-channel">
                    <option value="1">Channel 1 (2412 MHz)</option>
                    <option value="6">Channel 6 (2437 MHz)</option>
                    <option value="11">Channel 11 (2462 MHz)</option>
                </select>
            </div>
            <div class="control-item">
                <label>DECRYPTION STATUS</label>
                <span class="mono-text" style="color: var(--color-success)">SNIFFING PROMISCUOUS MODE...</span>
            </div>
        `,
        getDefaultTelemetry: () => ({ cpu: 8, heap: 290, rssi: -52, latency: 3 }),
        generateLog: (state) => {
            const keys = ["AES_SEC_KEY: 0x9F82A", "WIFI_PSK: TataMotors2026", "AUTH_TOKEN: 48f98c21a"];
            const selectedKey = keys[Math.floor(Date.now() / 2000) % keys.length];
            return [
                { type: "info", text: `[SNIFFER] promiscuous_on: Listening on 2.4GHz channel...` },
                { type: "success", text: `[SNIFFER] Captured 802.11 Frame (CRC OK): RSSI=-55dBm` },
                { type: "alert", text: `[EXFIL] Extracted Payload: "${selectedKey}"` }
            ];
        }
    },
    3: {
        id: 3,
        name: "Replay Attack",
        layer: "Link & Network",
        explanation: "A Replay Attack involves capturing valid data packets sent across the network and retransmitting them at a later time to produce an unauthorized effect. Because the packet contains genuine credentials or command structures, the receiver executes it unless protected by cryptographic nonces or timestamps.",
        simInstructions: "Watch the attacker capture Node A's gateway authorization packet, buffer it, and transmit it later after Node A is inactive.",
        defaultControls: `
            <div class="control-item">
                <label>REPLAY DELAY (SECONDS)</label>
                <input type="range" id="ctrl-replay-delay" class="slider-cyber" min="1" max="10" value="5">
                <span id="ctrl-replay-delay-val">5s</span>
            </div>
        `,
        getDefaultTelemetry: () => ({ cpu: 14, heap: 275, rssi: -60, latency: 250 }),
        generateLog: (state, controls) => {
            const delay = controls.replayDelay || 5;
            return [
                { type: "info", text: `[BUFFER] Intercepted authentication token packet at T=0ms` },
                { type: "info", text: `[BUFFER] Saved auth payload: {cmd: "OPEN_GATE_3", seq: 1042}` },
                { type: "alert", text: `[ATTACKER] Retransmitting cached auth payload after ${delay}s delay...` },
                { type: "error", text: `[GATEWAY B] Alert: Replay attack detected! Timestamp delta threshold exceeded.` }
            ];
        }
    },
    4: {
        id: 4,
        name: "Spoofing Attack",
        layer: "Link & Network",
        explanation: "Spoofing occurs when an attacker masquerades as a trusted node by counterfeiting identifying characteristics, such as a MAC address in ESP-NOW or a Device UUID in BLE. This tricks target nodes into executing unauthenticated commands.",
        simInstructions: "Observe the attacker node change its reported MAC to Node A's address, forcing Node B to accept its commands.",
        defaultControls: `
            <div class="control-item">
                <label>SPOOFED IDENTITY (MAC)</label>
                <input type="text" class="input-cyber" id="ctrl-spoof-mac" value="24:6F:28:1A:3B:10 (Node A)">
            </div>
        `,
        getDefaultTelemetry: () => ({ cpu: 10, heap: 288, rssi: -50, latency: 4 }),
        generateLog: (state, controls) => {
            const mac = controls.spoofMac || "24:6F:28:1A:3B:10";
            return [
                { type: "info", text: `[ATTACKER] Overwriting hardware MAC address register...` },
                { type: "alert", text: `[SPOOF] Custom identity active: MAC=${mac}` },
                { type: "success", text: `[ESP-NOW] Send pairing request to Node B pretending to be A...` },
                { type: "error", text: `[NODE B] Handshake established. Connected to spoofed Node A.` }
            ];
        }
    },
    5: {
        id: 5,
        name: "Packet Injection",
        layer: "Link & Network",
        explanation: "Packet Injection involves crafting and transmitting arbitrary data frames directly into the wireless medium to force specific responses. Attackers use this to bypass application logic, trigger unearned state changes, or probe vulnerabilities.",
        simInstructions: "Type custom hexadecimal frames in the input console and hit Inject to send raw packets to Gateway B.",
        defaultControls: `
            <div class="control-item">
                <label>HEX FRAME DATA</label>
                <input type="text" class="input-cyber" id="ctrl-inject-hex" value="0x15 0xFF 0x0A 0x8D 0x3E">
            </div>
        `,
        getDefaultTelemetry: () => ({ cpu: 18, heap: 260, rssi: -55, latency: 15 }),
        generateLog: (state, controls) => {
            const hex = controls.injectHex || "0x15 0xFF 0x0A 0x8D 0x3E";
            return [
                { type: "info", text: `[INJECTOR] Framing Raw IEEE 802.11 Control Frame...` },
                { type: "alert", text: `[INJECTOR] Broadcasting raw bytes: [${hex}]` },
                { type: "error", text: `[NODE B] CRC mismatch/Invalid packet sequence injected!` }
            ];
        }
    },
    6: {
        id: 6,
        name: "Denial of Service (DoS)",
        layer: "Link & Network",
        explanation: "A Denial of Service (DoS) attack targets a single node to exhaust its processing capability, memory, or transceiver availability. By flooding a target ESP32 with continuous unauthenticated requests, the node becomes unable to process legitimate tasks.",
        simInstructions: "A high-speed flood of red packets overwhelms Node B. Notice CPU spiking to 100% and free heap memory dropping dramatically.",
        defaultControls: `
            <div class="control-item">
                <label>FLOOD RATE (PACKETS/SEC)</label>
                <input type="range" class="slider-cyber" id="ctrl-dos-rate" min="50" max="1000" value="500">
                <span id="ctrl-dos-rate-val">500 pps</span>
            </div>
        `,
        getDefaultTelemetry: (ticks) => {
            const rate = window.simControls?.dosRate || 500;
            const cpu = Math.min(100, Math.floor(15 + (rate / 10) + Math.random() * 5));
            const heap = Math.max(12, Math.floor(290 - (rate / 4) - Math.random() * 8));
            return { cpu, heap, rssi: -82, latency: 1200 };
        },
        generateLog: (state, controls) => {
            const rate = controls.dosRate || 500;
            return [
                { type: "alert", text: `[DoS ATTACK] Sending flood of ESP-NOW connection frames at ${rate} pps...` },
                { type: "error", text: `[TARGET ESP32] Warning: Heap allocation failed (Out of memory).` },
                { type: "error", text: `[TARGET ESP32] WDT Reset threat! Task Scheduler starving.` }
            ];
        }
    },
    7: {
        id: 7,
        name: "Distributed DoS (DDoS)",
        layer: "Link & Network",
        explanation: "Distributed Denial of Service (DDoS) leverages multiple compromised nodes (a botnet) to simultaneously inundate a target device or gateway. The distributed nature makes filtering based on a single origin address impossible.",
        simInstructions: "Multiple compromised bot nodes turn red and flood the aggregator Node B in the Three.js viewport.",
        defaultControls: `
            <div class="control-item">
                <label>BOTNET SIZE (NODES)</label>
                <input type="range" class="slider-cyber" id="ctrl-ddos-bots" min="3" max="15" value="6">
                <span id="ctrl-ddos-bots-val">6 bots</span>
            </div>
        `,
        getDefaultTelemetry: (ticks) => {
            const bots = window.simControls?.ddosBots || 6;
            const cpu = Math.min(100, Math.floor(25 + bots * 12));
            const heap = Math.max(8, Math.floor(290 - bots * 30));
            return { cpu, heap, rssi: -88, latency: 2500 };
        },
        generateLog: (state, controls) => {
            const bots = controls.ddosBots || 6;
            return [
                { type: "alert", text: `[DDoS] Inundation active. ${bots} bot nodes synchronized.` },
                { type: "error", text: `[AGGR B] High congestion alert. Dropping packets from unregistered paths.` },
                { type: "error", text: `[AGGR B] Thread queue exhausted. CPU load critical.` }
            ];
        }
    },
    8: {
        id: 8,
        name: "Jamming Attack",
        layer: "Physical Layer",
        explanation: "Jamming is a physical-layer attack that overwhelms the physical medium with continuous radio frequency noise on the target operational channel. This drops the Signal-to-Interference-plus-Noise Ratio (SINR), preventing packet demodulation.",
        simInstructions: "Observe the static noise dome surrounding the nodes. Packet delivery success crashes and RSSI dives into unreadable ranges.",
        defaultControls: `
            <div class="control-item">
                <label>RF NOISE POWER (dBm)</label>
                <input type="range" class="slider-cyber" id="ctrl-jam-power" min="-120" max="0" value="-30">
                <span id="ctrl-jam-power-val">-30 dBm</span>
            </div>
        `,
        getDefaultTelemetry: (ticks) => {
            const power = window.simControls?.jamPower || -30;
            // Higher noise power (closer to 0) drops RSSI and delivery rates
            const rssi = Math.floor(power - Math.random() * 5);
            return { cpu: 8, heap: 295, rssi, latency: 9999 };
        },
        generateLog: (state, controls) => {
            const power = controls.jamPower || -30;
            return [
                { type: "alert", text: `[JAMMING] Emitting continuous wave (CW) RF carrier noise: Power=${power}dBm` },
                { type: "error", text: `[NODE B] CRC Frame Errors rising! Packet delivery rate: 0.0%` },
                { type: "info", text: `[PHY] RSSI degraded past demodulation limits.` }
            ];
        }
    },
    9: {
        id: 9,
        name: "Credential Theft",
        layer: "Session & Application",
        explanation: "Credential Theft involves extracting secret keys, passwords, or authentication tokens from network communications or insecure local storage. In embedded setups, this targets plaintext transmission vectors or exposed firmware access points.",
        simInstructions: "Watch the handshake pairing trigger. The attacker intercepts the exchange and populates the Stolen Credentials Database.",
        defaultControls: `
            <div class="control-item">
                <label>EXTRACTED WIFI PSK</label>
                <span id="ctrl-cred-wifi" class="mono-text" style="color: var(--color-primary)">TATA_PROD_IoT_2.4G</span>
            </div>
            <div class="control-item">
                <label>EXFILTRATED PASSWORD</label>
                <span id="ctrl-cred-pass" class="mono-text" style="color: var(--color-alert)">[EXTRACTING...]</span>
            </div>
        `,
        getDefaultTelemetry: () => ({ cpu: 9, heap: 291, rssi: -54, latency: 4 }),
        generateLog: (state) => {
            return [
                { type: "info", text: `[SNIFFER] Captured BLE pairing auth request.` },
                { type: "alert", text: `[DECRYPT] Cracking key exchange frames...` },
                { type: "success", text: `[STOLEN_DB] New Entry added: MAC=24:6F:28:1A:3B:10, PSK=TataMotorsSafeSec2026` }
            ];
        }
    },
    10: {
        id: 10,
        name: "Session Hacking",
        layer: "Session & Application",
        explanation: "Session Hacking occurs when an attacker takes over an active, authenticated communication session. By monitoring connection parameters, the attacker waits for authentication, knocks the legitimate client offline, and assumes the session state.",
        simInstructions: "A secure blue link connects A and B. Click launch: the attacker knocks A offline and anchors the connection directly.",
        defaultControls: `
            <div class="control-item">
                <label>ACTIVE CONN HANDLE</label>
                <span id="ctrl-session-handle" class="mono-text" style="color: var(--color-success)">0x00A4 (SECURE)</span>
            </div>
        `,
        getDefaultTelemetry: () => ({ cpu: 11, heap: 284, rssi: -62, latency: 12 }),
        generateLog: (state) => {
            return [
                { type: "alert", text: `[SESSION] Sending spoofed BLE L2CAP disconnect frame to Node A...` },
                { type: "info", text: `[SESSION] Hijacking Connection Handle 0x00A4...` },
                { type: "success", text: `[SESSION] Legitimate client offline. Attacker registered as Active Node.` }
            ];
        }
    },
    11: {
        id: 11,
        name: "Rogue Node Insertion",
        layer: "Link & Network",
        explanation: "Rogue Node Insertion involves physically or logically introducing an unauthorized microcontroller into the network. This node mimics the network's behavior to participate in routing, inject false telemetry, or capture configurations.",
        simInstructions: "A new rogue node (colored amber) blinks onto the spatial map and injects corrupt metrics into the system topology.",
        defaultControls: `
            <div class="control-item">
                <label>ROGUE MAC ADDRESS</label>
                <input type="text" class="input-cyber" id="ctrl-rogue-mac" value="3C:61:05:44:A2:D8">
            </div>
        `,
        getDefaultTelemetry: () => ({ cpu: 9, heap: 290, rssi: -65, latency: 10 }),
        generateLog: (state, controls) => {
            const mac = controls.rogueMac || "3C:61:05:44:A2:D8";
            return [
                { type: "alert", text: `[DISCOVERY] New ESP32 node announcing mesh membership: MAC=${mac}` },
                { type: "error", text: `[GATEWAY B] Security warning: Unauthenticated MAC detected in network grid!` },
                { type: "alert", text: `[ROGUE] Injecting fluctuating dummy metrics: [HUMIDITY=120% (ERROR)]` }
            ];
        }
    },
    12: {
        id: 12,
        name: "Routing Attack",
        layer: "Link & Network",
        explanation: "Routing Attacks manipulate the logical path data takes through a multi-hop mesh network. Examples include Sinkholes (where a node falsely advertises an optimal path) or Blackholes (silently dropping routed packets).",
        simInstructions: "Watch the normal grid routing path bend and route exclusively through the Attacker node.",
        defaultControls: `
            <div class="control-item">
                <label>ROUTING ANOMALY</label>
                <select class="input-cyber" id="ctrl-route-type">
                    <option value="sinkhole">Sinkhole (Reroute Traffic)</option>
                    <option value="blackhole">Blackhole (Reroute & Drop)</option>
                </select>
            </div>
        `,
        getDefaultTelemetry: () => ({ cpu: 13, heap: 278, rssi: -59, latency: 45 }),
        generateLog: (state, controls) => {
            const rType = controls.routeType || "sinkhole";
            if (rType === "sinkhole") {
                return [
                    { type: "info", text: `[ROUTING] Advertising optimal routing weight metric metric_cost=0` },
                    { type: "alert", text: `[SINKHOLE] Route recalculation: 4 nodes routed path through Attacker!` },
                    { type: "success", text: `[ATTACKER] Intercepted mesh routing data successfully.` }
                ];
            } else {
                return [
                    { type: "info", text: `[ROUTING] Rerouting all mesh data through Attacker...` },
                    { type: "error", text: `[BLACKHOLE] Dropping all intercepted frames. Data delivery crashed.` }
                ];
            }
        }
    },
    13: {
        id: 13,
        name: "Sybil Attack",
        layer: "Link & Network",
        explanation: "In a Sybil attack, a single physical malicious node claims a vast multitude of pseudonymous identities simultaneously. This distorts the network's perception of topology, corrupts voting mechanisms, and disrupts data routing.",
        simInstructions: "The Attacker node spawns dozens of ghost icons around it on the 3D map, all reporting identical signal strength.",
        defaultControls: `
            <div class="control-item">
                <label>GHOST IDS GENERATED</label>
                <input type="range" class="slider-cyber" id="ctrl-sybil-ghosts" min="5" max="30" value="15">
                <span id="ctrl-sybil-ghosts-val">15 nodes</span>
            </div>
        `,
        getDefaultTelemetry: () => ({ cpu: 20, heap: 255, rssi: -65, latency: 15 }),
        generateLog: (state, controls) => {
            const count = controls.sybilGhosts || 15;
            return [
                { type: "alert", text: `[SYBIL DETECTED] Receiving packets from ${count} distinct MAC addresses.` },
                { type: "error", text: `[IDS] Diagnostic Flag: All ${count} nodes show IDENTICAL signal RSSI (-65dBm).` },
                { type: "error", text: `[IDS] Sybil spoofing anomaly confirmed. Isolating physical coordinate zone.` }
            ];
        }
    },
    14: {
        id: 14,
        name: "Sensor Data Manipulation",
        layer: "Session & Application",
        explanation: "Sensor Data Manipulation targets integrity. The attacker modifies sensor values within intercepted payloads, replacing legitimate data with false metrics to trick controllers into executing dangerous physical corrections.",
        simInstructions: "Toggle data corruption and watch the live graph crash/spike while the warning alerts trigger.",
        defaultControls: `
            <div class="control-item">
                <label>MANIPULATION FACTOR</label>
                <input type="range" class="slider-cyber" id="ctrl-manip-scale" min="-50" max="50" value="30">
                <span id="ctrl-manip-scale-val">+30°C</span>
            </div>
        `,
        getDefaultTelemetry: (ticks) => {
            const scale = window.simControls?.manipScale || 30;
            // Modifies sensor telemetry directly
            return { cpu: 10, heap: 288, rssi: -58, latency: 6 };
        },
        generateLog: (state, controls) => {
            const scale = controls.manipScale || 30;
            const originalVal = (25 + Math.sin(Date.now() / 1000) * 1.5).toFixed(1);
            const manipulatedVal = (parseFloat(originalVal) + scale).toFixed(1);
            return [
                { type: "info", text: `[SENSOR] True physical sensor value: ${originalVal}°C` },
                { type: "alert", text: `[INTEGRITY] Attacker intercepting payload...` },
                { type: "error", text: `[TAMPER] Modified value injected: ${manipulatedVal}°C` }
            ];
        }
    },
    15: {
        id: 15,
        name: "Timing Attack",
        layer: "Session & Application",
        explanation: "A Timing Attack is a side-channel exploit where an attacker analyzes the precise time variation required by a microcontroller to process cryptographic routines or verify authentication strings. These minor differences can reveal internal key structures.",
        simInstructions: "Inspect the stopwatch graphic above the node in 3D, highlighting processing timing differences based on correct password characters.",
        defaultControls: `
            <div class="control-item">
                <label>CHARACTERS CORRECT</label>
                <input type="range" class="slider-cyber" id="ctrl-timing-chars" min="0" max="8" value="3">
                <span id="ctrl-timing-chars-val">3 chars</span>
            </div>
        `,
        getDefaultTelemetry: (ticks) => {
            const chars = window.simControls?.timingChars || 3;
            // More characters correct -> longer execution time due to character-by-character string comparison (vulnerable design)
            const timing = 12.4 + chars * 4.2 + Math.random() * 0.4;
            return { cpu: 7, heap: 292, rssi: -55, latency: 4, timing };
        },
        generateLog: (state, controls) => {
            const chars = controls.timingChars || 3;
            const delayUs = (12.4 + chars * 4.2).toFixed(2);
            return [
                { type: "info", text: `[SIDE-CHANNEL] Probe verification attempt sent: "pwd${'1'.repeat(chars)}"` },
                { type: "alert", text: `[STOPWATCH] Verification duration observed: ${delayUs} microseconds` },
                { type: "success", text: `[TIMING-CRACKER] Statistical timing delta indicates char position ${chars + 1} cracked.` }
            ];
        }
    },
    16: {
        id: 16,
        name: "Physical Access Attack",
        layer: "Physical Layer",
        explanation: "Physical Access Attacks involve interacting directly with the hardware interface points, such as tapping UART/SPI buses, pulling down reset vectors, or shorting out exposed GPIO traces to alter operational loops or pull firmware directly from flash.",
        simInstructions: "Click the pin nodes on the interactive ESP32 board schematic on the right panel to analyze exposures.",
        defaultControls: `
            <div class="control-item">
                <label>TARGET BUS INTERFACE</label>
                <span id="ctrl-phys-interface" class="mono-text" style="color: var(--color-primary)">UART (GPIO1 & GPIO3)</span>
            </div>
        `,
        getDefaultTelemetry: () => ({ cpu: 5, heap: 298, rssi: -60, latency: 2 }),
        generateLog: (state) => {
            return [
                { type: "error", text: `[TAMPER] GPIO tamper loop broken! Dev board casing opened.` },
                { type: "alert", text: `[UART-TAP] Reading raw console log stream from serial bus TX pin...` },
                { type: "success", text: `[DUMP] Bootloader parameters captured: entry_point=0x400806ac` }
            ];
        }
    },
    17: {
        id: 17,
        name: "Delay Attack",
        layer: "Link & Network",
        explanation: "A Delay Attack selectively holds back valid packets for a calculated timeframe before transmitting them forward. While data integrity and cryptographic verification remain intact, the introduced latency causes control loops to fall out of sync.",
        simInstructions: "Watch packets spin in a holding circle in the Attacker node, delaying their delivery and disrupting Gateway B's timing controls.",
        defaultControls: `
            <div class="control-item">
                <label>PACKET BUFFER DELAY</label>
                <input type="range" class="slider-cyber" id="ctrl-delay-ms" min="50" max="1500" value="800" step="50">
                <span id="ctrl-delay-ms-val">800 ms</span>
            </div>
        `,
        getDefaultTelemetry: (ticks) => {
            const delay = window.simControls?.delayMs || 800;
            return { cpu: 8, heap: 290, rssi: -58, latency: delay };
        },
        generateLog: (state, controls) => {
            const delay = controls.delayMs || 800;
            return [
                { type: "info", text: `[ESP-NOW] Packet 842 received at Attacker.` },
                { type: "alert", text: `[DELAY ENGINE] Holding packet in queue for ${delay}ms...` },
                { type: "success", text: `[DELAY ENGINE] Packet 842 forwarded late.` },
                { type: "error", text: `[GATEWAY B] Control loop missed deadline! Actuator synchronization error.` }
            ];
        }
    }
};

export class AttackSimulator {
    constructor() {
        this.activeAttackId = 8; // Default to Jamming
        this.mode = 'simulation'; // 'simulation' or 'twin'
        this.isActive = false;
        this.telemetryHistory = [];
        this.ticks = 0;
        this.logCallback = null;
        this.telemetryCallback = null;
        this.intervalId = null;

        // Current controls state
        this.controlsState = {
            mitmPayload: "TX_DATA: TEMP=24.5C",
            mitmMod: "TX_DATA: TEMP=99.9C",
            eavesChannel: "1",
            replayDelay: 5,
            spoofMac: "24:6F:28:1A:3B:10",
            injectHex: "0x15 0xFF 0x0A 0x8D 0x3E",
            dosRate: 500,
            ddosBots: 6,
            jamPower: -30,
            rogueMac: "3C:61:05:44:A2:D8",
            routeType: "sinkhole",
            sybilGhosts: 15,
            manipScale: 30,
            timingChars: 3,
            delayMs: 800
        };

        // Expose controls state globally for lazy lookup in getters
        window.simControls = this.controlsState;
    }

    setMode(mode) {
        this.mode = mode;
        this.log(`System transitioned to [${mode.toUpperCase()} MODE]`, 'info');
        if (mode === 'twin') {
            this.isActive = false; // Twin active state depends on serial data
        }
    }

    setActiveAttack(id) {
        this.activeAttackId = parseInt(id);
        this.ticks = 0;
        this.log(`Switched view to exploit vector: ${ATTACKS[this.activeAttackId].name}`, 'info');
        // Clear telemetry history to prevent chart bleed-over
        this.telemetryHistory = [];
    }

    start() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.isActive = true;
        this.ticks = 0;
        this.log(`Exploit simulation thread started for [${ATTACKS[this.activeAttackId].name}]`, 'alert');

        this.intervalId = setInterval(() => {
            this.ticks++;
            this.tick();
        }, 1500);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isActive = false;
        this.log(`Exploit simulation thread terminated. Mode idle.`, 'info');
    }

    updateControl(key, value) {
        this.controlsState[key] = value;
    }

    tick() {
        if (!this.isActive && this.mode === 'simulation') return;

        // Generate telemetry data
        const definition = ATTACKS[this.activeAttackId];
        const baseTelemetry = definition.getDefaultTelemetry(this.ticks);
        
        // Add random jitter to simulate physical environment
        const telemetry = {
            cpu: Math.max(0, Math.min(100, Math.round(baseTelemetry.cpu + (Math.random() * 4 - 2)))),
            heap: Math.max(1, Math.round(baseTelemetry.heap + (Math.random() * 6 - 3))),
            rssi: Math.min(-20, Math.round(baseTelemetry.rssi + (Math.random() * 2 - 1))),
            latency: baseTelemetry.latency,
            timing: baseTelemetry.timing || null,
            timestamp: Date.now()
        };

        this.telemetryHistory.push(telemetry);
        if (this.telemetryHistory.length > 50) this.telemetryHistory.shift();

        // Trigger telemetry callback
        if (this.telemetryCallback) {
            this.telemetryCallback(telemetry, this.telemetryHistory);
        }

        // Generate logs (every ticks % 2 === 0 or so)
        if (this.ticks % 2 === 0) {
            const logs = definition.generateLog(this, this.controlsState);
            logs.forEach(logLine => {
                this.log(logLine.text, logLine.type);
            });
        }
    }

    log(message, type = 'info') {
        if (this.logCallback) {
            this.logCallback(message, type);
        }
    }
}
