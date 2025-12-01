import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const IQPlot = ({ i, q, phase, width = 200, height = 200 }) => {
    const canvasRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // High DPI Handling
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = w / 3; // Keep scale relative to view width

        const isDark = theme === 'dark';
        const axisColor = isDark ? '#cb4b16' : '#93a1a1';
        const textColor = isDark ? '#839496' : '#586e75';
        const circleColor = isDark ? '#586e75' : '#eee8d5';
        const vectorColor = isDark ? '#d33682' : '#d33682';
        const pointColor = isDark ? '#ffffff' : '#dc322f';
        const phaseColor = isDark ? '#2aa198' : '#2aa198';

        ctx.clearRect(0, 0, w, h);

        // Styling
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Axes
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.moveTo(0, cy); ctx.lineTo(w, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ticks & Labels
        ctx.fillStyle = textColor;
        ctx.font = '600 9px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // X-axis ticks
        [-1, 1].forEach(val => {
            const x = cx + val * scale;
            ctx.beginPath();
            ctx.moveTo(x, cy - 3);
            ctx.lineTo(x, cy + 3);
            ctx.stroke();
            ctx.fillText(val.toString(), x, cy + 12);
        });

        // Y-axis ticks
        [-1, 1].forEach(val => {
            const y = cy - val * scale;
            ctx.beginPath();
            ctx.moveTo(cx - 3, y);
            ctx.lineTo(cx + 3, y);
            ctx.stroke();
            ctx.fillText(val.toString(), cx + 12, y);
        });


        // Unit Circle (Reference)
        ctx.beginPath();
        ctx.strokeStyle = circleColor;
        ctx.lineWidth = 1.5;
        ctx.arc(cx, cy, scale, 0, 2 * Math.PI);
        ctx.stroke();

        // Vector
        const x = cx + i * scale;
        const y = cy - q * scale; // Canvas Y is inverted

        ctx.beginPath();
        ctx.strokeStyle = vectorColor;
        ctx.lineWidth = 2;
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Point
        ctx.beginPath();
        ctx.fillStyle = pointColor;
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Phase Arc
        ctx.beginPath();
        ctx.strokeStyle = phaseColor;
        ctx.lineWidth = 1.5;
        ctx.arc(cx, cy, 20, 0, -phase, phase > 0); // Visual arc
        ctx.stroke();

        // Labels
        ctx.fillStyle = textColor;
        ctx.font = 'bold 10px "Segoe UI", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('I', w - 5, cy - 5);
        ctx.textAlign = 'left';
        ctx.fillText('Q', cx + 5, 10);

    }, [i, q, phase, theme]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', maxWidth: '200px', aspectRatio: '1/1' }}
            className="block bg-white dark:bg-gray-900 rounded-lg border border-sol-base1 dark:border-sol-orange/30 transition-colors duration-300"
        />
    );
};

export default IQPlot;
