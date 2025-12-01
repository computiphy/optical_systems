import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const ConstellationPlot = ({ modType, noise, modDefs }) => {
    const canvasRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const scale = width / 3.5;

        const isDark = theme === 'dark';
        const axisColor = isDark ? '#cb4b16' : '#586e75'; // Orange in dark, dark gray in light
        const textColor = isDark ? '#839496' : '#657b83';
        const idealPointColor = isDark ? '#ffffff' : '#dc322f'; // White points in dark, red in light
        const noiseColor = isDark ? 'rgba(203, 75, 22, 0.4)' : 'rgba(38, 139, 210, 0.4)'; // Orange clouds in dark, blue in light

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw Axes
        ctx.beginPath();
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
        ctx.moveTo(0, cy); ctx.lineTo(width, cy);
        ctx.stroke();

        // Ticks & Labels
        ctx.fillStyle = textColor;
        ctx.font = '10px sans-serif';

        // X-axis ticks
        [-1, 1].forEach(val => {
            const x = cx + val * scale;
            ctx.beginPath();
            ctx.moveTo(x, cy - 3);
            ctx.lineTo(x, cy + 3);
            ctx.stroke();
            ctx.fillText(val.toString(), x - 5, cy + 15);
        });

        // Y-axis ticks
        [-1, 1].forEach(val => {
            const y = cy - val * scale;
            ctx.beginPath();
            ctx.moveTo(cx - 3, y);
            ctx.lineTo(cx + 3, y);
            ctx.stroke();
            ctx.fillText(val.toString(), cx + 8, y + 3);
        });

        // Draw Points
        const currentMod = modDefs[modType];
        const samplesPerSymbol = 50;

        currentMod.points.forEach(pt => {
            const idealX = cx + pt[0] * scale;
            const idealY = cy - pt[1] * scale;

            // Ideal Point
            ctx.beginPath();
            ctx.fillStyle = idealPointColor;
            ctx.arc(idealX, idealY, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Noise Cloud
            ctx.fillStyle = noiseColor;
            for (let i = 0; i < samplesPerSymbol; i++) {
                const r1 = Math.random();
                const r2 = Math.random();
                const randStdNormal = Math.sqrt(-2.0 * Math.log(r1)) * Math.sin(2.0 * Math.PI * r2);
                const randStdNormal2 = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2.0 * Math.PI * r2);

                const noiseX = randStdNormal * (noise * scale);
                const noiseY = randStdNormal2 * (noise * scale);

                ctx.beginPath();
                ctx.arc(idealX + noiseX, idealY + noiseY, 1.5, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        ctx.fillStyle = textColor;
        ctx.font = '14px Arial';
        ctx.fillText('I', width - 20, cy - 10);
        ctx.fillText('Q', cx + 10, 20);

    }, [modType, noise, modDefs, theme]);

    return (
        <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="shadow-inner cursor-crosshair bg-white dark:bg-gray-900 max-w-full h-auto rounded-lg border border-sol-base1 dark:border-sol-orange/30 transition-colors duration-300"
        />
    );
};

export default ConstellationPlot;