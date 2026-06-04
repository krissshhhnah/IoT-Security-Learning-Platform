/**
 * Metrics Charts Engine
 * Renders real-time graphs directly on HTML5 Canvas.
 * Custom implementation to stay dependency-free, lightweight, and dynamically themed.
 */

export class MetricsCharts {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    render(attackId, history) {
        if (!this.ctx) return;
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.clearRect(0, 0, width, height);

        // Fetch styling variables from DOM root
        const style = getComputedStyle(document.documentElement);
        const primaryColor = style.getPropertyValue('--color-primary').trim() || '#ff007f';
        const successColor = style.getPropertyValue('--color-success').trim() || '#39ff14';
        const alertColor = style.getPropertyValue('--color-alert').trim() || '#ffb703';
        const textColor = style.getPropertyValue('--color-text-muted').trim() || '#8e9cae';

        if (!history || history.length === 0) {
            // Render idle placeholder
            this.ctx.fillStyle = textColor;
            this.ctx.font = '11px Fira Code';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('WAITING FOR TELEMETRY INPUT...', width / 2, height / 2);
            return;
        }

        // Branch drawing based on the active exploit vector
        if (attackId === 8) {
            // Jamming Attack: Draw RSSI Line Graph & Noise Threshold
            this.drawDoubleLine(history, 'rssi', 'cpu', 'Signal Strength (RSSI)', 'Noise Floor', -130, 0, primaryColor, alertColor, textColor);
        } else if (attackId === 6 || attackId === 7) {
            // DoS / DDoS: Draw CPU and Heap curves
            this.drawDoubleLine(history, 'cpu', 'heap', 'CPU Load (%)', 'Free Heap (KB)', 0, 310, primaryColor, successColor, textColor);
        } else if (attackId === 17) {
            // Delay Attack: Draw Latency Bar Chart
            this.drawLatencyBars(history, textColor, primaryColor, alertColor);
        } else if (attackId === 15) {
            // Timing Attack: Draw Execution Timing Distribution (Histogram)
            this.drawTimingHistogram(history, textColor, successColor);
        } else if (attackId === 14) {
            // Sensor Data Manipulation: Draw True vs Tampered Line Graph
            this.drawSensorComparison(history, textColor, successColor, alertColor);
        } else {
            // Standard Line Graph (CPU & Latency)
            this.drawDoubleLine(history, 'cpu', 'rssi', 'CPU Load (%)', 'RSSI (dBm)', -100, 100, primaryColor, successColor, textColor);
        }
    }

    drawDoubleLine(history, key1, key2, label1, label2, minVal, maxVal, color1, color2, textColor) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 25;
        const chartW = w - padding * 2;
        const chartH = h - padding * 2;

        this.drawGrid(chartW, chartH, padding, textColor);

        const getX = (index) => padding + (index / (history.length - 1)) * chartW;
        const getY = (val) => {
            const clamped = Math.max(minVal, Math.min(maxVal, val));
            const ratio = (clamped - minVal) / (maxVal - minVal);
            return padding + chartH - ratio * chartH;
        };

        // Draw Key 1 (Primary metric, e.g. CPU or RSSI)
        this.ctx.beginPath();
        this.ctx.strokeStyle = color1;
        this.ctx.lineWidth = 2;
        history.forEach((t, i) => {
            const x = getX(i);
            const y = getY(t[key1]);
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });
        this.ctx.stroke();

        // Draw Area Fill for Key 1
        this.ctx.lineTo(getX(history.length - 1), padding + chartH);
        this.ctx.lineTo(getX(0), padding + chartH);
        this.ctx.closePath();
        const grad1 = this.ctx.createLinearGradient(0, padding, 0, padding + chartH);
        grad1.addColorStop(0, color1 + '30'); // 20% opacity
        grad1.addColorStop(1, color1 + '00'); // transparent
        this.ctx.fillStyle = grad1;
        this.ctx.fill();

        // Draw Key 2 (Secondary metric, e.g. Heap or Noise)
        this.ctx.beginPath();
        this.ctx.strokeStyle = color2;
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([4, 4]);
        history.forEach((t, i) => {
            const x = getX(i);
            const y = getY(t[key2]);
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Reset dash

        // Draw Labels
        this.ctx.fillStyle = textColor;
        this.ctx.font = '9px Fira Code';
        this.ctx.textAlign = 'left';
        
        // Color indicators
        this.ctx.fillStyle = color1;
        this.ctx.fillRect(padding, 8, 8, 8);
        this.ctx.fillStyle = textColor;
        this.ctx.fillText(`${label1}: ${history[history.length - 1][key1]}`, padding + 12, 15);

        this.ctx.fillStyle = color2;
        this.ctx.fillRect(padding + 160, 8, 8, 8);
        this.ctx.fillStyle = textColor;
        this.ctx.fillText(`${label2}: ${history[history.length - 1][key2]}`, padding + 172, 15);
    }

    drawLatencyBars(history, textColor, primaryColor, alertColor) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 25;
        const chartW = w - padding * 2;
        const chartH = h - padding * 2;

        this.drawGrid(chartW, chartH, padding, textColor);

        const limit = 1500; // max latency ms
        const barWidth = Math.max(2, Math.floor(chartW / history.length) - 2);

        history.forEach((t, i) => {
            const x = padding + (i / history.length) * chartW;
            const latency = t.latency || 4; // default 4ms
            const heightRatio = Math.min(1, latency / limit);
            const barH = heightRatio * chartH;
            const y = padding + chartH - barH;

            this.ctx.fillStyle = latency > 500 ? alertColor : primaryColor;
            this.ctx.fillRect(x, y, barWidth, barH);
        });

        // Draw Header
        this.ctx.fillStyle = textColor;
        this.ctx.font = '9px Fira Code';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`TRANSMISSION LATENCY: ${history[history.length - 1].latency} ms`, padding, 15);
    }

    drawTimingHistogram(history, textColor, successColor) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 25;
        const chartW = w - padding * 2;
        const chartH = h - padding * 2;

        this.drawGrid(chartW, chartH, padding, textColor);

        // Render Timing execution time (duration in microseconds)
        this.ctx.fillStyle = successColor;
        this.ctx.font = '9px Fira Code';
        this.ctx.textAlign = 'left';
        
        const currentTiming = history[history.length - 1].timing;
        if (currentTiming) {
            this.ctx.fillText(`MICROCONTROLLER CRYPTO TIMING: ${currentTiming.toFixed(2)} μs`, padding, 15);

            // Draw simple distribution bars
            const bars = 8;
            const colW = chartW / bars;
            for (let i = 0; i < bars; i++) {
                const colH = Math.max(10, Math.sin((i / (bars - 1)) * Math.PI) * chartH * 0.7 + (Math.random() * 8 - 4));
                const x = padding + i * colW + 4;
                const y = padding + chartH - colH;
                
                // Highlight the active bucket
                const isActiveBucket = Math.abs((currentTiming - 12) / 4 - i) < 1;
                this.ctx.fillStyle = isActiveBucket ? successColor : successColor + '40';
                this.ctx.fillRect(x, y, colW - 8, colH);
            }
        } else {
            this.ctx.fillText(`MEASURING SIDE-CHANNEL CPU EXECUTION TIMINGS...`, padding, 15);
        }
    }

    drawSensorComparison(history, textColor, successColor, alertColor) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 25;
        const chartW = w - padding * 2;
        const chartH = h - padding * 2;

        this.drawGrid(chartW, chartH, padding, textColor);

        const getX = (index) => padding + (index / (history.length - 1)) * chartW;
        
        // Sensor values sit between 0 and 150
        const getY = (val) => {
            const clamped = Math.max(0, Math.min(150, val));
            return padding + chartH - (clamped / 150) * chartH;
        };

        const scale = window.simControls?.manipScale || 30;

        // Draw Line 1: Legitimate Physical values (Sine curve representation)
        this.ctx.beginPath();
        this.ctx.strokeStyle = successColor;
        this.ctx.lineWidth = 1.5;
        history.forEach((t, i) => {
            const time = (t.timestamp) / 1000;
            const originalVal = 25 + Math.sin(time) * 10;
            const x = getX(i);
            const y = getY(originalVal);
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });
        this.ctx.stroke();

        // Draw Line 2: Manipulated/Received values
        this.ctx.beginPath();
        this.ctx.strokeStyle = alertColor;
        this.ctx.lineWidth = 2;
        history.forEach((t, i) => {
            const time = (t.timestamp) / 1000;
            const originalVal = 25 + Math.sin(time) * 10;
            const manipulatedVal = originalVal + scale;
            const x = getX(i);
            const y = getY(manipulatedVal);
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });
        this.ctx.stroke();

        // Draw Legend labels
        this.ctx.fillStyle = successColor;
        this.ctx.fillRect(padding, 8, 8, 8);
        this.ctx.fillStyle = textColor;
        this.ctx.fillText(`True Temp Sensor Value`, padding + 12, 15);

        this.ctx.fillStyle = alertColor;
        this.ctx.fillRect(padding + 160, 8, 8, 8);
        this.ctx.fillStyle = textColor;
        this.ctx.fillText(`Tampered Value Received`, padding + 172, 15);
    }

    drawGrid(chartW, chartH, padding, textColor) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        // Draw grid columns
        for (let i = 0; i <= 4; i++) {
            const x = padding + (i / 4) * chartW;
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding);
            this.ctx.lineTo(x, padding + chartH);
            this.ctx.stroke();
        }

        // Draw grid rows
        for (let i = 0; i <= 3; i++) {
            const y = padding + (i / 3) * chartH;
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(padding + chartW, y);
            this.ctx.stroke();
        }

        // Draw outer borders
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeRect(padding, padding, chartW, chartH);
    }
}
