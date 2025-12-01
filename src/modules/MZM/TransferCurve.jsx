import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const TransferCurve = ({ biasV }) => {
    const canvasRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        const isDark = theme === 'dark';
        const axisColor = isDark ? '#cb4b16' : '#93a1a1';
        const textColor = isDark ? '#839496' : '#586e75';
        const curveColor = isDark ? '#268bd2' : '#268bd2';
        const pointColor = isDark ? '#d33682' : '#d33682';

        ctx.clearRect(0, 0, w, h);

        // Curve
        ctx.beginPath();
        ctx.strokeStyle = curveColor;
        ctx.lineWidth = 3;

        const zeroX = w / 2;
        const scaleX = w / 4;
        const scaleY = h * 0.8;
        const offsetY = h * 0.9;

        for (let x = 0; x < w; x++) {
            const normalizedX = (x - zeroX) / scaleX * Math.PI;
            const y = offsetY - (0.5 * (1 + Math.cos(normalizedX))) * scaleY;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Axes & Ticks
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.fillStyle = textColor;
        ctx.font = '12px sans-serif';

        // X-Axis
        ctx.beginPath();
        ctx.moveTo(0, offsetY);
        ctx.lineTo(w, offsetY);
        ctx.stroke();
        ctx.fillText('Bias Voltage (Vπ)', w - 100, offsetY + 20);

        // X Ticks (-pi, 0, pi)
        [-1, 0, 1].forEach(val => {
            const x = zeroX + val * (scaleX / Math.PI) * Math.PI; // scaleX corresponds to PI range roughly? No, scaleX is w/4. 
            // normalizedX = (x - zeroX) / scaleX * PI
            // if normalizedX = PI, then PI = (x - zeroX) / scaleX * PI => 1 = (x - zeroX)/scaleX => x = zeroX + scaleX
            const tickX = zeroX + val * scaleX;

            ctx.beginPath();
            ctx.moveTo(tickX, offsetY - 5);
            ctx.lineTo(tickX, offsetY + 5);
            ctx.stroke();

            let label = '0';
            if (val === -1) label = '-Vπ';
            if (val === 1) label = 'Vπ';
            ctx.fillText(label, tickX - 10, offsetY + 20);
        });

        // Y-Axis
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(20, h);
        ctx.stroke();
        ctx.save();
        ctx.translate(15, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Power (P_out)', 0, 0);
        ctx.restore();

        // Bias Point
        const biasX = zeroX + (biasV / Math.PI) * scaleX;
        const biasY = offsetY - (0.5 * (1 + Math.cos(biasV))) * scaleY;

        ctx.beginPath();
        ctx.fillStyle = pointColor;
        ctx.arc(biasX, biasY, 8, 0, 2 * Math.PI);
        ctx.fill();

    }, [biasV, theme]);

    return <canvas ref={canvasRef} width={500} height={300} className="w-full bg-white dark:bg-gray-900 shadow-sm rounded border border-sol-base1 dark:border-sol-orange/30 transition-colors duration-300" />;
};

export default TransferCurve;