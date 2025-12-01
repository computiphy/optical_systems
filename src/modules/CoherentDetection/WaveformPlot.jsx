import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const WaveformPlot = ({
    amplitude,
    frequency,
    phase,
    color = '#268bd2',
    label,
    isSum = false,
    secondSignal = null,
    height = 100
}) => {
    const canvasRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // High DPI Handling
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Set actual size in memory (scaled to account for extra pixel density)
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');

        // Normalize coordinate system to use css pixels
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height; // Use rect height, not prop height for drawing logic
        const centerY = height / 2;
        const padding = 35; // Space for labels

        const isDark = theme === 'dark';
        const axisColor = isDark ? '#cb4b16' : '#93a1a1';
        const textColor = isDark ? '#839496' : '#586e75';
        const gridColor = isDark ? '#586e75' : '#cbd5e1';
        const labelColor = isDark ? '#839496' : '#657b83';

        ctx.clearRect(0, 0, width, height);

        // Styling
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw Axes
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        // X-axis
        ctx.moveTo(padding, centerY);
        ctx.lineTo(width, centerY);
        // Y-axis
        ctx.moveTo(padding, 10);
        ctx.lineTo(padding, height - 10);
        ctx.stroke();

        // Axis Labels
        ctx.fillStyle = textColor;
        ctx.font = '600 9px "Segoe UI", sans-serif'; // High res font
        ctx.fillText('Time (ns)', width - 45, centerY + 12);

        ctx.save();
        ctx.translate(12, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Amp (a.u.)', 0, 0);
        ctx.restore();

        // Ticks
        ctx.beginPath();
        ctx.strokeStyle = gridColor; // Lighter for grid

        // Time ticks (X-axis)
        // Show a 10ns window to make the waveforms look less cluttered (lower frequency visual)
        const timeWindow = 10; // ns
        const pxPerNs = (width - padding) / timeWindow;

        for (let t = 0; t <= timeWindow; t += 2) {
            const x = padding + t * pxPerNs;
            // Tick mark
            ctx.moveTo(x, centerY - 3);
            ctx.lineTo(x, centerY + 3);

            // Grid line (optional, faint)
            // ctx.moveTo(x, 0); ctx.lineTo(x, height);

            // Label
            ctx.fillStyle = labelColor;
            ctx.textAlign = 'center';
            ctx.fillText(t.toString(), x, centerY + 12);
        }
        ctx.stroke();

        // Draw Waveform
        ctx.beginPath();
        ctx.strokeStyle = color; // Use passed color, maybe adjust brightness if needed
        ctx.lineWidth = 1.5; // Thinner, sharper line

        // Resolution: 1 point per pixel
        for (let x = padding; x < width; x++) {
            // Map pixel x to time t
            // x = padding + t * pxPerNs  =>  t = (x - padding) / pxPerNs
            const t = (x - padding) / pxPerNs;

            let y = 0;
            if (isSum && secondSignal) {
                // E_sum = E_s + E_LO
                const y1 = amplitude * Math.cos(frequency * t + phase);
                const y2 = secondSignal.amplitude * Math.cos(secondSignal.frequency * t + secondSignal.phase);
                y = y1 + y2;
            } else {
                y = amplitude * Math.cos(frequency * t + phase);
            }

            // Scale Y: fit amplitude 4 (2+2) into half height with some margin
            // Max Y is approx 4. Available half-height is (height/2 - 10).
            // Scale factor = (height/2 - 15) / 4
            const scaleY = (height / 2 - 15) / 2.5; // Assuming max single amp is 2

            const plotY = centerY - (y * scaleY);

            if (x === padding) ctx.moveTo(x, plotY);
            else ctx.lineTo(x, plotY);
        }
        ctx.stroke();

        // Label
        if (label) {
            ctx.fillStyle = textColor;
            ctx.font = 'bold 10px "Segoe UI", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(label, width - 10, 20);
        }

    }, [amplitude, frequency, phase, color, label, isSum, secondSignal, height, theme]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%' }}
            className="block bg-white dark:bg-gray-900 rounded-lg border border-sol-base1 dark:border-sol-orange/30 transition-colors duration-300"
        />
    );
};

export default WaveformPlot;
