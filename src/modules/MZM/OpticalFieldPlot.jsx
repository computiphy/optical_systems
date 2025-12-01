import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const OpticalFieldPlot = ({ ampI, ampQ, freq, phaseShiftEnabled, modulationFormat, biasDrift, time }) => {
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
        const realColor = '#b58900'; // Yellow
        const imagColor = '#2aa198'; // Cyan

        ctx.clearRect(0, 0, w, h);

        // Axes
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Calculate Field E(t)
        // E(t) = (I(t) + jQ(t)) * exp(j*omega*t) ? 
        // Usually we plot the envelope or the carrier.
        // Let's plot Real(E) and Imag(E) of the complex envelope.

        const driftAngle = biasDrift || 0;
        const qPhaseOffset = (phaseShiftEnabled ? Math.PI / 2 : 0) + driftAngle;

        const drawComponent = (color, isImag) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            for (let x = 0; x < w; x++) {
                const t = (x / w) * (4 * Math.PI) / freq;

                // Drive signals (simplified sine for visualization)
                const driveI = ampI * Math.sin(t * freq + time);
                const driveQ = ampQ * Math.sin(t * freq + time); // Same source, split? Or independent?
                // For QPSK they are independent data. 
                // For this visualization let's assume a simple test tone where Q is 90 deg shifted from I if "Phase Shift" is on.
                // Wait, if it's QPSK, I and Q are random data.
                // If it's a test tone (like "Phase shift vs RF voltage"), they are sines.

                // Let's assume we are visualizing the "Output Field" for a single tone input to the IQ modulator.
                // Input RF to I: cos(wt)
                // Input RF to Q: cos(wt - pi/2) (if 90 deg shift)

                const sigI = ampI * Math.cos(t * freq + time);
                const sigQ = ampQ * Math.cos(t * freq + time - (phaseShiftEnabled ? Math.PI / 2 : 0));

                // Output Field Envelope = sigI + j * sigQ * exp(j*drift)
                // = sigI + j * sigQ * (cos(drift) + j*sin(drift))
                // = (sigI - sigQ*sin(drift)) + j * (sigQ*cos(drift))

                const realPart = sigI - sigQ * Math.sin(driftAngle);
                const imagPart = sigQ * Math.cos(driftAngle);

                const val = isImag ? imagPart : realPart;
                const y = h / 2 - val * (h / 4);

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        };

        drawComponent(realColor, false); // Real
        drawComponent(imagColor, true);  // Imag

        // Legend
        ctx.fillStyle = realColor;
        ctx.fillText("Real(E)", 10, 20);
        ctx.fillStyle = imagColor;
        ctx.fillText("Imag(E)", 60, 20);

    }, [ampI, ampQ, freq, phaseShiftEnabled, modulationFormat, biasDrift, time, theme]);

    return <canvas ref={canvasRef} width={400} height={200} className="w-full bg-white dark:bg-gray-900 rounded border border-sol-base1 dark:border-sol-orange/30" />;
};

export default OpticalFieldPlot;
