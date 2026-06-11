/**
 * Three.js 3D Spatial Topology Visualizer
 * Manages the WebGL scene, camera, lights, node meshes, packet particles, and attack-specific visual effects.
 */

export class ThreeTopology {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.nodes = new Map();
        this.links = [];
        this.particles = [];
        this.waveEmitters = [];
        this.warningCrosses = [];
        this.dynamicRipples = [];
        this.activeAttackId = null;
        this.attackTriggered = false;
        
        // Settings & Animations
        this.clock = new THREE.Clock();
        this.ticks = 0;

        this.init();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    init() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        const aspect = (h > 0) ? (w / h) : 1;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x07080b);
        this.scene.fog = new THREE.FogExp2(0x07080b, 0.003);

        // Camera
        this.camera = new THREE.PerspectiveCamera(50, aspect, 1, 1000);
        this.camera.position.set(0, 100, 150);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera going below ground
        this.controls.minDistance = 30;
        this.controls.maxDistance = 300;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(100, 100, 50);
        this.scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xff007f, 1, 100);
        pointLight.position.set(0, 30, 0);
        this.scene.add(pointLight);

        // 3D Grid Plane (representing 25 acres coordinate bounds)
        this.grid = new THREE.GridHelper(300, 30, 0xff007f, 0x1e293b);
        this.grid.position.y = -1;
        this.scene.add(this.grid);

        // HTML Node Labels Container
        this.labelsContainer = document.getElementById('node-labels-container');
        if (!this.labelsContainer) {
            this.labelsContainer = document.createElement('div');
            this.labelsContainer.id = 'node-labels-container';
            this.labelsContainer.style.position = 'absolute';
            this.labelsContainer.style.inset = '0';
            this.labelsContainer.style.pointerEvents = 'none';
            this.labelsContainer.style.zIndex = '5';
            this.container.appendChild(this.labelsContainer);
        }

        // Raycasting and selection mechanics
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.onNodeClicked = null;

        this.renderer.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        this.renderer.domElement.addEventListener('pointermove', (e) => this.onPointerMove(e));

        // Core Nodes (Node A, Node B, Attacker)
        this.setupDefaultNodes();
    }

    setupDefaultNodes() {
        // Clear old label DOM elements
        if (this.labelsContainer) {
            this.labelsContainer.innerHTML = '';
        }

        // Create the 3 network nodes: Node A (left), Node B (right), Attacker (middle-back)
        this.createNode('node-a', 'NODE A (192.168.1.XX)', -40, 0, 20, 0x00f0ff, 'smart-plug');
        this.createNode('node-b', 'NODE B (192.168.1.XX)', 40, 0, 20, 0x3b82f6, 'switch');
        this.createNode('attacker', 'ATTACKER (203.0.113.XX)', 0, 0, -20, 0xef4444, 'attacker');

        // Link lines
        this.updateLinks();
    }

    createCircularRipples(colorCode) {
        const group = new THREE.Group();
        group.position.set(0, 0.05, 0); // slightly above the grid plane to prevent z-fighting

        // Three concentric ring meshes
        const ringGeo1 = new THREE.RingGeometry(5.0, 5.3, 32);
        const ringGeo2 = new THREE.RingGeometry(8.0, 8.3, 32);
        const ringGeo3 = new THREE.RingGeometry(11.0, 11.2, 32);

        const mat1 = new THREE.MeshBasicMaterial({ color: colorCode, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const mat2 = new THREE.MeshBasicMaterial({ color: colorCode, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const mat3 = new THREE.MeshBasicMaterial({ color: colorCode, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });

        const r1 = new THREE.Mesh(ringGeo1, mat1);
        r1.rotation.x = Math.PI / 2;
        
        const r2 = new THREE.Mesh(ringGeo2, mat2);
        r2.rotation.x = Math.PI / 2;
        
        const r3 = new THREE.Mesh(ringGeo3, mat3);
        r3.rotation.x = Math.PI / 2;

        group.add(r1, r2, r3);

        // Add some radial grid markers
        const radialCount = 12;
        const radialGeo = new THREE.CylinderGeometry(0.04, 0.04, 2, 4);
        const radialMat = new THREE.MeshBasicMaterial({ color: colorCode, transparent: true, opacity: 0.4 });
        
        for (let i = 0; i < radialCount; i++) {
            const angle = (i / radialCount) * Math.PI * 2;
            const radialLine = new THREE.Mesh(radialGeo, radialMat);
            
            // position on a circle of radius 6.5
            radialLine.position.set(Math.sin(angle) * 6.5, 0, Math.cos(angle) * 6.5);
            radialLine.rotation.y = angle;
            radialLine.rotation.z = Math.PI / 2;
            group.add(radialLine);
        }

        return { group, rings: [r1, r2, r3] };
    }

    renderNodeLabelHTML(node) {
        const isAttacker = node.id === 'attacker' || node.id.includes('rogue') || node.id.includes('bot');
        const isCompromised = node.isCompromised;
        
        let name = 'NODE';
        let ip = '192.168.1.XX';
        
        if (node.id === 'node-a') {
            name = 'NODE A';
        } else if (node.id === 'node-b') {
            name = 'NODE B';
        } else if (node.id === 'attacker') {
            name = 'ATTACKER';
            ip = '203.0.113.XX';
        } else {
            name = node.label.split(' (')[0];
        }
        
        // Extract IP/MAC from label if available
        if (node.label && node.label.includes('(')) {
            const match = node.label.match(/\(([^)]+)\)/);
            if (match) {
                ip = match[1];
            }
        }
        
        let statusText = '• ONLINE';
        let statusClass = 'status-online';
        let borderClass = 'online';
        
        if (isCompromised) {
            statusText = '• COMPROMISED';
            statusClass = 'status-compromised';
            borderClass = 'compromised';
        } else if (isAttacker) {
            statusText = '• MALICIOUS';
            statusClass = 'status-malicious';
            borderClass = 'malicious';
        }
        
        const html = `
            <div class="label-name">${name}</div>
            <div class="label-ip">${ip}</div>
            <div class="label-status ${statusClass}">${statusText}</div>
        `;
        
        return { html, borderClass };
    }

    createNode(id, label, x, y, z, colorCode, role) {
        const group = new THREE.Group();
        group.position.set(x, y + 2.0, z); // Slightly floating above ripples

        // 1. Sleek circular coin stand for device
        const baseGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.6, 16);
        const baseMat = new THREE.MeshPhongMaterial({
            color: 0x0f172a,
            shininess: 90,
            specular: colorCode
        });
        const deviceBase = new THREE.Mesh(baseGeo, baseMat);
        deviceBase.position.y = 0.3;
        group.add(deviceBase);

        // 2. Custom device geometries representing sleek sensor hubs and gateways
        let deviceMesh;
        if (role === 'smart-plug') {
            // Node A: Sleek cylindrical sensor pod with cyan glowing status band
            deviceMesh = new THREE.Group();
            
            const podGeo = new THREE.CylinderGeometry(2.2, 2.2, 3.2, 16);
            const podMat = new THREE.MeshPhongMaterial({
                color: 0x334155, // slate grey casing
                shininess: 85,
                specular: 0x475569
            });
            const podBody = new THREE.Mesh(podGeo, podMat);
            podBody.position.y = 2.2;
            deviceMesh.add(podBody);

            const bandGeo = new THREE.CylinderGeometry(2.25, 2.25, 0.4, 16);
            const bandMat = new THREE.MeshPhongMaterial({
                color: 0x00f0ff,
                emissive: 0x00f0ff,
                emissiveIntensity: 1.2,
                shininess: 100
            });
            const statusBand = new THREE.Mesh(bandGeo, bandMat);
            statusBand.position.y = 2.2;
            deviceMesh.add(statusBand);

            // Antenna
            const antGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.0, 8);
            const antMat = new THREE.MeshPhongMaterial({ color: 0x0f172a });
            const antenna = new THREE.Mesh(antGeo, antMat);
            antenna.position.set(-1.0, 3.5, -1.0);
            antenna.rotation.x = -0.05;
            deviceMesh.add(antenna);

            // Sensor Dome
            const domeGeo = new THREE.SphereGeometry(1.0, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const domeMat = new THREE.MeshPhongMaterial({
                color: 0xf8fafc,
                shininess: 100,
                specular: 0xffffff
            });
            const dome = new THREE.Mesh(domeGeo, domeMat);
            dome.position.y = 3.8;
            deviceMesh.add(dome);
        } else if (role === 'switch') {
            // Node B: Sleek square gateway receiver hub with dual diversity antennas
            deviceMesh = new THREE.Group();
            
            const gateGeo = new THREE.BoxGeometry(4.8, 2.8, 4.8);
            const gateMat = new THREE.MeshPhongMaterial({
                color: 0x1e293b, // dark slate
                shininess: 85,
                specular: 0x334155
            });
            const gateBody = new THREE.Mesh(gateGeo, gateMat);
            gateBody.position.y = 2.0;
            deviceMesh.add(gateBody);

            const bandGeo = new THREE.BoxGeometry(4.88, 0.35, 4.88);
            const bandMat = new THREE.MeshPhongMaterial({
                color: 0x3b82f6, // blue/cyan colorCode
                emissive: 0x3b82f6,
                emissiveIntensity: 1.2,
                shininess: 100
            });
            const statusBand = new THREE.Mesh(bandGeo, bandMat);
            statusBand.position.y = 2.0;
            deviceMesh.add(statusBand);

            // Dual antennas
            const antGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.5, 8);
            const antMat = new THREE.MeshPhongMaterial({ color: 0x0f172a });
            
            const ant1 = new THREE.Mesh(antGeo, antMat);
            ant1.position.set(-1.6, 3.65, -1.6);
            ant1.rotation.x = -0.08;
            
            const ant2 = ant1.clone();
            ant2.position.x = 1.6;
            
            deviceMesh.add(ant1, ant2);

            // Cap dome
            const capGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.4, 16);
            const capMat = new THREE.MeshPhongMaterial({
                color: 0x334155,
                shininess: 80
            });
            const cap = new THREE.Mesh(capGeo, capMat);
            cap.position.y = 3.6;
            deviceMesh.add(cap);
        } else if (role === 'attacker') {
            // Attacker: Sleek red hacker gateway hub with red glowing antennas and indicators
            deviceMesh = new THREE.Group();
            
            const hubGeo = new THREE.BoxGeometry(6.5, 2.2, 4.5);
            const hubMat = new THREE.MeshPhongMaterial({
                color: 0x090d16, // deep charcoal black
                shininess: 95,
                specular: 0xef4444
            });
            const hubBody = new THREE.Mesh(hubGeo, hubMat);
            hubBody.position.y = 1.7;
            deviceMesh.add(hubBody);

            const antGeo = new THREE.CylinderGeometry(0.12, 0.12, 5.0, 8);
            const antMat = new THREE.MeshPhongMaterial({
                color: 0xef4444,
                emissive: 0xef4444,
                emissiveIntensity: 0.8
            });
            const ant1 = new THREE.Mesh(antGeo, antMat);
            ant1.position.set(-2.2, 3.8, -1.5);
            ant1.rotation.x = -0.05;

            const ant2 = ant1.clone();
            ant2.position.x = 2.2;

            const barGeo = new THREE.BoxGeometry(5.2, 0.3, 0.15);
            const barMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
            const lightBar = new THREE.Mesh(barGeo, barMat);
            lightBar.position.set(0, 1.7, 2.26);

            deviceMesh.add(ant1, ant2, lightBar);
        } else {
            // Default generic/rogue pod: a compact red/cyan sensor sphere pod
            deviceMesh = new THREE.Group();
            
            const podGeo = new THREE.SphereGeometry(2.4, 16, 16);
            const podMat = new THREE.MeshPhongMaterial({
                color: colorCode,
                emissive: colorCode,
                emissiveIntensity: 0.2,
                shininess: 85
            });
            const pod = new THREE.Mesh(podGeo, podMat);
            pod.position.y = 2.4;
            deviceMesh.add(pod);

            const antGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);
            const antMat = new THREE.MeshPhongMaterial({ color: 0x0f172a });
            const antenna = new THREE.Mesh(antGeo, antMat);
            antenna.position.set(0, 4.0, 0);
            deviceMesh.add(antenna);
        }

        group.add(deviceMesh);
        this.scene.add(group);

        // 3. Concentric Ripple Rings (Flat on the ground)
        const { group: rippleGroup, rings } = this.createCircularRipples(colorCode);
        rippleGroup.position.set(x, 0.02, z);
        this.scene.add(rippleGroup);

        // Create HTML screen-space text label container
        const labelDiv = document.createElement('div');
        labelDiv.id = `label-${id}`;
        labelDiv.className = 'node-label';
        
        // Initial formatting of HTML content
        const { html, borderClass } = this.renderNodeLabelHTML({ id, label, isCompromised: false });
        labelDiv.innerHTML = html;
        labelDiv.className = `node-label ${borderClass}`;
        this.labelsContainer.appendChild(labelDiv);

        this.nodes.set(id, {
            id,
            label,
            colorCode,
            mesh: group,
            deviceMesh,
            deviceBase,
            rippleGroup,
            rippleRings: rings,
            basePos: new THREE.Vector3(x, y + 2.0, z),
            isCompromised: false
        });
    }

    removeNode(id) {
        const node = this.nodes.get(id);
        if (node) {
            this.scene.remove(node.mesh);
            if (node.rippleGroup) {
                this.scene.remove(node.rippleGroup);
            }
            const labelDiv = document.getElementById(`label-${id}`);
            if (labelDiv) labelDiv.remove();
            this.nodes.delete(id);
            this.updateLinks();
        }
    }

    registerDynamicNode(mac, role, x, z) {
        const id = `mac-${mac}`;
        if (this.nodes.has(id)) return;

        let color = 0x00f0ff; 
        if (role === 'attacker' || role === 'rogue') color = 0xef4444;

        this.createNode(id, `${role.toUpperCase()} (${mac.substring(12)})`, x, 0, z, color, role);
        this.updateLinks();

        this.spawnBurst(new THREE.Vector3(x, 6, z), color, 40);
    }

    updateLinks() {
        // Remove old link visuals
        this.links.forEach(l => this.scene.remove(l.mesh));
        this.links = [];

        // Clear warning crosses
        if (this.warningCrosses) {
            this.warningCrosses.forEach(cross => this.scene.remove(cross));
        }
        this.warningCrosses = [];

        const nodeA = this.nodes.get('node-a');
        const nodeB = this.nodes.get('node-b');
        const attacker = this.nodes.get('attacker');

        if (!nodeA || !nodeB || !attacker) return;

        const isTriggered = this.attackTriggered;
        const attackId = this.activeAttackId;

        if (isTriggered) {
            switch (attackId) {
                case 1: // MitM: A -> Attacker -> B (direct link is broken)
                case 10: // Session Hijacking
                case 12: // Routing Attack (Sinkhole or Blackhole)
                case 14: // Sensor Data Manipulation
                case 17: // Delay
                    {
                        const isBlackhole = (attackId === 12 && window.app?.simulator?.controlsState?.routeType === 'blackhole');
                        
                        // Direct communication is hijacked/broken
                        this.createSplineLink(nodeA.mesh.position, nodeB.mesh.position, 0x4b5563, 'normal-inactive', true);

                        // Link A -> Attacker (normal colored)
                        let color1 = 0x00f0ff;
                        if (attackId === 1) color1 = 0xf59e0b; // MitM warning color
                        this.createSplineLink(nodeA.mesh.position, attacker.mesh.position, color1, 'normal');
                        
                        // Link Attacker -> B
                        if (!isBlackhole) {
                            let color2 = 0xef4444;
                            if (attackId === 17) color2 = 0xf59e0b; // Delay link is amber warning
                            this.createSplineLink(attacker.mesh.position, nodeB.mesh.position, color2, 'attack');
                        } else {
                            // Blackhole drops packets at Attacker (Attacker -> B is broken)
                            this.createSplineLink(attacker.mesh.position, nodeB.mesh.position, 0xef4444, 'attack-inactive', true);
                        }
                    }
                    break;

                case 4: // Spoofing: Attacker -> B (cyan spoofed link) and A -> B (inactive and broken)
                    this.createSplineLink(attacker.mesh.position, nodeB.mesh.position, 0x00f0ff, 'normal');
                    this.createSplineLink(nodeA.mesh.position, nodeB.mesh.position, 0x4b5563, 'normal-inactive', true);
                    break;

                case 8: // Jamming: A -> B (amber interrupted/broken link)
                    this.createSplineLink(nodeA.mesh.position, nodeB.mesh.position, 0xf59e0b, 'normal', true);
                    this.createSplineLink(attacker.mesh.position, nodeB.mesh.position, 0xef4444, 'attack-inactive');
                    break;

                case 2: // Eavesdropping
                case 3: // Replay
                case 9: // Credential Theft
                case 15: // Timing
                    {
                        // Normal active links
                        this.createSplineLink(nodeA.mesh.position, nodeB.mesh.position, 0x00f0ff, 'normal');
                        
                        // Sniffing interception channel from midpoint to Attacker
                        const midAB = new THREE.Vector3().addVectors(nodeA.mesh.position, nodeB.mesh.position).multiplyScalar(0.5);
                        this.createSplineLink(midAB, attacker.mesh.position, 0xf59e0b, 'intercept');
                        
                        // Replay active replay stream link
                        if (attackId === 3) {
                            this.createSplineLink(attacker.mesh.position, nodeB.mesh.position, 0xef4444, 'attack');
                        }
                    }
                    break;

                case 5: // Packet Injection
                case 6: // DoS
                    this.createSplineLink(nodeA.mesh.position, nodeB.mesh.position, 0x00f0ff, 'normal');
                    this.createSplineLink(attacker.mesh.position, nodeB.mesh.position, 0xef4444, 'attack');
                    break;

                case 7: // DDoS
                    this.createSplineLink(nodeA.mesh.position, nodeB.mesh.position, 0x00f0ff, 'normal');
                    break;

                case 11: // Rogue Insertion
                    this.createSplineLink(nodeA.mesh.position, nodeB.mesh.position, 0x00f0ff, 'normal');
                    break;

                case 13: // Sybil
                    this.createSplineLink(nodeA.mesh.position, nodeB.mesh.position, 0x00f0ff, 'normal');
                    break;

                case 16: // Physical Access: Direct link is broken/inactive
                    this.createSplineLink(nodeA.mesh.position, nodeB.mesh.position, 0x4b5563, 'normal-inactive', true);
                    break;

                default:
                    this.createSplineLink(nodeA.mesh.position, nodeB.mesh.position, 0x00f0ff, 'normal');
                    this.createSplineLink(attacker.mesh.position, nodeB.mesh.position, 0xef4444, 'attack-inactive');
                    break;
            }
        } else {
            // Default inactive state
            this.createSplineLink(nodeA.mesh.position, nodeB.mesh.position, 0x00f0ff, 'normal');
            this.createSplineLink(attacker.mesh.position, nodeB.mesh.position, 0xef4444, 'attack-inactive');
        }

        // Add secondary links for dynamic hardware nodes
        this.nodes.forEach((node, id) => {
            if (id.startsWith('mac-')) {
                const linkColor = node.colorCode === 0xef4444 ? 0xef4444 : 0x00f0ff;
                const linkType = node.colorCode === 0xef4444 ? 'attack' : 'normal';
                this.createSplineLink(node.mesh.position, nodeB.mesh.position, linkColor, linkType);
            }
        });
    }

    createWarningCross(pos) {
        const group = new THREE.Group();
        group.position.copy(pos);
        group.position.y += 1.5; // Lift slightly above spline arc

        // High visibility bright warning red material
        const mat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        
        // Two intersecting cylinders representing X indicator
        const barGeo = new THREE.CylinderGeometry(0.3, 0.3, 4.0, 8);
        
        const bar1 = new THREE.Mesh(barGeo, mat);
        bar1.rotation.z = Math.PI / 4;
        
        const bar2 = new THREE.Mesh(barGeo, mat);
        bar2.rotation.z = -Math.PI / 4;

        group.add(bar1, bar2);
        this.scene.add(group);
        this.warningCrosses.push(group);
    }

    createSplineLink(start, end, colorCode, type = 'normal', isBroken = false) {
        const points = [];
        points.push(start);
        
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        mid.y += 12; // Curve arc
        points.push(mid);
        points.push(end);

        const curve = new THREE.CatmullRomCurve3(points);
        const curvePoints = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        
        let opacity = 0.4;
        if (type === 'attack-inactive' || type === 'normal-inactive') {
            opacity = 0.08;
        } else if (type === 'attack') {
            opacity = 0.7;
        } else if (type === 'intercept') {
            opacity = 0.4;
        }

        let material;
        if (isBroken) {
            // High visibility dashed warning line
            material = new THREE.LineDashedMaterial({
                color: colorCode,
                dashSize: 3,
                gapSize: 2,
                transparent: true,
                opacity: 0.55
            });
        } else {
            material = new THREE.LineBasicMaterial({
                color: colorCode,
                transparent: true,
                opacity: opacity,
                linewidth: 1
            });
        }
        
        const line = new THREE.Line(geometry, material);
        if (isBroken) {
            line.computeLineDistances();
        }
        this.scene.add(line);
        this.links.push({ mesh: line, curve, type, isBroken });

        if (isBroken) {
            this.createWarningCross(mid);
        }
    }

    setThemeColors() {
        const style = getComputedStyle(document.documentElement);
        const bgColor = style.getPropertyValue('--color-bg').trim() || '#0d0e12';
        const primaryColor = style.getPropertyValue('--color-primary').trim() || '#ff007f';
        
        this.scene.background = new THREE.Color(bgColor);
        this.scene.fog.color = new THREE.Color(bgColor);
        this.grid.material.color = new THREE.Color(primaryColor);
        this.renderer.setClearColor(bgColor);
    }

    setAttackVector(id) {
        this.activeAttackId = parseInt(id);
        this.attackTriggered = false;
        
        this.clearAttackOverlays();
        
        // Reset all compromised flags and node colors
        this.setCompromisedNode(null);
        this.updateLinks();
    }

    triggerAttack(triggered) {
        this.attackTriggered = triggered;
        this.clearAttackOverlays();
        this.updateLinks();

        if (triggered) {
            this.initSpecializedAttackVisuals();
        }
    }

    initSpecializedAttackVisuals() {
        const nodeA = this.nodes.get('node-a');
        const nodeB = this.nodes.get('node-b');
        const attacker = this.nodes.get('attacker');

        if (!nodeA || !nodeB || !attacker) return;

        // Jamming (8) dome: soft translucent solid red sphere
        if (this.activeAttackId === 8) {
            const domeGeo = new THREE.SphereGeometry(35, 24, 24);
            const domeMat = new THREE.MeshBasicMaterial({
                color: 0xff073a,
                transparent: true,
                opacity: 0.05
            });
            this.jammingDome = new THREE.Mesh(domeGeo, domeMat);
            this.jammingDome.position.copy(attacker.mesh.position);
            this.scene.add(this.jammingDome);
        }

        // DDoS (7): Spawns 3 small solid "bot" meshes around B
        if (this.activeAttackId === 7) {
            this.ddosBots = [];
            const offsets = [
                { x: -25, z: -15 },
                { x: 25, z: -15 },
                { x: 0, z: -35 }
            ];

            offsets.forEach((offset, idx) => {
                const botGroup = new THREE.Group();
                const x = nodeB.mesh.position.x + offset.x;
                const z = nodeB.mesh.position.z + offset.z;
                botGroup.position.set(x, 0, z);

                // Small red sensor pod look
                const baseGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.4, 12);
                const baseMat = new THREE.MeshPhongMaterial({ color: 0x0f172a });
                const base = new THREE.Mesh(baseGeo, baseMat);
                base.position.y = 0.2;
                botGroup.add(base);

                const geo = new THREE.SphereGeometry(1.4, 12, 12);
                const mat = new THREE.MeshPhongMaterial({
                    color: 0xef4444,
                    emissive: 0xef4444,
                    emissiveIntensity: 0.5,
                    shininess: 80
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.y = 1.4;
                botGroup.add(mesh);
                
                this.scene.add(botGroup);

                // Add small red ripples
                const { group: rippleGroup } = this.createCircularRipples(0xef4444);
                rippleGroup.position.set(x, 0.02, z);
                rippleGroup.scale.set(0.5, 1.0, 0.5);
                this.scene.add(rippleGroup);
                this.dynamicRipples.push(rippleGroup);

                // Create label
                const labelDiv = document.createElement('div');
                labelDiv.id = `label-bot-${idx}`;
                labelDiv.className = 'node-label malicious';
                
                const { html, borderClass } = this.renderNodeLabelHTML({
                    id: `bot-${idx}`,
                    label: `BOT ${idx + 1} (192.168.1.XX)`,
                    isCompromised: false
                });
                labelDiv.innerHTML = html;
                labelDiv.className = `node-label ${borderClass}`;
                this.labelsContainer.appendChild(labelDiv);

                this.ddosBots.push({
                    mesh: botGroup,
                    basePos: new THREE.Vector3(x, 0, z),
                    labelDiv,
                    id: `bot-${idx}`
                });

                // Add link from Bot to B
                this.createSplineLink(botGroup.position, nodeB.mesh.position, 0xef4444, 'attack');
            });
        }

        // Rogue Node Insertion (11): Spawns a solid rogue node connecting to B
        if (this.activeAttackId === 11) {
            const rogueGroup = new THREE.Group();
            const x = -30;
            const z = -35;
            rogueGroup.position.set(x, 0, z);

            // Red rogue sensor pod look
            const baseGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.5, 12);
            const baseMat = new THREE.MeshPhongMaterial({ color: 0x0f172a });
            const base = new THREE.Mesh(baseGeo, baseMat);
            base.position.y = 0.25;
            rogueGroup.add(base);

            const geo = new THREE.CylinderGeometry(1.6, 1.6, 2.2, 12);
            const mat = new THREE.MeshPhongMaterial({
                color: 0xef4444,
                emissive: 0xef4444,
                emissiveIntensity: 0.6,
                shininess: 90
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.y = 1.6;
            rogueGroup.add(mesh);
            this.scene.add(rogueGroup);

            // Add red ripples
            const { group: rippleGroup } = this.createCircularRipples(0xef4444);
            rippleGroup.position.set(x, 0.02, z);
            rippleGroup.scale.set(0.7, 1.0, 0.7);
            this.scene.add(rippleGroup);
            this.dynamicRipples.push(rippleGroup);

            // Create label
            const labelDiv = document.createElement('div');
            labelDiv.id = 'label-rogue-node';
            labelDiv.className = 'node-label malicious';
            
            const { html, borderClass } = this.renderNodeLabelHTML({
                id: 'rogue-node',
                label: 'ROGUE NODE (192.168.1.XX)',
                isCompromised: false
            });
            labelDiv.innerHTML = html;
            labelDiv.className = `node-label ${borderClass}`;
            this.labelsContainer.appendChild(labelDiv);

            this.rogueNode = {
                mesh: rogueGroup,
                basePos: new THREE.Vector3(x, 0, z),
                labelDiv
            };

            // Link to B
            this.createSplineLink(rogueGroup.position, nodeB.mesh.position, 0xef4444, 'attack');
        }

        // Sybil (13): Spawns 4 fake identities (semitransparent solid spheres) around Attacker
        if (this.activeAttackId === 13) {
            this.sybilGhosts = [];
            const count = 4;
            const radius = 18;

            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const x = attacker.mesh.position.x + Math.sin(angle) * radius;
                const z = attacker.mesh.position.z + Math.cos(angle) * radius;

                const ghostGroup = new THREE.Group();
                ghostGroup.position.set(x, 0, z);

                // Semi-transparent base and pod
                const baseGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.4, 12);
                const baseMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, transparent: true, opacity: 0.6 });
                const base = new THREE.Mesh(baseGeo, baseMat);
                base.position.y = 0.2;
                ghostGroup.add(base);

                const geo = new THREE.SphereGeometry(1.4, 12, 12);
                const mat = new THREE.MeshPhongMaterial({
                    color: 0x00f0ff,
                    emissive: 0x00f0ff,
                    emissiveIntensity: 0.3,
                    transparent: true,
                    opacity: 0.55,
                    shininess: 80
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.y = 1.4;
                ghostGroup.add(mesh);
                this.scene.add(ghostGroup);

                // Add cyan ripples
                const { group: rippleGroup } = this.createCircularRipples(0x00f0ff);
                rippleGroup.position.set(x, 0.02, z);
                rippleGroup.scale.set(0.6, 1.0, 0.6);
                this.scene.add(rippleGroup);
                this.dynamicRipples.push(rippleGroup);

                // Create label
                const labelDiv = document.createElement('div');
                labelDiv.id = `label-sybil-${i}`;
                labelDiv.className = 'node-label online';
                
                const { html, borderClass } = this.renderNodeLabelHTML({
                    id: `sybil-${i}`,
                    label: `SYBIL ID ${i + 1} (192.168.1.XX)`,
                    isCompromised: false
                });
                labelDiv.innerHTML = html;
                labelDiv.className = `node-label ${borderClass}`;
                this.labelsContainer.appendChild(labelDiv);

                this.sybilGhosts.push({
                    mesh: ghostGroup,
                    basePos: new THREE.Vector3(x, 0, z),
                    labelDiv
                });

                // Link to B
                this.createSplineLink(ghostGroup.position, nodeB.mesh.position, 0x00f0ff, 'normal');
            }
        }

        // Physical Access (16): Solid tampering laser beam from Attacker to Node A
        if (this.activeAttackId === 16) {
            const start = attacker.mesh.position.clone().add(new THREE.Vector3(0, 3, 0));
            const end = nodeA.mesh.position.clone().add(new THREE.Vector3(0, 3, 0));
            const distance = start.distanceTo(end);

            const laserGeo = new THREE.CylinderGeometry(0.2, 0.2, distance, 8);
            const laserMat = new THREE.MeshBasicMaterial({
                color: 0xff073a,
                transparent: true,
                opacity: 0.85
            });
            this.physicalLaser = new THREE.Mesh(laserGeo, laserMat);

            // Position and rotate cylinder to align between start and end
            const position = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            this.physicalLaser.position.copy(position);

            const direction = new THREE.Vector3().subVectors(end, start).normalize();
            const up = new THREE.Vector3(0, 1, 0);
            this.physicalLaser.quaternion.setFromUnitVectors(up, direction);

            this.scene.add(this.physicalLaser);
        }
    }

    clearAttackOverlays() {
        if (this.jammingDome) {
            this.scene.remove(this.jammingDome);
            this.jammingDome = null;
        }

        if (this.ddosBots) {
            this.ddosBots.forEach(bot => {
                this.scene.remove(bot.mesh);
                if (bot.labelDiv) bot.labelDiv.remove();
            });
            this.ddosBots = null;
        }

        if (this.rogueNode) {
            this.scene.remove(this.rogueNode.mesh);
            if (this.rogueNode.labelDiv) this.rogueNode.labelDiv.remove();
            this.rogueNode = null;
        }

        if (this.sybilGhosts) {
            this.sybilGhosts.forEach(g => {
                this.scene.remove(g.mesh);
                if (g.labelDiv) g.labelDiv.remove();
            });
            this.sybilGhosts = null;
        }

        if (this.physicalLaser) {
            this.scene.remove(this.physicalLaser);
            this.physicalLaser = null;
        }

        if (this.warningCrosses) {
            this.warningCrosses.forEach(cross => this.scene.remove(cross));
            this.warningCrosses = [];
        }

        if (this.dynamicRipples) {
            this.dynamicRipples.forEach(r => this.scene.remove(r));
            this.dynamicRipples = [];
        }

        this.particles.forEach(p => this.scene.remove(p.system));
        this.particles = [];

        this.waveEmitters.forEach(w => this.scene.remove(w.mesh));
        this.waveEmitters = [];

        // Clear dynamic labels from container
        if (this.labelsContainer) {
            const divs = Array.from(this.labelsContainer.children);
            const staticIds = ['node-a', 'node-b', 'attacker'];
            divs.forEach(d => {
                const id = d.id.replace('label-', '');
                if (!staticIds.includes(id)) {
                    d.remove();
                }
            });
        }
    }

    spawnBurst(pos, colorCode, count) {
        const geo = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions.push(pos.x, pos.y, pos.z);
            velocities.push(
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 1.5
            );
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: colorCode,
            size: 1.2,
            transparent: true,
            opacity: 1
        });

        const pSystem = new THREE.Points(geo, mat);
        this.scene.add(pSystem);
        
        this.particles.push({
            system: pSystem,
            velocities,
            age: 0,
            maxAge: 30
        });
    }

    spawnPacket(curve, colorCode, speed = 1.0) {
        // Upgrade packet particles to beautiful solid glowing 3D spheres
        const geo = new THREE.SphereGeometry(0.8, 8, 8);
        const mat = new THREE.MeshBasicMaterial({
            color: colorCode,
            transparent: true,
            opacity: 0.95
        });
        
        const pt = new THREE.Mesh(geo, mat);
        this.scene.add(pt);
        this.particles.push({
            system: pt,
            curve,
            progress: 0,
            speed: 0.015 * speed,
            isPacket: true
        });
    }

    spawnWave(pos, colorCode) {
        const geo = new THREE.SphereGeometry(1, 24, 24);
        // Sleek solid translucent expanding shell instead of cluttered wireframe cage
        const mat = new THREE.MeshBasicMaterial({
            color: colorCode,
            transparent: true,
            opacity: 0.15
        });
        const wave = new THREE.Mesh(geo, mat);
        wave.position.copy(pos);
        this.scene.add(wave);

        this.waveEmitters.push({
            mesh: wave,
            scale: 1,
            maxScale: 60,
            opacity: 0.15
        });
    }

    setCompromisedNode(nodeIds) {
        const ids = Array.isArray(nodeIds) ? nodeIds : (nodeIds ? [nodeIds] : []);
        
        this.nodes.forEach(node => {
            if (ids.includes(node.id)) {
                node.isCompromised = true;
            } else {
                node.isCompromised = false;
            }
        });
    }

    updateNodeLabel(id, newLabel) {
        const node = this.nodes.get(id);
        if (node) {
            node.label = newLabel;
            const labelDiv = document.getElementById(`label-${id}`);
            if (labelDiv) {
                labelDiv.innerText = newLabel;
            }
        }
    }

    setControlMode(mode) {
        if (mode === 'pan') {
            this.controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
        } else {
            this.controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
        }
    }

    zoom(direction) {
        // Zoom camera in/out
        const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
        if (direction === 'in') {
            offset.multiplyScalar(0.9);
        } else {
            offset.multiplyScalar(1.1);
        }
        this.camera.position.addVectors(this.controls.target, offset);
    }

    resetView() {
        this.controls.reset();
        this.camera.position.set(0, 100, 150);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.ticks++;

        const elapsed = this.clock.getElapsedTime();

        // Spin ripples and bob nodes
        this.nodes.forEach(node => {
            // Animate ground ripples
            if (node.rippleGroup) {
                node.rippleGroup.rotation.y += 0.005; // Radar sweep rotation
            }
            if (node.rippleRings) {
                node.rippleRings.forEach((ring, idx) => {
                    // Offset scales to create an outward rippling wave effect
                    const t = elapsed * 3.5 - idx * 1.0;
                    const scale = 1.0 + (t % 2.0 < 0 ? (t % 2.0) + 2.0 : t % 2.0) * 0.15;
                    ring.scale.set(scale, scale, 1);
                });
            }
            
            if (node.isCompromised) {
                // Flashing warning red blinking design
                const blink = 0.4 + Math.sin(Date.now() * 0.012) * 0.4;

                if (node.rippleRings) {
                    node.rippleRings.forEach(ring => {
                        ring.material.color.setHex(0xef4444);
                        ring.material.opacity = blink * 0.7 + 0.1;
                    });
                }

                if (node.deviceMesh) {
                    node.deviceMesh.traverse((child) => {
                        if (child.isMesh && child.material) {
                            if (child.userData.originalColor === undefined) {
                                child.userData.originalColor = child.material.color ? child.material.color.getHex() : null;
                            }
                            if (child.userData.originalEmissive === undefined) {
                                child.userData.originalEmissive = child.material.emissive ? child.material.emissive.getHex() : null;
                            }

                            if (child.material.color) {
                                child.material.color.setHex(0xef4444);
                            }
                            if (child.material.emissive) {
                                child.material.emissive.setHex(0xef4444);
                                child.material.emissiveIntensity = blink * 2.5;
                            }
                        }
                    });
                }

                // NO VIGOROUS SHAKING: stays completely stable on its base
                node.mesh.position.copy(node.basePos);
            } else {
                // Legitimate nodes colorCode, attacker red
                const isAttackerOrRogue = node.id === 'attacker' || node.id.includes('rogue');
                const targetColor = isAttackerOrRogue ? 0xef4444 : node.colorCode;

                if (node.rippleRings) {
                    node.rippleRings.forEach((ring, idx) => {
                        ring.material.color.setHex(targetColor);
                        ring.material.opacity = [0.8, 0.5, 0.2][idx];
                    });
                }

                if (node.deviceMesh) {
                    node.deviceMesh.traverse((child) => {
                        if (child.isMesh && child.material) {
                            if (child.userData.originalColor === undefined) {
                                child.userData.originalColor = child.material.color ? child.material.color.getHex() : null;
                            }
                            if (child.userData.originalEmissive === undefined) {
                                child.userData.originalEmissive = child.material.emissive ? child.material.emissive.getHex() : null;
                            }

                            if (isAttackerOrRogue) {
                                if (child.material.color) child.material.color.setHex(0xef4444);
                                if (child.material.emissive) {
                                    child.material.emissive.setHex(0xef4444);
                                    child.material.emissiveIntensity = 0.5;
                                }
                            } else {
                                if (child.material.color && child.userData.originalColor !== null) {
                                    child.material.color.setHex(child.userData.originalColor);
                                }
                                if (child.material.emissive && child.userData.originalEmissive !== null) {
                                    child.material.emissive.setHex(child.userData.originalEmissive);
                                    child.material.emissiveIntensity = 0.3;
                                }
                            }
                        }
                    });
                }
                
                // Gentle bobbing/floating
                node.mesh.position.copy(node.basePos);
                node.mesh.position.y += Math.sin(elapsed * 2.5 + node.mesh.position.x) * 1.0;
                node.mesh.scale.set(1, 1, 1);
            }
        });

        // Rotate and pulse warning crosses
        if (this.warningCrosses) {
            this.warningCrosses.forEach(cross => {
                cross.rotation.y += 0.025;
                cross.rotation.x += 0.01;
                const pulse = 1.0 + Math.sin(elapsed * 5.0) * 0.15;
                cross.scale.set(pulse, pulse, pulse);
            });
        }

        // Animate dynamic overlays ground ripples
        if (this.dynamicRipples) {
            this.dynamicRipples.forEach(rg => {
                rg.rotation.y += 0.005;
                rg.children.forEach((ring, idx) => {
                    if (ring.geometry.type === 'RingGeometry') {
                        const t = elapsed * 3.5 - idx * 1.0;
                        const scale = 1.0 + (t % 2.0 < 0 ? (t % 2.0) + 2.0 : t % 2.0) * 0.15;
                        ring.scale.set(scale, scale, 1);
                    }
                });
            });
        }

        // Animate broken link dashed line patterns
        if (this.links) {
            this.links.forEach(l => {
                if (l.isBroken && l.mesh.material.type === 'LineDashedMaterial') {
                    l.mesh.material.dashOffset = (l.mesh.material.dashOffset || 0) - 0.15;
                }
            });
        }

        // Gentle float/bobbing for specialized attack meshes
        if (this.attackTriggered) {
            if (this.activeAttackId === 7 && this.ddosBots) {
                this.ddosBots.forEach((bot, idx) => {
                    bot.mesh.position.y = bot.basePos.y + Math.sin(elapsed * 2.5 + idx) * 1.2;
                });
            }
            if (this.activeAttackId === 11 && this.rogueNode) {
                this.rogueNode.mesh.position.y = this.rogueNode.basePos.y + Math.sin(elapsed * 2.5) * 1.2;
            }
            if (this.activeAttackId === 13 && this.sybilGhosts) {
                this.sybilGhosts.forEach((ghost, idx) => {
                    ghost.mesh.position.y = ghost.basePos.y + Math.sin(elapsed * 2.0 + idx) * 1.0;
                });
            }
            // For Physical Access (16), Node A blinks red/yellow representing override
            if (this.activeAttackId === 16) {
                const nodeA = this.nodes.get('node-a');
                if (nodeA && nodeA.deviceMesh) {
                    const colorCode = Math.sin(elapsed * 12) > 0 ? 0xff073a : 0xf59e0b;
                    nodeA.deviceMesh.traverse((child) => {
                        if (child.isMesh && child.material && child.material.color) {
                            child.material.color.setHex(colorCode);
                        }
                    });
                }
            }
        }

        // HTML Screen Space Projection for Labels
        this.updateNodeLabels();

        // Trigger active packet flow animations (controlled by Traffic switch)
        const showTraffic = document.getElementById('switch-traffic')?.checked !== false;
        
        let spawnInterval = 25;
        if (this.attackTriggered) {
            if (this.activeAttackId === 6 || this.activeAttackId === 7) {
                spawnInterval = 5; // DoS flood speed
            } else if (this.activeAttackId === 1) {
                spawnInterval = 15; // MitM speed
            }
        }

        if (showTraffic && this.links.length > 0 && this.ticks % spawnInterval === 0) {
            const speed = this.activeAttackId === 17 && this.attackTriggered ? 0.4 : (this.activeAttackId === 6 || this.activeAttackId === 7 ? 2.2 : 1.0);
            
            this.links.forEach(l => {
                // Do not spawn on inactive lines
                if (l.type === 'attack-inactive' || l.type === 'normal-inactive') {
                    return;
                }
                
                let pColor = 0x00f0ff; // Cyan packets normal
                if (this.attackTriggered) {
                    if (l.type === 'attack') pColor = 0xff073a;
                    if (l.type === 'intercept') {
                        if (this.activeAttackId === 9) {
                            pColor = 0xffb703; // gold key/pass color
                        } else if (this.activeAttackId === 15) {
                            pColor = 0xff00ff; // pink timing pulse
                        } else {
                            pColor = 0xf59e0b; // amber eavesdropped
                        }
                    }
                    if (this.activeAttackId === 8) {
                        pColor = 0xf59e0b; // Amber packets for Jamming
                    }
                }
                
                this.spawnPacket(l.curve, pColor, speed);
            });
        }

        // Expand wave fields
        if (this.attackTriggered) {
            if (this.activeAttackId === 8 && this.ticks % 25 === 0) { // Jamming
                const attacker = this.nodes.get('attacker');
                if (attacker) this.spawnWave(attacker.mesh.position, 0xef4444);
            } else if (this.activeAttackId === 2 && this.ticks % 40 === 0) { // Eavesdropping
                const nodeA = this.nodes.get('node-a');
                if (nodeA) this.spawnWave(nodeA.mesh.position, 0x00f0ff);
            }
        }

        // Animate particles & curves
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            if (p.isPacket) {
                p.progress += p.speed;
                if (p.progress >= 1.0) {
                    this.scene.remove(p.system);
                    this.particles.splice(i, 1);
                } else {
                    const pos = p.curve.getPointAt(p.progress);
                    
                    if (this.activeAttackId === 17 && this.attackTriggered && p.progress > 0.42 && p.progress < 0.58) {
                        // Delay hold: draw circular buffer path around Attacker
                        const attacker = this.nodes.get('attacker');
                        const angle = elapsed * 10 + p.progress * 100;
                        pos.set(
                            attacker.mesh.position.x + Math.sin(angle) * 3,
                            attacker.mesh.position.y + 4 + Math.cos(angle) * 3,
                            attacker.mesh.position.z
                        );
                    }

                    if (this.activeAttackId === 8 && this.attackTriggered && p.progress > 0.42 && p.progress < 0.58) {
                        // Jamming: packets dissolve at midpoint
                        const burstPos = p.curve.getPointAt(0.5);
                        this.spawnBurst(burstPos, 0xf59e0b, 8); // burst yellow/amber
                        this.scene.remove(p.system);
                        this.particles.splice(i, 1);
                        continue;
                    }

                    p.system.position.copy(pos); // Set 3D Mesh positions directly
                }
            } else {
                p.age++;
                if (p.age >= p.maxAge) {
                    this.scene.remove(p.system);
                    this.particles.splice(i, 1);
                } else {
                    const posAttr = p.system.geometry.attributes.position;
                    const posArr = posAttr.array;
                    for (let j = 0; j < posArr.length; j += 3) {
                        posArr[j] += p.velocities[j/3 * 3];
                        posArr[j+1] += p.velocities[j/3 * 3 + 1];
                        posArr[j+2] += p.velocities[j/3 * 3 + 2];
                    }
                    posAttr.needsUpdate = true;
                }
            }
        }

        // Animate wave expansions
        for (let i = this.waveEmitters.length - 1; i >= 0; i--) {
            const w = this.waveEmitters[i];
            w.scale += 0.5;
            w.opacity = 0.15 * (1.0 - w.scale / w.maxScale);
            
            if (w.scale >= w.maxScale) {
                this.scene.remove(w.mesh);
                this.waveEmitters.splice(i, 1);
            } else {
                w.mesh.scale.set(w.scale, w.scale, w.scale);
                w.mesh.material.opacity = w.opacity;
            }
        }

        // Jamming dome visual noise fluctuation
        if (this.jammingDome) {
            this.jammingDome.rotation.y += 0.01;
            this.jammingDome.rotation.x += 0.005;
            const waveScale = 1.0 + Math.sin(elapsed * 10) * 0.05;
            this.jammingDome.scale.set(waveScale, waveScale, waveScale);
        }

        // Spoofing identity animation
        if (this.attackTriggered && this.activeAttackId === 4) {
            const attacker = this.nodes.get('attacker');
            if (attacker && attacker.deviceMesh) {
                attacker.deviceMesh.traverse((child) => {
                    if (child.isMesh && child.material && child.material.color) {
                        child.material.color.setHex(0x00f0ff); // Mimic cyan Node A
                    }
                });
            }
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    updateNodeLabels() {
        const labelsContainer = document.getElementById('node-labels-container');
        if (!labelsContainer) return;

        const showLabels = document.getElementById('switch-labels')?.checked !== false;
        if (showLabels === false) {
            labelsContainer.style.display = 'none';
            return;
        }
        labelsContainer.style.display = 'block';

        const tempV = new THREE.Vector3();
        
        const updateLabel = (id, meshPos, offset = 10) => {
            const labelDiv = document.getElementById(`label-${id}`);
            if (!labelDiv) return;

            // Dynamically render innerHTML and status classes
            const node = this.nodes.get(id);
            if (node) {
                const { html, borderClass } = this.renderNodeLabelHTML(node);
                if (labelDiv.innerHTML !== html) {
                    labelDiv.innerHTML = html;
                    labelDiv.className = `node-label ${borderClass}`;
                }
            } else if (id.startsWith('bot-')) {
                const botIdx = parseInt(id.split('-')[1]) + 1;
                const { html, borderClass } = this.renderNodeLabelHTML({
                    id: id,
                    label: `BOT ${botIdx} (192.168.1.XX)`,
                    isCompromised: false
                });
                if (labelDiv.innerHTML !== html) {
                    labelDiv.innerHTML = html;
                    labelDiv.className = `node-label ${borderClass}`;
                }
            } else if (id === 'rogue-node') {
                const { html, borderClass } = this.renderNodeLabelHTML({
                    id: id,
                    label: 'ROGUE NODE (192.168.1.XX)',
                    isCompromised: false
                });
                if (labelDiv.innerHTML !== html) {
                    labelDiv.innerHTML = html;
                    labelDiv.className = `node-label ${borderClass}`;
                }
            } else if (id.startsWith('sybil-')) {
                const sybIdx = parseInt(id.split('-')[1]) + 1;
                const { html, borderClass } = this.renderNodeLabelHTML({
                    id: id,
                    label: `SYBIL ID ${sybIdx} (192.168.1.XX)`,
                    isCompromised: false
                });
                if (labelDiv.innerHTML !== html) {
                    labelDiv.innerHTML = html;
                    labelDiv.className = `node-label ${borderClass}`;
                }
            }

            tempV.copy(meshPos);
            tempV.y += offset;

            tempV.project(this.camera);

            if (tempV.z > 1) {
                labelDiv.style.display = 'none';
                return;
            }

            const x = (tempV.x * 0.5 + 0.5) * this.container.clientWidth;
            const y = (tempV.y * -0.5 + 0.5) * this.container.clientHeight;

            labelDiv.style.display = 'block';
            labelDiv.style.left = `${x}px`;
            labelDiv.style.top = `${y}px`;
        };

        this.nodes.forEach(node => {
            updateLabel(node.id, node.mesh.position, 10);
        });

        if (this.ddosBots) {
            this.ddosBots.forEach(bot => {
                updateLabel(bot.id, bot.mesh.position, 8);
            });
        }

        if (this.rogueNode) {
            updateLabel('rogue-node', this.rogueNode.mesh.position, 8);
        }

        if (this.sybilGhosts) {
            this.sybilGhosts.forEach((ghost, idx) => {
                updateLabel(`sybil-${idx}`, ghost.mesh.position, 8);
            });
        }
    }

    findParentGroup(object) {
        let current = object;
        while (current) {
            for (const [id, node] of this.nodes.entries()) {
                if (node.mesh === current) {
                    return id;
                }
            }
            current = current.parent;
        }
        return null;
    }

    onPointerDown(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersectTargets = Array.from(this.nodes.values()).map(n => n.mesh);
        const intersects = this.raycaster.intersectObjects(intersectTargets, true);

        if (intersects.length > 0) {
            const nodeId = this.findParentGroup(intersects[0].object);
            if (nodeId && this.onNodeClicked) {
                this.onNodeClicked(nodeId);
            }
        }
    }

    onPointerMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.mouse.x = (x / rect.width) * 2 - 1;
        this.mouse.y = -(y / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersectTargets = Array.from(this.nodes.values()).map(n => n.mesh);
        const intersects = this.raycaster.intersectObjects(intersectTargets, true);

        if (intersects.length > 0) {
            const nodeId = this.findParentGroup(intersects[0].object);
            if (nodeId) {
                this.renderer.domElement.style.cursor = 'pointer';
                if (this.onNodeHover) {
                    this.onNodeHover(nodeId, x, y);
                }
                return;
            }
        }

        this.renderer.domElement.style.cursor = 'auto';
        if (this.onNodeHover) {
            this.onNodeHover(null, 0, 0);
        }
    }

    onWindowResize() {
        if (!this.container) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (w === 0 && h === 0) return; // Ignore invisible container
        this.camera.aspect = (h > 0) ? (w / h) : 1;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }
}
