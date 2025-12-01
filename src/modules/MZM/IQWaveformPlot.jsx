import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const IQWaveformPlot = ({ ampI, ampQ, freq, phaseShiftEnabled, modulationFormat, time }) => {
    const canvasRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        const isDark = theme === 'dark';
        const axisColor = isDark ? '#657b83' : '#93a1a1';
        const iColor = '#268bd2'; // Blue
        const qColor = '#dc322f'; // Red

        ctx.clearRect(0, 0, w, h);

        // Draw Axes
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2); // X axis
        ctx.stroke();

        // Generate Waveforms
        // We'll simulate a window of time. 'time' prop acts as a phase offset for animation.

        const drawWave = (color, isQ) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            const amplitude = isQ ? ampQ : ampI;
            // If Q and phase shift enabled, add PI/2
            let phaseOffset = 0;
            if (isQ && phaseShiftEnabled) phaseOffset = Math.PI / 2;

            for (let x = 0; x < w; x++) {
                // Map x to time t
                // Let's say the width represents 2 periods at default freq
                const t = (x / w) * (4 * Math.PI) / freq;

                let val = 0;

                if (modulationFormat === 'NRZ' || modulationFormat === 'BPSK') {
                    // Digital-like square wave approximation or just sine for carrier?
                    // The prompt asks for "Drive Waveforms". For BPSK/QPSK these are digital data streams.
                    // But for the "RF" visualization, usually we show the carrier or the envelope.
                    // Let's stick to sine waves for the "RF" representation as implied by "Phase shift vs RF voltage".
                    // OR, if it's the data signal, it should be square.
                    // The prompt says: "I/Q Drive Waveforms... Show 90 deg quadrature relationship".
                    // Let's assume these are the modulating signals.

                    if (modulationFormat === 'NRZ' || modulationFormat === 'BPSK' || modulationFormat === 'QPSK' || modulationFormat === '16-QAM') {
                        // Create a "data" stream effect
                        // We can use sin for simplicity to show the phase relationship clearly, 
                        // or construct a pseudo-random bit stream.
                        // Let's use Sine for the "RF Drive" visualization as it's clearer for phase shifts.
                        val = amplitude * Math.sin(t * freq + time + phaseOffset);
                    } else {
                        val = amplitude * Math.sin(t * freq + time + phaseOffset);
                    }
                } else {
                    val = amplitude * Math.sin(t * freq + time + phaseOffset);
                }

                const y = h / 2 - val * (h / 4); // Scale to fit
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        };

        drawWave(iColor, false); // I
        drawWave(qColor, true);  // Q

        // Legend
        ctx.fillStyle = iColor;
        ctx.fillText("I(t)", 10, 20);
        ctx.fillStyle = qColor;
        ctx.fillText("Q(t)", 50, 20);

    }, [ampI, ampQ, freq, phaseShiftEnabled, modulationFormat, time, theme]);

    return <canvas ref={canvasRef} width={400} height={200} className="w-full bg-white dark:bg-gray-900 rounded border border-sol-base1 dark:border-sol-orange/30" />;
};

export default IQWaveformPlot;
