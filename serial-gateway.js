/**
 * Web Serial Gateway & Universal MAC Discovery Registry
 * Interfaces directly with USB COM ports in-browser and dynamically manages node hardware states.
 */

export class SerialGateway {
    constructor() {
        this.port = null;
        this.reader = null;
        this.keepReading = false;
        this.mockInterval = null;
        this.onLineReceived = null;
        this.onDeviceDiscovered = null;
        this.onConnectionChange = null;

        // Discovered MAC Addresses Registry
        this.discoveredNodes = new Map();
    }

    isSupported() {
        return 'serial' in navigator;
    }

    async connect() {
        if (!this.isSupported()) {
            throw new Error("Web Serial API is not supported by your browser. Use Google Chrome or Microsoft Edge.");
        }

        try {
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: 115200 });
            this.keepReading = true;
            this.readLoop();
            
            if (this.onConnectionChange) this.onConnectionChange(true);
            return true;
        } catch (err) {
            console.error("Serial connection failed:", err);
            if (this.onConnectionChange) this.onConnectionChange(false);
            throw err;
        }
    }

    async disconnect() {
        this.keepReading = false;
        if (this.reader) {
            await this.reader.cancel();
        }
        if (this.port) {
            await this.port.close();
            this.port = null;
        }
        if (this.onConnectionChange) this.onConnectionChange(false);
    }

    async readLoop() {
        while (this.port && this.port.readable && this.keepReading) {
            try {
                this.reader = this.port.readable.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { value, done } = await this.reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop(); // Keep partial line in buffer

                    for (const line of lines) {
                        const cleanLine = line.trim();
                        if (cleanLine) {
                            this.handleIncomingLine(cleanLine);
                        }
                    }
                }
            } catch (err) {
                console.error("Read loop error:", err);
                break;
            } finally {
                if (this.reader) {
                    this.reader.releaseLock();
                    this.reader = null;
                }
            }
        }
    }

    handleIncomingLine(line) {
        // Log raw string
        if (this.onLineReceived) this.onLineReceived(line);

        // Attempt JSON telemetry parse
        try {
            if (line.startsWith("{") && line.endsWith("}")) {
                const telemetry = JSON.parse(line);
                if (telemetry.mac) {
                    this.registerDevice(telemetry);
                }
            } else {
                // Check if string contains MAC patterns via regex
                const macRegex = /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/;
                const match = line.match(macRegex);
                if (match) {
                    const mac = match[0];
                    const role = line.toLowerCase().includes("attacker") ? "attacker" : "node";
                    this.registerDevice({
                        mac: mac,
                        role: role,
                        rssi: -60 - Math.floor(Math.random() * 20),
                        heap: 288000,
                        cpu: 15,
                        raw: line
                    });
                }
            }
        } catch (e) {
            // Ignore parse errors for plain serial logs
        }
    }

    registerDevice(deviceData) {
        const mac = deviceData.mac;
        const now = Date.now();

        let isNew = false;
        let nodeInfo = {};

        if (!this.discoveredNodes.has(mac)) {
            isNew = true;
            nodeInfo = {
                mac: mac,
                firstSeen: now,
                lastSeen: now,
                role: deviceData.role || "node",
                rssi: deviceData.rssi || -60,
                heap: deviceData.heap || 288000,
                cpu: deviceData.cpu || 10,
                x: (Math.random() * 100 - 50),
                z: (Math.random() * 100 - 50)
            };
            this.discoveredNodes.set(mac, nodeInfo);
        } else {
            nodeInfo = this.discoveredNodes.get(mac);
            nodeInfo.lastSeen = now;
            nodeInfo.rssi = deviceData.rssi || nodeInfo.rssi;
            nodeInfo.heap = deviceData.heap || nodeInfo.heap;
            nodeInfo.cpu = deviceData.cpu || nodeInfo.cpu;
        }

        if (this.onDeviceDiscovered) {
            this.onDeviceDiscovered(nodeInfo, isNew);
        }
    }

    startMockHardwareStream() {
        if (this.mockInterval) clearInterval(this.mockInterval);

        // Predefined list of mock ESP32 boards emitting telemetry
        const mockDevices = [
            { mac: "24:6F:28:1A:3B:10", role: "node-a", x: -40, z: 0 },
            { mac: "24:6F:28:1A:3B:F8", role: "node-b", x: 40, z: 0 },
            { mac: "3C:61:05:44:A2:D8", role: "attacker", x: 0, z: 30 }
        ];

        // Seed initial coordinates
        mockDevices.forEach(d => {
            this.registerDevice({
                mac: d.mac,
                role: d.role,
                rssi: -50,
                heap: 295000,
                cpu: 10
            });
        });

        this.mockInterval = setInterval(() => {
            // Pick a random device
            const device = mockDevices[Math.floor(Math.random() * mockDevices.length)];
            const cpu = Math.floor(8 + Math.random() * 10);
            const heap = Math.floor(288000 + Math.random() * 8000);
            const rssi = Math.floor(-55 - Math.random() * 12);
            
            // Randomly simulate a new Rogue node appearing in the field
            if (Math.random() < 0.05 && this.discoveredNodes.size < 7) {
                const suffix = Math.floor(Math.random()*255).toString(16).toUpperCase().padStart(2, '0');
                const rogueMac = `24:6F:28:1A:3C:${suffix}`;
                this.registerDevice({
                    mac: rogueMac,
                    role: "rogue",
                    rssi: -72,
                    heap: 292000,
                    cpu: 15
                });
                
                const alertLog = `[DISCOVERY] Captured rogue probe frame from MAC: ${rogueMac} | RSSI=-72dBm`;
                if (this.onLineReceived) this.onLineReceived(alertLog);
                return;
            }

            const jsonTelemetry = JSON.stringify({
                mac: device.mac,
                role: device.role,
                rssi: rssi,
                heap: heap,
                cpu: cpu,
                uptime: Date.now()
            });

            this.handleIncomingLine(jsonTelemetry);
        }, 1200);
    }

    stopMockHardwareStream() {
        if (this.mockInterval) {
            clearInterval(this.mockInterval);
            this.mockInterval = null;
        }
    }

    clearRegistry() {
        this.discoveredNodes.clear();
    }
}
