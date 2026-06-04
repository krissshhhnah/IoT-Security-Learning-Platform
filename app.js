/**
 * Cyber-Twin Platform Coordinator
 * Wireframes state bindings, triggers, UI overlays, serial parsers, and WebGL animations.
 */

import { ATTACKS, AttackSimulator } from './simulator.js';
import { ThreeTopology } from './three-topology.js';
import { MetricsCharts } from './metrics-charts.js';
import { SerialGateway } from './serial-gateway.js';
import { EspBoard } from './esp-board.js';

class App {
    constructor() {
        this.simulator = new AttackSimulator();
        this.topology = null;
        this.charts = null;
        this.serial = new SerialGateway();
        
        this.activeAttackId = 8; // Start with Jamming
        this.isAttackActive = false;
        this.selectedNodeId = 'node-a'; // Start with Node A selected
        this.hoveredNodeId = null;
        this.hoveredNodeX = 0;
        this.hoveredNodeY = 0;

        // Real Hardware Parking State
        this.parkingSenderMac = "24:6F:28:1A:3B:10";
        this.parkingReceiverMac = "24:6F:28:1A:3B:BB";
        this.parkingState = {
            freeSlots: 2,
            gateOpen: false,
            vehicleDetected: false,
            access: "Idle",
            card: "None",
            lastUpdate: "Never (Offline)"
        };

        // Simulation Timer properties
        this.timerSeconds = 0;
        this.timerIntervalId = null;

        // Set default mode attribute
        document.documentElement.setAttribute('data-mode', 'simulation');

        this.init();
    }

    async init() {
        // Remove 3D map loading splash screen once dependencies are ready
        const loader = document.getElementById('three-loader');
        if (loader) loader.classList.add('hidden');

        // Instantiate Sub-Modules
        this.topology = new ThreeTopology('three-container');
        this.charts = new MetricsCharts('chart-metrics');
        
        new EspBoard('esp-board-body', (pinName, vulnDesc) => {
            this.logToConsole(`[BOARD TAP] Selected Interface: ${pinName}`, 'info');
            this.logToConsole(`[EXPOSURE] ${vulnDesc}`, 'error');
        });

        // Set initial states
        this.topology.setAttackVector(this.activeAttackId);
        this.updateExplanationPanel();
        this.renderControlDock();
        this.updateNodeDetailsPanel();
        this.updateSidebarVectorStatus();
        this.updateFlowExplanationBanner();

        // Wire Event Listeners
        this.bindEvents();
        this.configureCallbacks();

        // Bind 3D raycasting click handler
        this.topology.onNodeClicked = (nodeId) => {
            this.selectedNodeId = nodeId;
            this.updateNodeDetailsPanel();
        };

        // Initial Theme Update
        this.topology.setThemeColors();
        
        // Force WebGL Canvas and charts size refresh on load
        setTimeout(() => {
            this.topology.onWindowResize();
            this.charts.resize();
            this.logToConsole("Simulation dashboard initialized.", "success");
        }, 100);

        this.triggerSimulationTick();
    }

    bindEvents() {
        // Navigation sidebar items clicks
        const navItems = document.querySelectorAll('.vector-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const button = e.currentTarget;
                navItems.forEach(i => i.classList.remove('active'));
                button.classList.add('active');

                const attackId = parseInt(button.getAttribute('data-vector'));
                this.switchAttack(attackId);
            });
        });



        // Mode Switching
        const btnSim = document.getElementById('btn-mode-sim');
        const btnTwin = document.getElementById('btn-mode-twin');

        btnSim.addEventListener('click', () => {
            btnSim.classList.add('active');
            btnTwin.classList.remove('active');
            this.setMode('simulation');
        });

        btnTwin.addEventListener('click', () => {
            btnTwin.classList.add('active');
            btnSim.classList.remove('active');
            this.setMode('twin');
        });

        // Theme dropdown (if present)
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                document.documentElement.setAttribute('data-theme', e.target.value);
                this.topology.setThemeColors();
                this.logToConsole(`Theme changed to: ${e.target.value.toUpperCase()}`, 'info');
            });
        }

        // Clear Console
        document.getElementById('btn-clear-console').addEventListener('click', () => {
            document.getElementById('console-log-body').innerHTML = '';
        });

        // Export Logs Utility
        document.getElementById('btn-export-logs').addEventListener('click', () => this.exportConsoleLogs());

        // Exploit Launch Control Buttons
        document.getElementById('btn-trigger-attack').addEventListener('click', () => this.toggleExploitState());
        document.getElementById('btn-stop-attack').addEventListener('click', () => this.stopActiveAttack());
        document.getElementById('btn-reset-sim').addEventListener('click', () => this.resetSimulation());

        // Viewport Toolbar Buttons
        document.getElementById('btn-view-3d').addEventListener('click', (e) => this.toggleViewportMode('3d', e.target));
        document.getElementById('btn-view-topo').addEventListener('click', (e) => this.toggleViewportMode('topo', e.target));
        document.getElementById('btn-view-list').addEventListener('click', (e) => this.toggleViewportMode('list', e.target));

        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            this.topology.zoom('in');
            this.updateZoomDisplay();
        });
        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            this.topology.zoom('out');
            this.updateZoomDisplay();
        });

        const btnRotate = document.getElementById('btn-tool-rotate');
        const btnPan = document.getElementById('btn-tool-pan');

        btnRotate.addEventListener('click', () => {
            btnRotate.classList.add('active');
            btnPan.classList.remove('active');
            this.topology.setControlMode('rotate');
        });

        btnPan.addEventListener('click', () => {
            btnPan.classList.add('active');
            btnRotate.classList.remove('active');
            this.topology.setControlMode('pan');
        });

        document.getElementById('btn-tool-reset').addEventListener('click', () => {
            this.topology.resetView();
            this.updateZoomDisplay(100);
        });
    }

    configureCallbacks() {
        // Hover raycasting event
        this.topology.onNodeHover = (nodeId, x, y) => {
            this.hoveredNodeId = nodeId;
            this.hoveredNodeX = x;
            this.hoveredNodeY = y;
            this.updateHoverTooltip();
        };

        // Console logging callback
        this.simulator.logCallback = (msg, type) => this.logToConsole(msg, type);
        
        // Serial Line printing callback
        this.serial.onLineReceived = (line) => {
            let type = 'info';
            if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('alert') || line.toLowerCase().includes('tamper')) {
                type = 'error';
            } else if (line.toLowerCase().includes('rogue') || line.toLowerCase().includes('sybil') || line.toLowerCase().includes('exploit')) {
                type = 'alert';
            } else if (line.toLowerCase().includes('ok') || line.toLowerCase().includes('success') || line.toLowerCase().includes('connected')) {
                type = 'success';
            }
            this.logToConsole(`[USB-DEV] ${line}`, type);
            
            // Core transmission triggers & state parsing
            this.parseHardwareLine(line);
        };

        // Telemetry tick callback (binds values to Canvas chart renderer & Sidebar metrics)
        this.simulator.telemetryCallback = (latest, history) => {
            this.charts.render(this.activeAttackId, history);
            this.updateSidebarMetrics(latest);
        };

        // Universal MAC auto-discovery mapping
        this.serial.onDeviceDiscovered = (nodeInfo, isNew) => {
            // Map mock/real discovered MACs to Node A, Node B, and Attacker instead of adding new nodes
            if (nodeInfo.role === 'node-a' || nodeInfo.role === 'client') {
                this.parkingSenderMac = nodeInfo.mac;
                this.topology.updateNodeLabel('node-a', `NODE A (${nodeInfo.mac})`);
            } else if (nodeInfo.role === 'node-b' || nodeInfo.role === 'switch') {
                this.parkingReceiverMac = nodeInfo.mac;
                this.topology.updateNodeLabel('node-b', `NODE B (${nodeInfo.mac})`);
            } else if (nodeInfo.role === 'attacker') {
                this.topology.updateNodeLabel('attacker', `ATTACKER (${nodeInfo.mac})`);
            }
            
            if (isNew) {
                this.logToConsole(`[AUTODISCOVER] Dynamically mapped device: MAC=${nodeInfo.mac} | Profile=${nodeInfo.role.toUpperCase()}`, 'success');
            }
            
            // Keep active nodes count static to the 3 main nodes
            document.getElementById('metric-nodes-val').innerText = "3 Nodes";
            this.updateNodeDetailsPanel();
        };

        // USB connect status update visual flags
        this.serial.onConnectionChange = (connected) => {
            const btnConnect = document.getElementById('btn-connect');
            if (btnConnect) {
                if (connected) {
                    btnConnect.classList.add('connected');
                    btnConnect.querySelector('.btn-text').innerText = "PORT ACTIVE";
                    this.serial.stopMockHardwareStream();
                } else {
                    btnConnect.classList.remove('connected');
                    btnConnect.querySelector('.btn-text').innerText = "CONNECT HW";
                    if (this.simulator.mode === 'twin') {
                        this.serial.startMockHardwareStream();
                    }
                }
            }
        };
    }

    parseHardwareLine(line) {
        const clean = line.trim();
        const nowStr = new Date().toLocaleTimeString();
        this.parkingState.lastUpdate = nowStr;

        // 0. Parse JSON telemetry packets (e.g. from mock/real serial data streams)
        if (clean.startsWith("{") && clean.endsWith("}")) {
            try {
                const telemetry = JSON.parse(clean);
                const role = telemetry.role || "";
                if (role.includes("node-a") || role.includes("node-b") || role.includes("client") || role.includes("switch")) {
                    // Normal communication packet transmission
                    const normalLink = this.topology.links.find(l => l.type === 'normal');
                    if (normalLink) {
                        this.topology.spawnPacket(normalLink.curve, 0x00f0ff, 1.8);
                    }
                    const nodeB = this.topology.nodes.get('node-b');
                    if (nodeB) {
                        this.topology.spawnBurst(nodeB.mesh.position, 0x00f0ff, 12);
                    }
                } else if (role.includes("attacker")) {
                    // Attacker packet transmission
                    const attackLink = this.topology.links.find(l => l.type === 'attack');
                    if (attackLink && this.isAttackActive) {
                        this.topology.spawnPacket(attackLink.curve, 0xef4444, 1.8);
                    }
                    const nodeB = this.topology.nodes.get('node-b');
                    if (nodeB) {
                        this.topology.spawnBurst(nodeB.mesh.position, 0xef4444, 15);
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        // 1. Classify & parse sender/receiver MAC addresses on setup
        if (clean.includes("MAC Address:") || clean.includes("My MAC Address:")) {
            const macRegex = /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/;
            const match = clean.match(macRegex);
            if (match) {
                const mac = match[0];
                if (clean.toLowerCase().includes("my mac") || clean.toLowerCase().includes("receiver")) {
                    // Receiver MAC
                    this.parkingReceiverMac = mac;
                    this.topology.updateNodeLabel('node-b', `NODE B (${mac})`);
                    this.logToConsole(`[HARDWARE] Paired Receiver MAC address: ${mac}`, 'success');
                } else {
                    // Sender MAC
                    this.parkingSenderMac = mac;
                    this.topology.updateNodeLabel('node-a', `NODE A (${mac})`);
                    this.logToConsole(`[HARDWARE] Paired Sender MAC address: ${mac}`, 'success');
                }
                this.updateNodeDetailsPanel();
            }
        }

        // 2. Check if packet transmission occurred
        if (clean.includes("ESP-NOW Send: Success") || clean.includes("=== Parking Update ===")) {
            // Normal communication packet transmission
            const normalLink = this.topology.links.find(l => l.type === 'normal');
            if (normalLink) {
                this.topology.spawnPacket(normalLink.curve, 0x00f0ff, 1.8);
            }
            
            // Add a visual flash to Node B to show data received/sent
            const nodeB = this.topology.nodes.get('node-b');
            if (nodeB) {
                this.topology.spawnBurst(nodeB.mesh.position, 0x00f0ff, 12);
            }
        }
        else if (clean.includes("ESP-NOW Send: Fail")) {
            this.logToConsole("[ALERT] Hardware ESP-NOW delivery failed!", "error");
            const nodeA = this.topology.nodes.get('node-a');
            if (nodeA) {
                this.topology.spawnBurst(nodeA.mesh.position, 0xef4444, 25);
            }
        }
        else if (clean.includes("unknown sender") || clean.includes("ignored")) {
            // Attacker packet intercepted
            const attackLink = this.topology.links.find(l => l.type === 'attack');
            if (attackLink) {
                this.topology.spawnPacket(attackLink.curve, 0xef4444, 1.8);
            }
            const nodeB = this.topology.nodes.get('node-b');
            if (nodeB) {
                this.topology.spawnBurst(nodeB.mesh.position, 0xef4444, 20);
            }
        }

        // 3. Parse telemetry parameters
        // Free slots: X
        if (clean.includes("Free slots:")) {
            const match = clean.match(/Free slots:\s*(\d+)/i);
            if (match) {
                this.parkingState.freeSlots = parseInt(match[1]);
                this.updateNodeDetailsPanel();
            }
        }
        // Gate: X
        if (clean.includes("Gate:")) {
            this.parkingState.gateOpen = clean.toLowerCase().includes("open");
            this.updateNodeDetailsPanel();
        }
        else if (clean.includes("Door: OPEN") || clean.includes("Door Opening")) {
            this.parkingState.gateOpen = true;
            this.updateNodeDetailsPanel();
        }
        else if (clean.includes("Door: CLOSED") || clean.includes("Door Closed")) {
            this.parkingState.gateOpen = false;
            this.updateNodeDetailsPanel();
        }
        // Vehicle near: X
        if (clean.includes("Vehicle near:")) {
            this.parkingState.vehicleDetected = clean.toLowerCase().includes("yes");
            this.updateNodeDetailsPanel();
        }
        else if (clean.includes("vehicle_detected:") || clean.includes("vehicle detected:")) {
            this.parkingState.vehicleDetected = !clean.toLowerCase().includes("false") && !clean.toLowerCase().includes("no");
            this.updateNodeDetailsPanel();
        }
        // Access: X
        if (clean.includes("Access:")) {
            const match = clean.match(/Access:\s*(.+)/i);
            if (match) {
                this.parkingState.access = match[1].trim();
                this.updateNodeDetailsPanel();
            }
        }
        else if (clean.includes("Access Granted")) {
            this.parkingState.access = "Granted";
            this.updateNodeDetailsPanel();
        }
        else if (clean.includes("Access Denied")) {
            this.parkingState.access = "Denied";
            this.updateNodeDetailsPanel();
        }
        // Card: X
        if (clean.includes("Card:")) {
            const match = clean.match(/Card:\s*(.+)/i);
            if (match) {
                this.parkingState.card = match[1].trim();
                this.updateNodeDetailsPanel();
            }
        }
    }

    switchAttack(id) {
        this.activeAttackId = id;
        this.stopActiveAttack(); // Terminate previous loops
        
        this.simulator.setActiveAttack(id);
        this.topology.setAttackVector(id);
        this.updateExplanationPanel();
        this.renderControlDock();
        this.updateNodeDetailsPanel();
        this.updateFlowExplanationBanner();

        // Control board panel visibility for Physical Access (16)
        const boardPanel = document.getElementById('panel-esp-board');
        if (id === 16) {
            boardPanel.classList.remove('hidden');
        } else {
            boardPanel.classList.add('hidden');
        }

        this.charts.render(id, []);
    }

    setMode(mode) {
        document.documentElement.setAttribute('data-mode', mode);
        this.simulator.setMode(mode);
        this.stopActiveAttack();

        this.serial.clearRegistry();
        this.topology.clearAttackOverlays();
        this.topology.setupDefaultNodes();
        this.updateNodeDetailsPanel();
        this.updateFlowExplanationBanner();

        // Refresh Three.js grid/theme colors for the new mode
        this.topology.setThemeColors();

        if (mode === 'twin') {
            this.logToConsole("Universal MAC discovery active. Listening for packet broadcasts...", "alert");
            if (!this.serial.port) {
                this.serial.startMockHardwareStream();
            }
        } else {
            this.serial.stopMockHardwareStream();
            this.serial.disconnect();
        }
        
        document.getElementById('metric-nodes-val').innerText = `${this.topology.nodes.size} Nodes`;
    }



    toggleExploitState() {
        const btnPlay = document.getElementById('btn-trigger-attack');
        const badge = document.getElementById('sim-status-badge');
        this.isAttackActive = !this.isAttackActive;

        if (this.isAttackActive) {
            // Visually update Launch button to Halt (Pause icon)
            btnPlay.querySelector('.btn-icon').innerText = "⏸";
            btnPlay.querySelector('.btn-text').innerText = "Halt";
            btnPlay.classList.add('active');

            // Update Simulation Status
            badge.innerText = "● Running";
            badge.className = "status-badge active-run";

            // Trigger compromise node mappings in Three.js
            const compromisedNodes = this.getCompromisedNodesForAttack();
            this.topology.setCompromisedNode(compromisedNodes);

            this.topology.triggerAttack(true);
            this.startTimer();
            
            if (this.simulator.mode === 'simulation') {
                this.simulator.start();
            } else {
                this.logToConsole("[TX_SERIAL] Broadcasting attack trigger command: EXPLOIT_START_ID=" + this.activeAttackId, "success");
            }
        } else {
            // Visual Update to Play icon
            btnPlay.querySelector('.btn-icon').innerText = "▶";
            btnPlay.querySelector('.btn-text').innerText = "Launch";
            btnPlay.classList.remove('active');

            badge.innerText = "● Halted";
            badge.className = "status-badge";

            this.topology.triggerAttack(false);
            this.pauseTimer();
            
            if (this.simulator.mode === 'simulation') {
                this.simulator.stop();
            } else {
                this.logToConsole("[TX_SERIAL] Broadcasting exploit pause command", "info");
            }
        }
        
        // Refresh details table to reflect compromised node status
        this.updateNodeDetailsPanel();
        this.updateSidebarVectorStatus();
        this.updateFlowExplanationBanner();
    }

    stopActiveAttack() {
        this.isAttackActive = false;
        
        const btnPlay = document.getElementById('btn-trigger-attack');
        btnPlay.querySelector('.btn-icon').innerText = "▶";
        btnPlay.querySelector('.btn-text').innerText = "Launch";
        btnPlay.classList.remove('active');

        const badge = document.getElementById('sim-status-badge');
        badge.innerText = "● Idle";
        badge.className = "status-badge";

        this.topology.triggerAttack(false);
        this.topology.setCompromisedNode(null);
        
        this.simulator.stop();
        this.stopTimer();

        // Refresh details table
        this.updateNodeDetailsPanel();
        this.updateSidebarVectorStatus();
        this.updateFlowExplanationBanner();
    }

    resetSimulation() {
        this.stopActiveAttack();
        this.timerSeconds = 0;
        document.getElementById('sim-timer-val').innerText = "00:00:00";
        document.getElementById('console-log-body').innerHTML = '';
        this.updateFlowExplanationBanner();
        this.logToConsole("Intrusion logs and simulation timer cleared.", "info");
        this.updateSidebarVectorStatus();
    }

    startTimer() {
        if (this.timerIntervalId) clearInterval(this.timerIntervalId);
        this.timerIntervalId = setInterval(() => {
            this.timerSeconds++;
            const hrs = String(Math.floor(this.timerSeconds / 3600)).padStart(2, '0');
            const mins = String(Math.floor((this.timerSeconds % 3600) / 60)).padStart(2, '0');
            const secs = String(this.timerSeconds % 60).padStart(2, '0');
            document.getElementById('sim-timer-val').innerText = `${hrs}:${mins}:${secs}`;
        }, 1000);
    }

    pauseTimer() {
        if (this.timerIntervalId) {
            clearInterval(this.timerIntervalId);
            this.timerIntervalId = null;
        }
    }

    stopTimer() {
        this.pauseTimer();
        this.timerSeconds = 0;
        document.getElementById('sim-timer-val').innerText = "00:00:00";
    }

    getCompromisedNodesForAttack() {
        const id = this.activeAttackId;
        switch (id) {
            case 8: // Jamming
                return ['node-a', 'node-b'];
            case 2: // Eavesdropping
            case 3: // Replay
            case 9: // Credential Theft
            case 10: // Session Hacking
            case 14: // Sensor Tamper
            case 15: // Timing
            case 16: // Physical Access
                return ['node-a'];
            case 1: // MitM
            case 4: // Spoofing
            case 5: // Packet Injection
            case 6: // DoS
            case 7: // DDoS
            case 11: // Rogue Insertion
            case 12: // Routing
            case 13: // Sybil
            case 17: // Delay
                return ['node-b'];
            default:
                return [];
        }
    }

    updateSidebarVectorStatus() {
        const navItems = document.querySelectorAll('.vector-item');
        navItems.forEach(item => {
            const attackId = parseInt(item.getAttribute('data-vector'));
            const statusIcon = item.querySelector('.vector-status-icon');
            if (!statusIcon) return;

            if (attackId === this.activeAttackId && this.isAttackActive) {
                statusIcon.className = "vector-status-icon active-spinner";
                statusIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" style="width:100%; height:100%;"><circle cx="12" cy="12" r="10" stroke-dasharray="36" stroke-dashoffset="12" stroke-linecap="round"></circle></svg>`;
            } else {
                statusIcon.className = "vector-status-icon pending";
                statusIcon.innerHTML = ""; // No lock, wait, or tick symbols
            }
        });
    }

    updateNodeDetailsPanel() {
        const container = document.getElementById('node-details-container');
        if (container) {
            const nodeId = this.selectedNodeId;
            const details = this.getNodeDetailsData(nodeId);

            container.innerHTML = `
                <div class="node-details-header">
                    <div class="node-details-icon">${details.icon}</div>
                    <div class="node-details-meta">
                        <h3>${details.title}</h3>
                        <p>IP: ${details.ip} | MAC: ${details.mac}</p>
                        <span class="node-status-badge ${details.statusClass}">${details.status.toUpperCase()}</span>
                    </div>
                </div>
                
                <table class="node-details-table">
                    <tr>
                        <td class="label-col">Type</td>
                        <td class="value-col">${details.type}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Vendor</td>
                        <td class="value-col">${details.vendor}</td>
                    </tr>
                    <tr>
                        <td class="label-col">OS / Firmware</td>
                        <td class="value-col">${details.os}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Status</td>
                        <td class="value-col" style="color: ${details.statusColor}">${details.status}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Vulnerabilities</td>
                        <td class="value-col" style="color: ${details.vulnColor}">${details.vulnerabilities}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Open Ports</td>
                        <td class="value-col">${details.ports}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Last Seen</td>
                        <td class="value-col">${details.lastSeen}</td>
                    </tr>
                </table>
            `;
        }
        this.updateHoverTooltip();
        this.updateListViewTable();
    }

    updateHoverTooltip() {
        const tooltip = document.getElementById('node-hover-tooltip');
        if (!tooltip) return;

        if (this.hoveredNodeId) {
            const details = this.getNodeDetailsData(this.hoveredNodeId);
            tooltip.innerHTML = `
                <div class="node-details-header">
                    <div class="node-details-icon ${details.statusClass === 'compromised' ? 'icon-compromised' : (details.statusClass === 'attacking' ? 'icon-attacker' : '')}">${details.icon}</div>
                    <div class="node-details-meta">
                        <h3>${details.title}</h3>
                        <p>IP: ${details.ip} | MAC: ${details.mac}</p>
                        <span class="node-status-badge ${details.statusClass}">${details.status.toUpperCase()}</span>
                    </div>
                </div>
                
                <table class="node-details-table">
                    <tr>
                        <td class="label-col">Type</td>
                        <td class="value-col">${details.type}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Vendor</td>
                        <td class="value-col">${details.vendor}</td>
                    </tr>
                    <tr>
                        <td class="label-col">OS / Firmware</td>
                        <td class="value-col">${details.os}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Status</td>
                        <td class="value-col" style="color: ${details.statusColor}">${details.status}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Vulnerabilities</td>
                        <td class="value-col" style="color: ${details.vulnColor}">${details.vulnerabilities}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Open Ports</td>
                        <td class="value-col">${details.ports}</td>
                    </tr>
                    <tr>
                        <td class="label-col">Last Seen</td>
                        <td class="value-col">${details.lastSeen}</td>
                    </tr>
                </table>
            `;
            tooltip.style.left = `${this.hoveredNodeX + 15}px`;
            tooltip.style.top = `${this.hoveredNodeY + 15}px`;
            tooltip.classList.remove('hidden');
        } else {
            tooltip.classList.add('hidden');
        }
    }

    updateFlowExplanationBanner() {
        const badge = document.getElementById('flow-banner-badge');
        const text = document.getElementById('flow-banner-text');
        if (!badge || !text) return;

        if (this.simulator.mode === 'twin') {
            badge.innerText = "DIGITAL TWIN";
            badge.className = "flow-banner-badge success";
            text.innerText = "Listening for live ESP32 hardware packet transmissions...";
            return;
        }

        const info = ATTACKS[this.activeAttackId];
        if (!info) return;

        if (this.isAttackActive) {
            badge.innerText = "ATTACK ACTIVE";
            badge.className = "flow-banner-badge danger";
            
            switch (this.activeAttackId) {
                case 1:
                    text.innerText = "Man-in-the-Middle (MitM): Attacker redirects and alters mesh payload packets flowing between Node A and Node B to hijack device commands.";
                    break;
                case 2:
                    text.innerText = "Eavesdropping: Attacker captures and logs unencrypted wireless sensor telemetry frames from the air interface.";
                    break;
                case 3:
                    text.innerText = "Replay Attack: Attacker captures authenticated transmission frames and retransmits them later to force unauthorized gate activation.";
                    break;
                case 4:
                    text.innerText = "MAC Spoofing: Attacker clones Node A's MAC address to masquerade as a legitimate sensor node and inject forged logs.";
                    break;
                case 5:
                    text.innerText = "Packet Injection: Attacker bypasses authentication to inject custom malicious hex payload frames directly to Node B.";
                    break;
                case 6:
                    text.innerText = "Denial of Service (DoS): Attacker floods the gateway with high-rate request traffic to exhaust the ESP32 receiver buffer.";
                    break;
                case 7:
                    text.innerText = "Distributed DoS: Attacker commands multiple compromised IoT bots to simultaneously saturate Node B's gateway buffer.";
                    break;
                case 8:
                    text.innerText = "Jamming Attack: Attacker broadcasts RF carrier noise on the 2.4GHz band to break physical-layer communication links.";
                    break;
                case 9:
                    text.innerText = "Credential Theft: Attacker intercepts authentication handshakes to steal cryptographic credentials.";
                    break;
                case 10:
                    text.innerText = "Session Hijacking: Attacker de-authenticates Node A to hijack the active communications session with Node B.";
                    break;
                case 11:
                    text.innerText = "Rogue Node Insertion: Unauthorized hardware is inserted into the wireless mesh to broadcast malicious logs.";
                    break;
                case 12:
                    {
                        const isBlackhole = (this.simulator.controlsState.routeType === 'blackhole');
                        text.innerText = isBlackhole 
                            ? "Blackhole Routing: Attacker drops all mesh routing traffic, causing 100% packet loss (link is broken)." 
                            : "Sinkhole Routing: Attacker redirects all mesh paths through itself to intercept network traffic.";
                    }
                    break;
                case 13:
                    text.innerText = "Sybil Attack: A single attacker node advertises multiple fake digital identities to poison the mesh routing table.";
                    break;
                case 14:
                    text.innerText = "Sensor Data Manipulation: Attacker intercepts sensor telemetry and overrides payload fields with forged values.";
                    break;
                case 15:
                    text.innerText = "Timing Side-Channel: Attacker analyzes response latency variations to crack the cryptographic key.";
                    break;
                case 16:
                    text.innerText = "Physical Access: Attacker taps onboard JTAG/UART test points to override firmware code.";
                    break;
                case 17:
                    text.innerText = "Delay Attack: Attacker buffers packets, holding them back to introduce control loop latency.";
                    break;
                default:
                    text.innerText = `Running cyber-attack: ${info.name}.`;
                    break;
            }
        } else {
            badge.innerText = "SECURE MESH";
            badge.className = "flow-banner-badge success";
            text.innerText = `Secure communication active between Node A and Node B. (Selected: ${info.name})`;
        }
    }

    getNodeDetailsData(id) {
        const compromisedNodes = this.getCompromisedNodesForAttack();
        const isCompromised = this.isAttackActive && compromisedNodes.includes(id);

        let status = "Healthy";
        let statusClass = "healthy";
        let statusColor = "var(--color-success)";
        let vulnerabilities = "None (Audit Passed)";
        let vulnColor = "var(--color-success)";

        if (isCompromised) {
            status = "Compromised";
            statusClass = "compromised";
            statusColor = "#f43f5e";
            vulnerabilities = `1 Critical (${this.getAttackVulnerabilityLabel()})`;
            vulnColor = "#f43f5e";
        }

        if (id === 'internet') {
            return {
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: var(--color-primary);"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
                title: "WAN Internet",
                ip: "8.8.8.XX (External)",
                mac: "00:1A:2B:3C:4D:5E",
                type: "External Network",
                vendor: "Global ISP backbone",
                os: "Cisco IOS-XR v7.5",
                status,
                statusClass,
                statusColor,
                vulnerabilities,
                vulnColor,
                ports: "53 (DNS), 80 (HTTP), 443 (HTTPS)",
                lastSeen: "Active"
            };
        } else if (id === 'router') {
            return {
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: var(--color-primary);"><path d="M2 16.24A10 10 0 0 1 12 2v0a10 10 0 0 1 10 14.24M12 12v10M12 18H8M12 18h4"/></svg>`,
                title: "Core Router",
                ip: "192.168.1.XX",
                mac: "24:6F:28:1A:3B:AA",
                type: "Enterprise Gateway",
                vendor: "Ubiquiti Networks",
                os: "EdgeOS v2.0.9",
                status,
                statusClass,
                statusColor,
                vulnerabilities,
                vulnColor,
                ports: "22 (SSH), 53 (DNS), 80 (HTTP), 161 (SNMP)",
                lastSeen: "Active"
            };
        } else if (id === 'node-b') {
            return {
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: var(--color-primary);"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
                title: "Node B (Parking Receiver)",
                ip: "192.168.1.XX",
                mac: this.parkingReceiverMac,
                type: "IoT Display Node",
                vendor: "Espressif Systems ESP32",
                os: "Adafruit SH1106 OLED",
                status: `Gate: ${this.parkingState.gateOpen ? "OPEN" : "CLOSED"}`,
                statusClass: this.parkingState.gateOpen ? "healthy" : "normal",
                statusColor: this.parkingState.gateOpen ? "var(--color-success)" : "var(--color-text-muted)",
                vulnerabilities: "None (Audit Passed)",
                vulnColor: "var(--color-success)",
                ports: "8125 (ESP-NOW), OLED (I2C)",
                lastSeen: this.parkingState.lastUpdate
            };
        } else if (id === 'attacker') {
            return {
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: #f43f5e;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8M12 17v4"/></svg>`,
                title: "Malicious Attacker",
                ip: "203.0.113.XX",
                mac: "3C:61:05:44:A2:D8",
                type: "RF Promiscuous Sniffer",
                vendor: "HackRF DEV Board",
                os: "Kali Linux Embedded",
                status: this.isAttackActive ? "Attacking" : "Sniffing Idle",
                statusClass: this.isAttackActive ? "attacking" : "healthy",
                statusColor: this.isAttackActive ? "#f43f5e" : "#f59e0b",
                vulnerabilities: "None (Secured Endpoint)",
                vulnColor: "var(--color-success)",
                ports: "8080 (Jammer Console), 4444 (Reverse Shell)",
                lastSeen: "Active"
            };
        } else if (id === 'ip-camera') {
            return {
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: var(--color-primary);"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
                title: "Smart IP Camera",
                ip: "192.168.1.XX",
                mac: "24:6F:28:1A:3B:10",
                type: "IoT Camera Endpoint",
                vendor: "Hikvision Smart IoT",
                os: "Embedded Linux v4.9",
                status,
                statusClass,
                statusColor,
                vulnerabilities,
                vulnColor,
                ports: "80 (HTTP), 554 (RTSP)",
                lastSeen: "Active"
            };
        } else if (id === 'smart-lock') {
            return {
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: var(--color-primary);"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
                title: "Smart Lock",
                ip: "192.168.1.XX",
                mac: "24:6F:28:1A:3B:11",
                type: "IoT Physical Security",
                vendor: "August Home",
                os: "FreeRTOS BLE/WiFi v1.8",
                status,
                statusClass,
                statusColor,
                vulnerabilities,
                vulnColor,
                ports: "80 (HTTP), 8125 (ESP-NOW)",
                lastSeen: "Active"
           } else if (id === 'node-a') {
            return {
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: var(--color-primary);"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></svg>`,
                title: "Node A (Parking Sender)",
                ip: "192.168.1.XX",
                mac: this.parkingSenderMac,
                type: "IoT Client Device",
                vendor: "Espressif Systems ESP32",
                os: "FreeRTOS ESP-NOW v3.0",
                status: `Slots Free: ${this.parkingState.freeSlots} | Vehicle: ${this.parkingState.vehicleDetected ? "Yes" : "No"}`,
                statusClass: this.parkingState.vehicleDetected ? "alert" : "healthy",
                statusColor: this.parkingState.vehicleDetected ? "var(--color-primary)" : "var(--color-success)",
                vulnerabilities: `Card: ${this.parkingState.card} (${this.parkingState.access})`,
                vulnColor: this.parkingState.access === "Granted" ? "var(--color-success)" : (this.parkingState.access === "Denied" ? "#f43f5e" : "var(--color-text-muted)"),
                ports: "8125 (ESP-NOW), RFID (SPI)",
                lastSeen: this.parkingState.lastUpdate
            };
        } else if (id === 'smart-light') {
            return {
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: var(--color-primary);"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/></svg>`,
                title: "Smart Light Bulb",
                ip: "192.168.1.XX",
                mac: "24:6F:28:1A:3B:13",
                type: "IoT Smart Lighting",
                vendor: "Philips Hue",
                os: "Embedded HueOS v2.4",
                status,
                statusClass,
                statusColor,
                vulnerabilities,
                vulnColor,
                ports: "80 (HTTP), 8125 (ESP-NOW)",
                lastSeen: "Active"
            };
        } else if (id === 'thermostat') {
            return {
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: var(--color-primary);"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`,
                title: "Smart Thermostat",
                ip: "192.168.1.XX",
                mac: "24:6F:28:1A:3B:14",
                type: "IoT HVAC Controller",
                vendor: "Nest Labs",
                os: "NestOS v6.2 (Thread)",
                status,
                statusClass,
                statusColor,
                vulnerabilities,
                vulnColor,
                ports: "80 (HTTP), 8125 (ESP-NOW)",
                lastSeen: "Active"
            };
        } else if (id.startsWith('mac-')) {
            const macAddress = id.replace('mac-', '');
            const info = this.serial.discoveredNodes.get(macAddress);
            const isRogue = info && (info.role === 'rogue' || info.role === 'attacker');
            
            return {
                icon: isRogue ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: #f43f5e;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: var(--color-primary);"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/></svg>`,
                title: isRogue ? "Rogue Discovered Node" : "Smart Leaf Node",
                ip: "192.168.1.XX",
                mac: macAddress,
                type: isRogue ? "Rogue Threat Vector" : "IoT Leaf Node",
                vendor: "Unverified Vendor",
                os: "FreeRTOS v10.4.3",
                status: isRogue ? "Compromised" : status,
                statusClass: isRogue ? "compromised" : statusClass,
                statusColor: isRogue ? "#f43f5e" : statusColor,
                vulnerabilities: isRogue ? "1 High (Unauthenticated MAC)" : vulnerabilities,
                vulnColor: isRogue ? "#f43f5e" : vulnColor,
                ports: "8125 (ESP-NOW)",
                lastSeen: "Active"
            };
        }
 
        return {
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px; height:22px; stroke: #64748b;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
            title: "Unknown Device",
            ip: "0.0.0.0",
            mac: "00:00:00:00:00:00",
            type: "Unknown",
            vendor: "Generic",
            os: "Unknown",
            status: "Offline",
            statusClass: "offline",
            statusColor: "#64748b",
            vulnerabilities: "Unknown",
            vulnColor: "#64748b",
            ports: "None",
            lastSeen: "Offline"
        };
    }

    getAttackVulnerabilityLabel() {
        const info = ATTACKS[this.activeAttackId];
        return info ? info.name : "Threat Vector";
    }

    toggleViewportMode(mode, targetBtn) {
        // Toggle view active class
        const buttons = document.querySelectorAll('.toolbar-btn');
        buttons.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');

        const listOverlay = document.getElementById('topology-list-overlay');
        if (!listOverlay) return;

        if (mode === '3d') {
            listOverlay.classList.add('hidden');
            if (this.topology) {
                this.topology.controls.enableRotate = true;
                this.topology.resetView();
            }
        } else if (mode === 'topo') {
            listOverlay.classList.add('hidden');
            if (this.topology) {
                this.topology.controls.enableRotate = false;
                // Snap camera straight down, looking at the center
                this.topology.camera.position.set(0, 155, 0.1); // Small Z offset keeps up-vector aligned
                this.topology.controls.target.set(0, 0, 0);
                this.topology.controls.update();
            }
        } else if (mode === 'list') {
            listOverlay.classList.remove('hidden');
            this.updateListViewTable();
        }

        this.logToConsole(`Viewport coordinate view mode: ${mode.toUpperCase()}`, 'info');
    }

    updateListViewTable() {
        const tbody = document.getElementById('list-view-table-body');
        if (!tbody || !this.topology) return;

        let rowsHTML = '';
        
        // Loop through Node A, Node B, and Attacker
        this.topology.nodes.forEach((node, nodeId) => {
            const details = this.getNodeDetailsData(nodeId);
            rowsHTML += `
                <tr>
                    <td style="font-weight: 700; color: var(--color-primary);">${details.icon} ${details.title}</td>
                    <td><code>${details.ip}</code></td>
                    <td><code>${details.mac}</code></td>
                    <td>${details.type}</td>
                    <td><span class="node-status-badge ${details.statusClass}">${details.status}</span></td>
                    <td style="color: ${details.vulnColor};">${details.vulnerabilities}</td>
                </tr>
            `;
        });

        // Loop through DDoS Bots if active
        if (this.topology.ddosBots) {
            this.topology.ddosBots.forEach(bot => {
                const botIdx = parseInt(bot.id.split('-')[1]) + 1;
                rowsHTML += `
                    <tr>
                        <td style="font-weight: 700; color: var(--color-danger);">🤖 BOT ${botIdx}</td>
                        <td><code>192.168.1.XX</code></td>
                        <td><code>Auto-Discovered</code></td>
                        <td>DDoS Botnet Node</td>
                        <td><span class="node-status-badge compromised">COMPROMISED</span></td>
                        <td style="color: #f43f5e;">1 Critical (Infected Zombie Bot)</td>
                    </tr>
                `;
            });
        }

        // Loop through Rogue Node if active
        if (this.topology.rogueNode) {
            rowsHTML += `
                <tr>
                    <td style="font-weight: 700; color: var(--color-danger);">⚠️ Rogue Node</td>
                    <td><code>192.168.1.XX</code></td>
                    <td><code>Auto-Discovered</code></td>
                    <td>Rogue Threat Vector</td>
                    <td><span class="node-status-badge compromised">UNAUTHORIZED</span></td>
                    <td style="color: #f43f5e;">1 High (Unauthenticated Hardware)</td>
                </tr>
            `;
        }

        // Loop through Sybil identity nodes if active
        if (this.topology.sybilGhosts) {
            this.topology.sybilGhosts.forEach((ghost, idx) => {
                rowsHTML += `
                    <tr>
                        <td style="font-weight: 700; color: var(--color-primary);">👻 SYBIL ID ${idx + 1}</td>
                        <td><code>192.168.1.XX</code></td>
                        <td><code>Spoofed Address</code></td>
                        <td>Virtual Sybil Identity</td>
                        <td><span class="node-status-badge healthy">ONLINE</span></td>
                        <td style="color: var(--color-success);">None (Spoofed Trust Badge)</td>
                    </tr>
                `;
            });
        }

        tbody.innerHTML = rowsHTML;
    }

    updateZoomDisplay(overridePct = null) {
        const zoomVal = document.getElementById('zoom-val');
        if (!zoomVal) return;
        
        if (overridePct) {
            zoomVal.innerText = `${overridePct}%`;
            return;
        }

        // Approximate zoom display percentage based on camera position
        const dist = this.topology.camera.position.distanceTo(this.topology.controls.target);
        const baseDist = 180;
        const pct = Math.min(250, Math.max(20, Math.round(baseDist / dist * 100)));
        zoomVal.innerText = `${pct}%`;
    }

    updateExplanationPanel() {
        const info = ATTACKS[this.activeAttackId];
        const body = document.getElementById('attack-info-body');
        if (!info || !body) return;

        body.innerHTML = `
            <p style="font-weight: 800; color: var(--color-primary); margin-bottom: 5px;">${info.name.toUpperCase()}</p>
            <p style="font-size: 11px; color: var(--color-text-muted); margin-bottom: 10px; letter-spacing: 0.5px;">LAYER: ${info.layer.toUpperCase()}</p>
            <p style="margin-bottom: 12px; color: var(--color-text-main); font-size: 13.5px;">${info.explanation}</p>
            <div style="background: rgba(255,255,255,0.02); border-left: 2px solid var(--color-primary); padding: 8px 10px; font-size: 13px;">
                <span style="font-weight: bold; color: var(--color-text-muted);">INSTRUCTION:</span> ${info.simInstructions}
            </div>
        `;
    }

    renderControlDock() {
        const info = ATTACKS[this.activeAttackId];
        const container = document.getElementById('dynamic-controls');
        if (!info || !container) return;

        container.innerHTML = info.defaultControls;
        this.bindDynamicControlInputs();
    }

    bindDynamicControlInputs() {
        const container = document.getElementById('dynamic-controls');
        const inputs = container.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            const key = this.kebabToCamel(input.id.replace('ctrl-', ''));
            
            input.addEventListener('input', (e) => {
                const val = e.target.value;
                this.simulator.updateControl(key, val);

                const valSpan = document.getElementById(`${e.target.id}-val`);
                if (valSpan) {
                    if (e.target.id === 'ctrl-dos-rate') valSpan.innerText = `${val} pps`;
                    else if (e.target.id === 'ctrl-replay-delay') valSpan.innerText = `${val}s`;
                    else if (e.target.id === 'ctrl-ddos-bots') valSpan.innerText = `${val} bots`;
                    else if (e.target.id === 'ctrl-jam-power') valSpan.innerText = `${val} dBm`;
                    else if (e.target.id === 'ctrl-sybil-ghosts') valSpan.innerText = `${val} nodes`;
                    else if (e.target.id === 'ctrl-manip-scale') valSpan.innerText = `${val > 0 ? '+' : ''}${val}°C`;
                    else if (e.target.id === 'ctrl-timing-chars') valSpan.innerText = `${val} chars`;
                    else if (e.target.id === 'ctrl-delay-ms') valSpan.innerText = `${val} ms`;
                }

                if (this.activeAttackId === 13 && e.target.id === 'ctrl-sybil-ghosts' && this.isAttackActive) {
                    this.topology.triggerAttack(true);
                }
                if (e.target.id === 'ctrl-route-type') {
                    this.topology.updateLinks();
                    this.updateFlowExplanationBanner();
                }
            });
        });
    }

    updateSidebarMetrics(latest) {
        document.getElementById('metric-cpu-val').innerText = `${latest.cpu}%`;
        document.getElementById('metric-cpu-bar').style.width = `${latest.cpu}%`;

        const heapKB = Math.round(latest.heap);
        const heapPct = Math.min(100, Math.max(0, Math.round(heapKB / 300 * 100)));
        document.getElementById('metric-heap-val').innerText = `${heapKB} KB`;
        document.getElementById('metric-heap-bar').style.width = `${heapPct}%`;

        const rssiVal = latest.rssi;
        const rssiPct = Math.min(100, Math.max(0, Math.round((rssiVal + 120) / 90 * 100)));
        document.getElementById('metric-rssi-val').innerText = `${rssiVal} dBm`;
        document.getElementById('metric-rssi-bar').style.width = `${rssiPct}%`;

        let lossPct = 0;
        if (this.isAttackActive) {
            if (this.activeAttackId === 8) {
                lossPct = 100.0;
            } else if (this.activeAttackId === 12) {
                const rType = this.simulator.controlsState.routeType || "sinkhole";
                lossPct = rType === "blackhole" ? 100.0 : 5.0;
            } else if (this.activeAttackId === 6) {
                const rate = this.simulator.controlsState.dosRate || 500;
                lossPct = parseFloat((rate / 1000 * 25 + Math.random() * 2).toFixed(1));
            } else if (this.activeAttackId === 7) {
                const bots = this.simulator.controlsState.ddosBots || 6;
                lossPct = parseFloat((bots * 4.5 + Math.random() * 2).toFixed(1));
            } else if (this.activeAttackId === 17) {
                lossPct = 4.0;
            } else {
                lossPct = parseFloat((Math.random() * 1.5).toFixed(1));
            }
        } else {
            lossPct = parseFloat((Math.random() * 0.4).toFixed(1));
        }

        document.getElementById('metric-loss-val').innerText = `${lossPct}%`;
        document.getElementById('metric-loss-bar').style.width = `${lossPct}%`;

        const nodeCount = this.serial.discoveredNodes.size > 0 
            ? this.serial.discoveredNodes.size 
            : this.topology.nodes.size;
        document.getElementById('metric-nodes-val').innerText = `${nodeCount} Nodes`;
    }

    exportConsoleLogs() {
        const consoleBody = document.getElementById('console-log-body');
        if (!consoleBody) return;

        const lines = Array.from(consoleBody.querySelectorAll('.timeline-msg')).map(l => {
            const time = l.parentElement.querySelector('.timeline-time')?.innerText || '';
            return `[${time}] ${l.innerText}`;
        });
        
        if (lines.length === 0) {
            this.logToConsole("Cannot export: Logs are currently empty.", "error");
            return;
        }

        const logText = lines.join("\n");
        const blob = new Blob([logText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `cps_testbed_log_${timestamp}.txt`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.logToConsole(`Successfully exported logs to file: ${filename}`, "success");
    }

    logToConsole(message, type = 'info') {
        const consoleBody = document.getElementById('console-log-body');
        if (!consoleBody) return;

        const time = new Date().toLocaleTimeString();
        
        // Pick dot color based on severity type
        let dotColor = 'green';
        if (type === 'error') dotColor = 'red';
        else if (type === 'alert') dotColor = 'orange';

        const line = document.createElement('div');
        line.className = 'timeline-event-item';
        line.innerHTML = `
            <div class="timeline-icon-col">
                <span class="timeline-dot dot-${dotColor}"></span>
                <span class="timeline-line-thread"></span>
            </div>
            <div class="timeline-content-col">
                <span class="timeline-time">${time}</span>
                <span class="timeline-msg">${message}</span>
            </div>
        `;

        consoleBody.appendChild(line);
        consoleBody.scrollTop = consoleBody.scrollHeight; // Scroll to bottom
    }

    triggerSimulationTick() {
        setInterval(() => {
            if (this.simulator.isActive) {
                // Active running loop ticks handled inside simulator
            } else {
                const current = ATTACKS[this.activeAttackId];
                if (current) {
                    const base = current.getDefaultTelemetry(0);
                    const telemetry = {
                        cpu: Math.max(2, Math.round(base.cpu / 2 + Math.random() * 2)),
                        heap: base.heap,
                        rssi: -50 + Math.round(Math.random() * 2),
                        latency: 4,
                        timestamp: Date.now()
                    };
                    this.simulator.telemetryHistory.push(telemetry);
                    if (this.simulator.telemetryHistory.length > 50) this.simulator.telemetryHistory.shift();
                    
                    this.charts.render(this.activeAttackId, this.simulator.telemetryHistory);
                    this.updateSidebarMetrics(telemetry);
                }
            }
        }, 1200);
    }

    kebabToCamel(str) {
        return str.replace(/-./g, x => x[1].toUpperCase());
    }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
