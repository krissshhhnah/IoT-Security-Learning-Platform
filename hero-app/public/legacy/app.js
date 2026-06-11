/**
 * Cyber-Twin Platform Coordinator
 * Wireframes state bindings, triggers, UI overlays, serial parsers, and WebGL animations.
 */

import { ATTACKS, AttackSimulator } from './simulator.js';
import { ThreeTopology } from './three-topology.js';
import { MetricsCharts } from './metrics-charts.js';
import { SerialGateway } from './serial-gateway.js';
import { EspBoard } from './esp-board.js';

const SVG_ICONS = {
    play: `<svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    pause: `<svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="4" x2="18" y2="20"></line><line x1="6" y1="4" x2="6" y2="20"></line></svg>`,
    spin: `<svg class="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`,
    cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`,
    antenna: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><path d="M2 20h.01M7 20h.01M12 20h.01M17 20h.01M22 20h.01M12 16v-4M8 12v-2M16 12v-2M12 8V4M5 4h14"></path></svg>`,
    server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    plug: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>`,
    terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
    camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    light: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>`,
    temp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    unknown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    bot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4M8 8h8"></path></svg>`,
    ghost: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="details-svg"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path></svg>`
};

class App {
    constructor() {
        this.simulator = new AttackSimulator();
        this.topology = null;
        this.charts = null;
        this.serial = new SerialGateway();
        
        this.socket = typeof io !== 'undefined' ? io('http://localhost:3001') : null;

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
            this.logToConsole("ISLP Platform initialized.", "success");
        }, 100);

        this.triggerSimulationTick();
        this.initScrollReveal();
        this.initDraggableToolbar();
        this.initHUDWindowManager();
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

        // Hero Launch SimLab CTA bindings
        const btnLaunchSimlabs = document.querySelectorAll('.islp-btn-launch-simlab');
        const workspace = document.querySelector('.workspace');
        btnLaunchSimlabs.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showDashboard();
            });
        });

        // All HUD window toggles are wired dynamically inside initHUDWindowManager

        // Dashboard back-to-home shortcut button
        const btnGotoHome = document.getElementById('btn-goto-home');
        if (btnGotoHome) {
            btnGotoHome.addEventListener('click', () => {
                this.showHero();
            });
        }

        // Hero Attack Card direct simulator links
        // Event listeners are now handled by React in LandingSections.tsx and App.tsx
        // React orchestrates the transition, shows the dashboard, and then calls switchAttack()

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
        document.getElementById('btn-view-3d').addEventListener('click', (e) => this.toggleViewportMode('3d', e.currentTarget));
        document.getElementById('btn-view-topo').addEventListener('click', (e) => this.toggleViewportMode('topo', e.currentTarget));
        document.getElementById('btn-view-list').addEventListener('click', (e) => this.toggleViewportMode('list', e.currentTarget));

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
        
        // Socket.io callbacks for backend sync
        if (this.socket) {
            this.socket.on('node_data', (data) => {
                if (data && data.message) {
                    this.serial.onLineReceived(data.message.toString());
                }
            });
            this.socket.on('connect', () => {
                this.logToConsole(`[SOCKET] Connected to backend server`, 'success');
            });
            this.socket.on('disconnect', () => {
                this.logToConsole(`[SOCKET] Disconnected from backend server`, 'error');
            });
        }

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

        // USB connect status update callback
        this.serial.onConnectionChange = (connected) => {
            if (connected) {
                this.serial.stopMockHardwareStream();
            } else {
                if (this.simulator.mode === 'twin') {
                    this.serial.startMockHardwareStream();
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

    initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Trigger animation once
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
        
        document.querySelectorAll('.islp-scroll-reveal').forEach(el => {
            observer.observe(el);
        });
    }

    initDraggableToolbar() {
        const toolbar = document.querySelector('.viewport-toolbar');
        const handle = document.getElementById('toolbar-drag-handle');
        const container = document.getElementById('three-container');
        if (!toolbar || !handle || !container) return;

        let isDragging = false;
        let startX, startY;
        let initialX, initialY;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            toolbar.style.transition = 'none'; // Disable transition while dragging
            
            // Get current positions relative to the container
            const rect = toolbar.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            initialX = rect.left - containerRect.left;
            initialY = rect.top - containerRect.top;
            
            startX = e.clientX;
            startY = e.clientY;
            
            // Remove transform centering when moving
            toolbar.style.transform = 'none';
            toolbar.style.left = `${initialX}px`;
            toolbar.style.top = `${initialY}px`;
            toolbar.style.bottom = 'auto'; // Remove bottom constraint
            
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            let newX = initialX + dx;
            let newY = initialY + dy;
            
            // Bounding constraints inside container
            const containerRect = container.getBoundingClientRect();
            const toolbarRect = toolbar.getBoundingClientRect();
            
            const maxX = containerRect.width - toolbarRect.width;
            const maxY = containerRect.height - toolbarRect.height;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            toolbar.style.left = `${newX}px`;
            toolbar.style.top = `${newY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                toolbar.style.transition = 'all 0.2s ease, left 0s, top 0s';
            }
        });
        
        // Touch support for tablets/mobile
        handle.addEventListener('touchstart', (e) => {
            isDragging = true;
            toolbar.style.transition = 'none';
            
            const rect = toolbar.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            initialX = rect.left - containerRect.left;
            initialY = rect.top - containerRect.top;
            
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            
            toolbar.style.transform = 'none';
            toolbar.style.left = `${initialX}px`;
            toolbar.style.top = `${initialY}px`;
            toolbar.style.bottom = 'auto';
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            
            let newX = initialX + dx;
            let newY = initialY + dy;
            
            const containerRect = container.getBoundingClientRect();
            const toolbarRect = toolbar.getBoundingClientRect();
            
            const maxX = containerRect.width - toolbarRect.width;
            const maxY = containerRect.height - toolbarRect.height;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            toolbar.style.left = `${newX}px`;
            toolbar.style.top = `${newY}px`;
        });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                toolbar.style.transition = 'all 0.2s ease, left 0s, top 0s';
            }
        });

        // Keep inside bounds on window resize
        window.addEventListener('resize', () => {
            if (toolbar.style.position === 'absolute' && toolbar.style.bottom === 'auto') {
                const containerRect = container.getBoundingClientRect();
                const toolbarRect = toolbar.getBoundingClientRect();
                
                let currentLeft = parseFloat(toolbar.style.left) || 0;
                let currentTop = parseFloat(toolbar.style.top) || 0;
                
                const maxX = containerRect.width - toolbarRect.width;
                const maxY = containerRect.height - toolbarRect.height;
                
                toolbar.style.top = `${currentTop}px`;
            }
        });
    }

    initHUDWindowManager() {
        const windows = document.querySelectorAll('.hud-window');
        let topZIndex = 10;

        const bringToFront = (win) => {
            topZIndex++;
            win.style.zIndex = topZIndex;
        };

        windows.forEach(win => {
            const header = win.querySelector('.hud-window-header');
            if (!header) return;

            // Draggability
            let isDragging = false;
            let startX, startY;
            let startLeft, startTop;

            header.addEventListener('mousedown', (e) => {
                // Don't drag if clicking action buttons or controls inside header
                if (e.target.closest('.hud-window-btn') || e.target.closest('.console-actions-group') || e.target.closest('button')) return;

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                
                // Get offset position
                const rect = win.getBoundingClientRect();
                const containerRect = document.querySelector('.workspace').getBoundingClientRect();
                
                startLeft = rect.left - containerRect.left;
                startTop = rect.top - containerRect.top;

                bringToFront(win);
                header.style.cursor = 'grabbing';
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                let newLeft = startLeft + dx;
                let newTop = startTop + dy;

                const containerRect = document.querySelector('.workspace').getBoundingClientRect();
                const rect = win.getBoundingClientRect();

                // Viewport constraints
                const maxX = containerRect.width - rect.width;
                const maxY = containerRect.height - rect.height;

                newLeft = Math.max(0, Math.min(newLeft, maxX));
                newTop = Math.max(0, Math.min(newTop, maxY));

                win.style.left = `${newLeft}px`;
                win.style.top = `${newTop}px`;
                win.style.bottom = 'auto';
                win.style.right = 'auto';
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    header.style.cursor = 'grab';
                }
            });

            // Touch support for mobile/tablets
            header.addEventListener('touchstart', (e) => {
                if (e.target.closest('.hud-window-btn') || e.target.closest('.console-actions-group') || e.target.closest('button')) return;

                isDragging = true;
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                
                const rect = win.getBoundingClientRect();
                const containerRect = document.querySelector('.workspace').getBoundingClientRect();
                
                startLeft = rect.left - containerRect.left;
                startTop = rect.top - containerRect.top;

                bringToFront(win);
                e.preventDefault();
            }, { passive: false });

            document.addEventListener('touchmove', (e) => {
                if (!isDragging) return;

                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;

                let newLeft = startLeft + dx;
                let newTop = startTop + dy;

                const containerRect = document.querySelector('.workspace').getBoundingClientRect();
                const rect = win.getBoundingClientRect();

                const maxX = containerRect.width - rect.width;
                const maxY = containerRect.height - rect.height;

                newLeft = Math.max(0, Math.min(newLeft, maxX));
                newTop = Math.max(0, Math.min(newTop, maxY));

                win.style.left = `${newLeft}px`;
                win.style.top = `${newTop}px`;
                win.style.bottom = 'auto';
                win.style.right = 'auto';
            }, { passive: false });

            document.addEventListener('touchend', () => {
                if (isDragging) {
                    isDragging = false;
                }
            });

            // Focus on Click
            win.addEventListener('pointerdown', () => {
                bringToFront(win);
            });

            // Minimize button click
            const minBtn = header.querySelector('.hud-window-minimize');
            if (minBtn) {
                minBtn.addEventListener('click', () => {
                    win.classList.toggle('minimized');
                    if (win.id === 'window-telemetry' && this.charts) {
                        setTimeout(() => this.charts.resize(), 50);
                    }
                });
            }

            // Close button click
            const closeBtn = header.querySelector('.hud-window-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    win.classList.add('hidden');
                    const toggleBtnId = `btn-toggle-${win.id}`;
                    const toggleBtn = document.getElementById(toggleBtnId);
                    if (toggleBtn) {
                        toggleBtn.classList.remove('active');
                    }
                });
            }

            // Double click header to minimize
            header.addEventListener('dblclick', (e) => {
                if (e.target.closest('.hud-window-btn') || e.target.closest('button')) return;
                win.classList.toggle('minimized');
                if (win.id === 'window-telemetry' && this.charts) {
                    setTimeout(() => this.charts.resize(), 50);
                }
            });
        });

        // Dock Toggles
        const dockToggles = {
            'btn-toggle-window-attacks': 'window-attacks',
            'btn-toggle-window-controls': 'window-controls',
            'btn-toggle-window-telemetry': 'window-telemetry',
            'btn-toggle-window-logs': 'window-logs',
            'btn-toggle-window-theory': 'window-theory',
            'btn-toggle-window-board': 'window-board'
        };

        Object.entries(dockToggles).forEach(([btnId, winId]) => {
            const btn = document.getElementById(btnId);
            const win = document.getElementById(winId);
            if (btn && win) {
                btn.addEventListener('click', () => {
                    const isHidden = win.classList.contains('hidden');
                    if (isHidden) {
                        win.classList.remove('hidden');
                        btn.classList.add('active');
                        bringToFront(win);
                        if (winId === 'window-telemetry' && this.charts) {
                            setTimeout(() => this.charts.resize(), 50);
                        }
                    } else {
                        win.classList.add('hidden');
                        btn.classList.remove('active');
                    }
                });
            }
        });
    }

    showDashboard() {
        // 1. Ensure all default HUD windows are visible on entry
        document.querySelectorAll('.hud-window').forEach(win => {
            if (win.id === 'window-board') {
                if (this.activeAttackId === 16) {
                    win.classList.remove('hidden');
                    document.getElementById('btn-toggle-window-board')?.classList.add('active');
                } else {
                    win.classList.add('hidden');
                    document.getElementById('btn-toggle-window-board')?.classList.remove('active');
                }
            } else {
                win.classList.remove('hidden');
                const btnId = `btn-toggle-${win.id}`;
                document.getElementById(btnId)?.classList.add('active');
            }
        });

        // 2. Trigger the high-tech transition splash screen
        const splash = document.getElementById('transition-splash');
        const progressBar = document.getElementById('splash-progress-bar');
        const consoleBox = document.getElementById('splash-status-console');
        
        if (splash && progressBar && consoleBox) {
            splash.classList.remove('hidden');
            progressBar.style.width = '0%';
            consoleBox.innerHTML = '<div class="console-line line-active">> Starting platform engine...</div>';
            
            const steps = [
                { time: 350, progress: '25%', msg: '> Initializing 3D WebGL engine modules...', successMsg: '> 3D WebGL engine initialized.' },
                { time: 700, progress: '50%', msg: '> Syncing simulated ESP32 nodes...', successMsg: '> ESP32 node synchronization completed.' },
                { time: 1050, progress: '70%', msg: '> Establishing virtual ESP-NOW channels...', successMsg: '> ESP-NOW mesh channels established.' },
                { time: 1400, progress: '85%', msg: '> Securing digital twin communication pathways...', successMsg: '> Twin serial pipelines secured.' },
                { time: 1750, progress: '100%', msg: '> Launching SimLab Sandbox workspace...', successMsg: '> Workspace ready.' }
            ];
            
            steps.forEach((step, idx) => {
                setTimeout(() => {
                    // Update progress bar width
                    progressBar.style.width = step.progress;
                    
                    // Mark previous line as success
                    const activeLine = consoleBox.querySelector('.line-active');
                    if (activeLine) {
                        activeLine.classList.remove('line-active');
                        activeLine.classList.add('line-success');
                        if (steps[idx-1]) {
                            activeLine.innerText = steps[idx-1].successMsg;
                        } else {
                            activeLine.innerText = '> Platform engine started.';
                        }
                    }
                    
                    // Append new active loading message
                    const newLine = document.createElement('div');
                    newLine.className = 'console-line line-active';
                    newLine.innerText = step.msg;
                    consoleBox.appendChild(newLine);
                    consoleBox.scrollTop = consoleBox.scrollHeight;
                }, step.time);
            });
            
            // Final transition fade-out
            setTimeout(() => {
                splash.classList.add('hidden');
                
                // Switch visible views
                document.body.classList.add('dashboard-active');
                document.getElementById('dashboard-view').classList.remove('hidden');
                document.getElementById('hero-view').classList.add('hidden');
                
                // Recalculate dimensions for WebGL canvas and metrics charts now that container is visible
                setTimeout(() => {
                    if (this.topology) this.topology.onWindowResize();
                    if (this.charts) this.charts.resize();
                }, 50);
                
                this.logToConsole("Navigated to SimLab Sandbox.", "info");
            }, 2100);
            
        } else {
            // Fallback if elements don't exist
            document.body.classList.add('dashboard-active');
            document.getElementById('dashboard-view').classList.remove('hidden');
            document.getElementById('hero-view').classList.add('hidden');
            
            setTimeout(() => {
                if (this.topology) this.topology.onWindowResize();
                if (this.charts) this.charts.resize();
            }, 50);
            
            this.logToConsole("Navigated to SimLab Sandbox.", "info");
        }
    }

    showHero() {
        document.body.classList.remove('dashboard-active');
        document.getElementById('dashboard-view').classList.add('hidden');
        document.getElementById('hero-view').classList.remove('hidden');
        
        // Terminate any active attack simulation when returning to home screen
        if (this.isAttackActive) {
            this.stopActiveAttack();
        }
    }

    switchAttack(id) {
        this.activeAttackId = id;
        this.stopActiveAttack(); // Terminate previous loops

        // Sync active attack ID into React state so the Info modal stays up to date
        if (typeof window.__setReactAttackId === 'function') {
            window.__setReactAttackId(id);
        }

        this.simulator.setActiveAttack(id);
        this.topology.setAttackVector(id);
        this.updateExplanationPanel();
        this.renderControlDock();
        this.updateNodeDetailsPanel();
        this.updateFlowExplanationBanner();

        // Control board window visibility for Physical Access (16)
        const boardWin = document.getElementById('window-board');
        const boardBtn = document.getElementById('btn-toggle-window-board');
        if (id === 16) {
            boardWin?.classList.remove('hidden');
            boardBtn?.classList.add('active');
        } else {
            boardWin?.classList.add('hidden');
            boardBtn?.classList.remove('active');
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

        // Lock out unsupported attacks in TWIN mode
        const unsupportedTwinAttacks = [7, 12, 13, 15, 16];
        const navItems = document.querySelectorAll('.vector-item');
        navItems.forEach(item => {
            const id = parseInt(item.getAttribute('data-vector'));
            if (unsupportedTwinAttacks.includes(id)) {
                if (mode === 'twin') {
                    item.classList.add('opacity-30', 'cursor-not-allowed', 'locked-in-twin');
                    item.title = "It cannot be performed physically";
                    item.disabled = true;
                    if (!item.querySelector('.lock-icon')) {
                        const lock = document.createElement('span');
                        lock.className = 'lock-icon ml-auto text-neon-red flex items-center justify-center w-4 h-4';
                        lock.innerHTML = SVG_ICONS.lock;
                        item.appendChild(lock);
                    }
                } else {
                    item.classList.remove('opacity-30', 'cursor-not-allowed', 'locked-in-twin');
                    item.removeAttribute('title');
                    item.disabled = false;
                    const lock = item.querySelector('.lock-icon');
                    if (lock) lock.remove();
                }
            }
        });

        // If the currently selected attack becomes locked, fallback to a safe attack
        if (mode === 'twin' && unsupportedTwinAttacks.includes(this.activeAttackId)) {
            const fallbackItem = document.querySelector('.vector-item[data-vector="1"]');
            if (fallbackItem) {
                navItems.forEach(i => i.classList.remove('active'));
                fallbackItem.classList.add('active');
                this.switchAttack(1);
            }
        }

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
            btnPlay.querySelector('.btn-icon').innerHTML = SVG_ICONS.pause;
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
                if (this.socket) {
                    const attackInfo = ATTACKS[this.activeAttackId] || { name: 'Unknown' };
                    let payloadData = null;
                    const payloadInput = document.getElementById('custom-payload-input');
                    if (payloadInput && payloadInput.value.trim() !== '') {
                        payloadData = payloadInput.value.trim();
                        this.logToConsole(`[TX_SERIAL] Injecting Custom Payload: ${payloadData}`, "info");
                    }
                    this.socket.emit('trigger_attack', { 
                        attackId: this.activeAttackId, 
                        attackName: attackInfo.name,
                        customPayload: payloadData
                    });
                }
            }
        } else {
            // Visual Update to Play icon
            btnPlay.querySelector('.btn-icon').innerHTML = SVG_ICONS.play;
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
                if (this.socket) {
                    this.socket.emit('stop_attack', { attackId: this.activeAttackId });
                }
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
        btnPlay.querySelector('.btn-icon').innerHTML = SVG_ICONS.play;
        btnPlay.querySelector('.btn-text').innerText = "Launch";
        btnPlay.classList.remove('active');

        const badge = document.getElementById('sim-status-badge');
        badge.innerText = "● Idle";
        badge.className = "status-badge";

        this.topology.triggerAttack(false);
        this.topology.setCompromisedNode(null);
        
        if (this.simulator.mode === 'simulation') {
            this.simulator.stop();
        } else {
            if (this.socket) {
                this.socket.emit('stop_attack', { attackId: this.activeAttackId });
            }
        }
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
                statusIcon.innerHTML = SVG_ICONS.spin;
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
                icon: SVG_ICONS.cloud,
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
                icon: SVG_ICONS.antenna,
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
                icon: SVG_ICONS.server,
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
                icon: SVG_ICONS.terminal,
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
                icon: SVG_ICONS.camera,
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
                icon: SVG_ICONS.lock,
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
            };
        } else if (id === 'node-a') {
            return {
                icon: SVG_ICONS.plug,
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
                icon: SVG_ICONS.light,
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
                icon: SVG_ICONS.temp,
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
                icon: isRogue ? SVG_ICONS.warning : SVG_ICONS.light,
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
            icon: SVG_ICONS.unknown,
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
                        <td style="font-weight: 700; color: var(--color-danger);">${SVG_ICONS.bot} BOT ${botIdx}</td>
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
                    <td style="font-weight: 700; color: var(--color-danger);">${SVG_ICONS.warning} Rogue Node</td>
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
                        <td style="font-weight: 700; color: var(--color-primary);">${SVG_ICONS.ghost} SYBIL ID ${idx + 1}</td>
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
const checkReady = setInterval(() => {
    if (document.getElementById('three-container')) {
        clearInterval(checkReady);
        window.app = new App();
    }
}, 100);
