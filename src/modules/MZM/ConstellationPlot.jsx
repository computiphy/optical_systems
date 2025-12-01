import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const ConstellationPlot = ({ ampI, ampQ, phaseShiftEnabled, modulationFormat, biasDrift, time }) => {
    const canvasRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = w / 4;

        const isDark = theme === 'dark';
        const axisColor = isDark ? '#657b83' : '#93a1a1';
        const pointColor = '#d33682'; // Magenta
        const trailColor = isDark ? 'rgba(211, 54, 130, 0.2)' : 'rgba(211, 54, 130, 0.2)';

        ctx.clearRect(0, 0, w, h);

        // Grid / Axes
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
        ctx.stroke();

        // Calculate Points based on Modulation Format
        let points = [];

        // Bias drift acts as a rotation or distortion
        // For MZM, bias drift usually means the Q arm is not exactly 90 degrees from I, or the null point is shifted.
        // Let's model bias drift as a phase error in the Q arm.
        const driftAngle = biasDrift || 0;

        // Helper to add point
        const addPoint = (iVal, qVal) => {
            // Apply drift to Q
            // If perfect, Q is orthogonal. If drift, Q axis is rotated?
            // Actually, in an IQ modulator, bias drift often means the "origin" shifts (carrier leakage) 
            // or the phase relationship is not 90 deg.
            // Let's assume "Quadrature Error" type drift: Q axis is not at 90 deg but at 90 + drift.

            // I is along X axis.
            // Q is along an axis tilted by driftAngle.
            // Result = I * x_vec + Q * q_vec

            // x_vec = (1, 0)
            // q_vec = (sin(driftAngle), cos(driftAngle)) ? No, normally Q is (0, 1).
            // If drift is 0, Q is (0, 1).
            // If drift is small, Q is (-sin(drift), cos(drift)) ... wait.
            // Let's say the phase difference is 90 + drift.
            // Complex amplitude = I + Q * exp(j * (pi/2 + drift))
            // = I + Q * (cos(pi/2+drift) + j*sin(pi/2+drift))
            // = I + Q * (-sin(drift) + j*cos(drift))

            const qPhase = Math.PI / 2 + driftAngle;
            const real = iVal + qVal * Math.cos(qPhase);
            const imag = qVal * Math.sin(qPhase);

            points.push({ x: real, y: imag });
        };

        if (modulationFormat === 'BPSK') {
            addPoint(ampI, 0);
            addPoint(-ampI, 0);
        } else if (modulationFormat === 'QPSK') {
            addPoint(ampI, ampQ);
            addPoint(-ampI, ampQ);
            addPoint(-ampI, -ampQ);
            addPoint(ampI, -ampQ);
        } else if (modulationFormat === '8-PSK') {
            for (let k = 0; k < 8; k++) {
                const theta = k * Math.PI / 4;
                // 8-PSK is usually constant amplitude circle
                // We need to derive I and Q drive levels that produce this.
                // I = cos(theta), Q = sin(theta)
                addPoint(ampI * Math.cos(theta), ampQ * Math.sin(theta));
            }
        } else if (modulationFormat === '16-QAM') {
            const levels = [-3, -1, 1, 3];
            levels.forEach(i => {
                levels.forEach(q => {
                    addPoint(i * ampI / 3, q * ampQ / 3);
                });
            });
        } else if (modulationFormat === 'NRZ') {
            addPoint(ampI, 0);
            addPoint(0, 0); // OOK often goes to 0
        }

        // Draw Points
        points.forEach(p => {
            const screenX = cx + p.x * scale;
            const screenY = cy - p.y * scale;

            ctx.beginPath();
            ctx.fillStyle = pointColor;
            ctx.arc(screenX, screenY, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw "Current" rotating point for effect if needed, or just static constellation
        // The user asked for "Animation from input bitstream...".
        // Maybe we show a "ghost" point moving between them?
        // For now, let's keep it static constellation + maybe a rotating phasor if it was a pure tone.

    }, [ampI, ampQ, phaseShiftEnabled, modulationFormat, biasDrift, theme]);

    return <canvas ref={canvasRef} width={300} height={300} className="w-full bg-white dark:bg-gray-900 rounded border border-sol-base1 dark:border-sol-orange/30" />;
};

export default ConstellationPlot;
