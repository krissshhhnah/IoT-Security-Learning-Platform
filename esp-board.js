/**
 * ESP32-WROOM-32E Interactive Board Schematic Renderer
 * Generates dynamic vector graphics and binds pin-click events to detail vulnerabilities.
 */

export class EspBoard {
    constructor(containerId, clickCallback) {
        this.container = document.getElementById(containerId);
        this.callback = clickCallback;
        if (this.container) this.render();
    }

    render() {
        this.container.innerHTML = `
        <svg viewBox="0 0 320 230" class="esp-svg">
            <defs>
                <!-- Board gradient textures -->
                <linearGradient id="board-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#141a29"/>
                    <stop offset="100%" stop-color="#0a0d14"/>
                </linearGradient>
                <linearGradient id="shield-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#8e9cae"/>
                    <stop offset="100%" stop-color="#475569"/>
                </linearGradient>
                <linearGradient id="copper-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#b78a39"/>
                    <stop offset="50%" stop-color="#ffd000"/>
                    <stop offset="100%" stop-color="#b78a39"/>
                </linearGradient>
            </defs>
            
            <!-- PCB Body -->
            <rect x="10" y="10" width="300" height="210" rx="10" fill="url(#board-grad)" stroke="#2d3748" stroke-width="2"/>
            
            <!-- PCB Grid details -->
            <line x1="10" y1="50" x2="310" y2="50" stroke="#ff007f" stroke-width="0.5" opacity="0.1"/>
            <line x1="10" y1="180" x2="310" y2="180" stroke="#ff007f" stroke-width="0.5" opacity="0.1"/>
            
            <!-- ESP32 Shield (Metal Can) -->
            <rect x="70" y="30" width="180" height="130" rx="6" fill="url(#shield-grad)" stroke="#94a3b8" stroke-width="1.5"/>
            <text x="160" y="85" font-family="'Outfit', sans-serif" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">ESP-WROOM-32E</text>
            <text x="160" y="102" font-family="'Fira Code', monospace" font-size="9" fill="#1e293b" text-anchor="middle">FCC ID: 2AC7Z-ESPWROOM32</text>
            
            <!-- Antennna Block -->
            <rect x="70" y="10" width="180" height="20" fill="#000" rx="2"/>
            <path d="M 75,25 L 85,15 L 95,25 L 105,15 L 115,25 L 125,15 L 135,25" fill="none" stroke="#ffd000" stroke-width="2"/>
            
            <!-- Left Side Pins (Headers) -->
            <!-- 3V3 -->
            <circle cx="25" cy="50" r="6" fill="#b78a39" class="clickable-pin" id="pin-3v3" data-name="3V3 Power Input" data-vuln="Exposing 3V3 power lines makes the node vulnerable to power glitching attacks. Injecting brief voltage drops (glitches) during cryptoprocessor startup can corrupt instructions, letting attackers bypass security checks."/>
            <text x="37" y="53" font-size="8" fill="#64748b" font-weight="bold">3V3</text>
            
            <!-- EN (Reset Button Pin) -->
            <circle cx="25" cy="80" r="6" fill="#00f0ff" class="clickable-pin" id="pin-en" data-name="EN (Enable / Reset Pin)" data-vuln="Reset line exposure enables physical trigger attacks. Tapping the EN pin allows an attacker to force hardware resets or hold the node in reset to coordinate Side-Channel Analysis or Timing Attacks."/>
            <text x="37" y="83" font-size="8" fill="#64748b" font-weight="bold">EN</text>
            
            <!-- GPIO4 (Tamper Switch Link) -->
            <circle cx="25" cy="110" r="6" fill="#39ff14" class="clickable-pin" id="pin-g4" data-name="GPIO4 (Physical Tamper Loop)" data-vuln="This pin monitors a physical microswitch loop on the node casing. If the housing is opened, the electrical circuit breaks, instantly alerting the ESP32 to erase sensitive cryptographic keys stored in RTC RAM."/>
            <text x="37" y="113" font-size="8" fill="#64748b" font-weight="bold">G4 (Tamper)</text>

            <!-- JTAG Pins (TDI & TMS) -->
            <circle cx="25" cy="140" r="6" fill="#ffb703" class="clickable-pin" id="pin-jtag1" data-name="JTAG Interface (GPIO12/13 TDI/TMS)" data-vuln="JTAG is a hardware debugging bus. By tapping into JTAG pins, attackers can bypass all software permissions to directly dump execution registers, step through instruction code, and extract the complete plaintext firmware."/>
            <text x="37" y="143" font-size="8" fill="#64748b" font-weight="bold">G12/13 (JTAG)</text>
            
            <!-- Right Side Pins (Headers) -->
            <!-- GND -->
            <circle cx="295" cy="50" r="6" fill="#b78a39" class="clickable-pin" id="pin-gnd" data-name="GND Common Ground" data-vuln="Provides a shared electrical ground path. Required as a reference connection when attaching bus analyzers, oscilloscopes, or UART sniffers."/>
            <text x="260" y="53" font-size="8" fill="#64748b" font-weight="bold" text-anchor="end">GND</text>
            
            <!-- RX0 / TX0 (UART Pins) -->
            <circle cx="295" cy="80" r="6" fill="#ff007f" class="clickable-pin" id="pin-uart" data-name="UART Console Bus (TX0 / RX0)" data-vuln="UART provides serial debugging output. Plaintext system console outputs are broadcasted on this bus during boot. If bootloader logging is left enabled, attackers can tap these pins to read variables and inject malicious console commands."/>
            <text x="260" y="83" font-size="8" fill="#64748b" font-weight="bold" text-anchor="end">TX0/RX0 (UART)</text>
            
            <!-- GPIO0 (Boot Mode Strap) -->
            <circle cx="295" cy="110" r="6" fill="#ffb703" class="clickable-pin" id="pin-g0" data-name="GPIO0 (Boot Mode Pin)" data-vuln="Strap pin that determines boot mode on startup. Grounding GPIO0 while resetting the node forces the ESP32 into ROM Serial Download Mode, allowing firmware code dump extraction via the UART interface."/>
            <text x="260" y="113" font-size="8" fill="#64748b" font-weight="bold" text-anchor="end">G0 (Boot Strap)</text>

            <!-- JTAG Pins (TCK & TDO) -->
            <circle cx="295" cy="140" r="6" fill="#ffb703" class="clickable-pin" id="pin-jtag2" data-name="JTAG Interface (GPIO14/15 TCK/TDO)" data-vuln="Physical access to TCK/TDO pins completes the JTAG hardware debugger connection, exposing internal microcontrollers to invasive inspection and state overrides."/>
            <text x="260" y="143" font-size="8" fill="#64748b" font-weight="bold" text-anchor="end">G14/15 (JTAG)</text>
            
            <!-- Flash Memory Chip -->
            <rect x="140" y="170" width="40" height="35" rx="2" fill="#1e293b" stroke="#334155"/>
            <circle cx="145" cy="175" r="1.5" fill="#64748b"/>
            <text x="160" y="192" font-family="'Fira Code', monospace" font-size="8" fill="#94a3b8" text-anchor="middle">FLASH</text>
            
            <!-- SPI Flash Pins -->
            <line x1="130" y1="175" x2="140" y2="175" stroke="#b78a39" stroke-width="1.5"/>
            <line x1="130" y1="187" x2="140" y2="187" stroke="#b78a39" stroke-width="1.5"/>
            <line x1="130" y1="199" x2="140" y2="199" stroke="#b78a39" stroke-width="1.5"/>
            <line x1="180" y1="175" x2="190" y2="175" stroke="#b78a39" stroke-width="1.5"/>
            <line x1="180" y1="187" x2="190" y2="187" stroke="#b78a39" stroke-width="1.5"/>
            <line x1="180" y1="199" x2="190" y2="199" stroke="#b78a39" stroke-width="1.5"/>
        </svg>
        <div class="pin-explanation-card" id="pin-card" style="margin-top: 10px; background: rgba(0,0,0,0.4); border: 1px solid var(--color-panel-border); padding: 8px 12px; border-radius: 4px; font-size: 11px;">
            <p style="font-weight: bold; color: var(--color-primary); margin-bottom: 4px;" id="pin-card-title">🖱️ CLICK PINS TO INSPECT</p>
            <p id="pin-card-desc" style="color: var(--color-text-main)">Select any colored pin header on the ESP32 board to analyze its physical interfaces and security exposures.</p>
        </div>
        `;

        // Bind clicks to circles
        const pins = this.container.querySelectorAll('.clickable-pin');
        pins.forEach(pin => {
            pin.addEventListener('click', (e) => {
                const name = pin.getAttribute('data-name');
                const vuln = pin.getAttribute('data-vuln');
                
                document.getElementById('pin-card-title').innerText = name;
                document.getElementById('pin-card-desc').innerText = vuln;

                if (this.callback) {
                    this.callback(name, vuln);
                }
            });
        });
    }
}
