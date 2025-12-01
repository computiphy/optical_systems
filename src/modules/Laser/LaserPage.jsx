import React, { useState, useMemo, useRef, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Slider from '../../components/ui/Slider';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import theoryContent from '../../theory/laser.md?raw';

// --- Physics Constants ---
const LAMBDA_START = 1530;
const LAMBDA_END = 1570;
const LAMBDA_POINTS = 400;
const PEAK_SPACING_A = 4.0; // nm
const PEAK_SPACING_B = 4.4; // nm (Vernier effect: slightly different)
const PEAK_WIDTH = 0.6; // nm
const REFLECTIVITY_BASE = 0.1;
const REFLECTIVITY_PEAK = 0.9;

const LaserPage = () => {
    // --- State ---
    const [currentA, setCurrentA] = useState(50); // 0-100
    const [currentB, setCurrentB] = useState(50); // 0-100
    const [phase, setPhase] = useState(50); // 0-100
    const [showTheory, setShowTheory] = useState(false);

    // --- Physics Logic ---
    const { wavelengths, spectrumA, spectrumB, productSpectrum, maxPeakWavelength, modeMapData } = useMemo(() => {
        const wl = [];
        const step = (LAMBDA_END - LAMBDA_START) / LAMBDA_POINTS;
        for (let i = 0; i < LAMBDA_POINTS; i++) {
            wl.push(LAMBDA_START + i * step);
        }

        // Shift calculation: Heating usually red-shifts (increases wavelength)
        // Let's assume 0-100 current shifts by ~1 FSR (Free Spectral Range) or a bit more
        const shiftA = (currentA / 100) * PEAK_SPACING_A;
        const shiftB = (currentB / 100) * PEAK_SPACING_B;
        const phaseShift = (phase / 100) * 0.5; // Small fine tuning

        // Generate Spectra
        // ISG Mirror: Flat-top envelope. We simulate this by just having equal amplitude peaks.
        // Standard Sampled Grating would have a Sinc envelope.

        const calcReflectivity = (lambda, spacing, shift) => {
            // Sum of Gaussians
            // Find nearest peak center
            const relativeLambda = lambda - 1530 - shift;
            const peakIndex = Math.round(relativeLambda / spacing);
            const center = 1530 + shift + peakIndex * spacing;

            // Gaussian profile
            const diff = lambda - center - phaseShift;
            const val = Math.exp(-(diff * diff) / (2 * (PEAK_WIDTH / 2.355) ** 2)); // FWHM to sigma

            return REFLECTIVITY_BASE + (REFLECTIVITY_PEAK - REFLECTIVITY_BASE) * val;
        };

        const specA = wl.map(l => calcReflectivity(l, PEAK_SPACING_A, shiftA));
        const specB = wl.map(l => calcReflectivity(l, PEAK_SPACING_B, shiftB));

        const prod = wl.map((l, i) => specA[i] * specB[i]);

        // Find Supermode (Max Peak)
        let maxVal = -1;
        let maxIdx = -1;
        for (let i = 0; i < wl.length; i++) {
            if (prod[i] > maxVal) {
                maxVal = prod[i];
                maxIdx = i;
            }
        }
        const maxPeakWavelength = wl[maxIdx];

        // Mode Map Data Generation
        // We want to visualize the "Islands".
        // The condition for alignment is roughly: I_A/SpacingA - I_B/SpacingB = integer
        // Let's generate a grid of "stable" centers.
        const islands = [];
        for (let m = -2; m < 12; m++) {
            for (let n = -2; n < 12; n++) {
                // Center of a mode in Current space (approximate)
                // This is a simplification for visualization
                const cA = (m * 20) + (n * 5);
                const cB = (n * 20) + (m * 5);

                if (cA > -20 && cA < 120 && cB > -20 && cB < 120) {
                    islands.push({ x: cA, y: cB, id: `${m},${n}` });
                }
            }
        }

        return { wavelengths: wl, spectrumA: specA, spectrumB: specB, productSpectrum: prod, maxPeakWavelength, modeMapData: islands };
    }, [currentA, currentB, phase]);

    // --- Mode Hop Detection ---
    const [isHopping, setIsHopping] = useState(false);
    const lastModeRef = useRef("0,0");

    useEffect(() => {
        // Determine current mode (nearest integer pair)
        // In our simplified model, mode center is at integer m,n
        // m approx (currentA - currentB)/diffSpacing... 
        // Actually, let's just use the grid coordinates we defined:
        // cA = 20m + 5n, cB = 20n + 5m
        // Inverting this 2x2 matrix to find m,n from currentA, currentB is better.
        // Det = 400 - 25 = 375
        // m = (20*A - 5*B) / 375
        // n = (-5*A + 20*B) / 375

        const m = Math.round((20 * currentA - 5 * currentB) / 375);
        const n = Math.round((-5 * currentA + 20 * currentB) / 375);
        const currentMode = `${m},${n}`;

        if (currentMode !== lastModeRef.current) {
            setIsHopping(true);
            setTimeout(() => setIsHopping(false), 200);
            lastModeRef.current = currentMode;
        }
    }, [currentA, currentB]);

    // --- Handlers ---
    const handleCMA = (e) => {
        const val = parseFloat(e.target.value);
        const delta = val - ((currentA + currentB) / 2);
        // Move both in same direction
        let newA = currentA + delta;
        let newB = currentB + delta;

        // Clamp
        if (newA < 0) newA = 0; if (newA > 100) newA = 100;
        if (newB < 0) newB = 0; if (newB > 100) newB = 100;

        setCurrentA(newA);
        setCurrentB(newB);
    };

    const handleDMA = (e) => {
        const val = parseFloat(e.target.value);
        const currentDiff = currentA - currentB;
        const delta = val - currentDiff; // Change in difference

        // Move in opposite directions
        // A - B = val
        // A + B = constant (approx)
        // newA = A + d/2, newB = B - d/2

        let newA = currentA + delta / 2;
        let newB = currentB - delta / 2;

        // Clamp
        if (newA < 0) newA = 0; if (newA > 100) newA = 100;
        if (newB < 0) newB = 0; if (newB > 100) newB = 100;

        setCurrentA(newA);
        setCurrentB(newB);
    };

    // --- Visual Helpers ---
    const getPath = (data, color, filled = false, height = 150, width = 600) => {
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - (val * height);
            return `${x},${y}`;
        });

        if (filled) {
            return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
        }
        return `M ${points.join(' L ')}`;
    };

    // Helper for X-axis ticks
    const renderXAxis = () => {
        const ticks = [];
        const range = LAMBDA_END - LAMBDA_START;
        const width = 600;
        const pxPerNm = width / range;

        for (let l = LAMBDA_START; l <= LAMBDA_END; l += 1) {
            const x = (l - LAMBDA_START) * pxPerNm;
            const isMajor = l % 5 === 0;

            ticks.push(
                <g key={l} transform={`translate(${x}, 140)`}>
                    <line
                        y1={0}
                        y2={isMajor ? 10 : 5}
                        stroke="currentColor"
                        className={isMajor ? "text-gray-400 dark:text-gray-500" : "text-gray-300 dark:text-gray-700"}
                        strokeWidth={isMajor ? 1.5 : 1}
                    />
                    {isMajor && (
                        <text
                            y={25}
                            textAnchor="middle"
                            className="text-[10px] font-mono fill-sol-base01 dark:fill-sol-base0"
                        >
                            {l}
                        </text>
                    )}
                </g>
            );
        }
        return ticks;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-sol-blue dark:text-sol-orange flex items-center gap-3">
                            Widely Tunable DBR Laser
                            <button
                                onClick={() => setShowTheory(!showTheory)}
                                className="p-2 rounded-full hover:bg-sol-base3 dark:hover:bg-gray-800 text-sol-base01 dark:text-sol-orange transition-colors"
                                title="Toggle Theory"
                            >
                                {showTheory ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </button>
                        </h1>
                        <p className="text-sol-base01 dark:text-sol-base0 mt-1">Vernier Tuning Mechanism</p>
                    </div>
                </div>

                {showTheory && (
                    <Card className="prose prose-sm dark:prose-invert max-w-none animate-fade-in">
                        <div className="text-sol-base00 dark:text-sol-base0 markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {theoryContent}
                            </ReactMarkdown>
                        </div>
                    </Card>
                )}
            </div>

            {/* Top Section: Cavity Schematic */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-sol-base00 dark:text-sol-base0 mb-4 flex items-center gap-2">
                    <Info size={18} /> Laser Cavity Schematic
                </h3>
                <div className="relative h-48 bg-sol-base3 dark:bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden border border-sol-base1 dark:border-sol-orange/20">
                    {/* Beam */}
                    <div className="absolute w-full h-2 bg-red-500/50 blur-sm animate-pulse top-1/2 -translate-y-1/2"></div>

                    {/* Components */}
                    <div className="flex items-center gap-1 z-10 h-full py-4">
                        {/* Mirror A Response (Left) */}
                        <div className="h-full w-24 flex items-center justify-center mr-2">
                            <svg viewBox="0 0 100 100" className="w-full h-24 opacity-80">
                                <path d={getPath(spectrumA, null, false, 100, 100)} fill="none" stroke="#3b82f6" strokeWidth="2" />
                            </svg>
                        </div>

                        {/* Mirror A */}
                        <div
                            className="w-24 h-32 border-2 border-blue-500 rounded flex flex-col items-center justify-center transition-colors duration-300 bg-white/50 dark:bg-black/50 backdrop-blur-sm"
                            style={{ borderColor: `rgba(59, 130, 246, ${0.5 + (currentA / 200)})` }}
                        >
                            <span className="font-bold text-blue-600 dark:text-blue-400">Mirror A</span>
                        </div>

                        {/* Phase/Gain */}
                        <div className="w-40 h-32 border-2 border-yellow-500 bg-yellow-500/10 rounded flex flex-col items-center justify-center relative backdrop-blur-sm">
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">Gain & Phase</span>
                            <div className="absolute bottom-2 w-full px-2">
                                <div className="h-1 bg-gray-300 rounded overflow-hidden">
                                    <div className="h-full bg-yellow-500 transition-all" style={{ width: `${phase}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Mirror B */}
                        <div
                            className="w-24 h-32 border-2 border-red-500 rounded flex flex-col items-center justify-center transition-colors duration-300 bg-white/50 dark:bg-black/50 backdrop-blur-sm"
                            style={{ borderColor: `rgba(239, 68, 68, ${0.5 + (currentB / 200)})` }}
                        >
                            <span className="font-bold text-red-600 dark:text-red-400">Mirror B</span>
                        </div>

                        {/* Mirror B Response (Right) */}
                        <div className="h-full w-24 flex items-center justify-center ml-2">
                            <svg viewBox="0 0 100 100" className="w-full h-24 opacity-80">
                                <path d={getPath(spectrumB, null, false, 100, 100)} fill="none" stroke="#ef4444" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>

                    {/* Output Arrow */}
                    <div className="absolute right-4 flex items-center text-red-500 font-bold animate-pulse">
                        Output <span className="text-2xl ml-1">→</span>
                    </div>
                </div>
            </Card>

            {/* Middle Section: Spectral Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-6">
                    <h3 className="text-lg font-bold text-sol-base00 dark:text-sol-base0 mb-4">Spectral Response (Vernier Effect)</h3>
                    <div className="w-full h-[350px] bg-white dark:bg-black rounded-lg border border-sol-base1 dark:border-sol-orange/20 relative overflow-hidden p-4 pb-8">
                        <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeWidth="1" />

                            {/* X-Axis Ticks & Labels */}
                            {renderXAxis()}

                            {/* Mirror A Spectrum (Blue) */}
                            <path
                                d={getPath(spectrumA, null, false, 140, 600)}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeOpacity="0.6"
                            />

                            {/* Mirror B Spectrum (Red) */}
                            <path
                                d={getPath(spectrumB, null, false, 140, 600)}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="2"
                                strokeOpacity="0.6"
                            />

                            {/* Product Spectrum (Green - Supermode) */}
                            <path
                                d={getPath(productSpectrum, null, true, 140, 600)}
                                fill="#22c55e"
                                fillOpacity="0.5"
                                stroke="#22c55e"
                                strokeWidth="2"
                            />
                        </svg>

                        {/* Labels */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 text-xs font-mono bg-white/80 dark:bg-black/80 p-2 rounded border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500/50 border border-blue-500"></div>
                                <span>Mirror A</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500/50 border border-red-500"></div>
                                <span>Mirror B</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500/50 border border-green-500"></div>
                                <span>Net Gain</span>
                            </div>
                        </div>

                        {/* Wavelength Indicator */}
                        <div className="absolute top-2 left-4 text-xs font-mono text-sol-base01 dark:text-sol-base0 bg-white/80 dark:bg-black/80 p-2 rounded border border-gray-200 dark:border-gray-800">
                            Lasing Wavelength: <span className="font-bold text-lg text-sol-blue dark:text-sol-orange">{maxPeakWavelength.toFixed(2)} nm</span>
                        </div>
                    </div>
                </Card>

                {/* Bottom/Right: Controls & Mode Map */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-sol-base00 dark:text-sol-base0 mb-4">Tuning Controls</h3>
                        <div className="space-y-6">
                            <Slider
                                label="Common Mode (CMA)"
                                value={(currentA + currentB) / 2}
                                min={0} max={100} step={0.5}
                                onChange={handleCMA}
                                unit="%"
                            />
                            <Slider
                                label="Differential Mode (DMA)"
                                value={currentA - currentB}
                                min={-100} max={100} step={0.5}
                                onChange={handleDMA}
                                unit="%"
                            />
                            <Slider
                                label="Phase Fine Tune"
                                value={phase}
                                min={0} max={100} step={1}
                                onChange={(e) => setPhase(parseFloat(e.target.value))}
                                unit="%"
                            />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-sol-base00 dark:text-sol-base0 mb-4">Mode Stability Map</h3>
                        <div className="aspect-square w-full bg-sol-base3 dark:bg-gray-900 rounded-lg border border-sol-base1 dark:border-sol-orange/20 relative overflow-hidden">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                {/* Grid/Islands */}
                                {modeMapData.map((island) => {
                                    // Invert Y for display: 100 - y
                                    const yInv = 100 - island.y;
                                    return (
                                        <polygon
                                            key={island.id}
                                            points={`${island.x},${yInv - 8} ${island.x + 8},${yInv} ${island.x},${yInv + 8} ${island.x - 8},${yInv}`}
                                            className="fill-white dark:fill-gray-800 stroke-gray-300 dark:stroke-gray-700"
                                            strokeWidth="0.5"
                                        />
                                    );
                                })}

                                {/* Operating Point */}
                                <circle
                                    cx={currentA}
                                    cy={100 - currentB}
                                    r={isHopping ? "6" : "3"}
                                    className={`stroke-white dark:stroke-black stroke-2 transition-all duration-75 ${isHopping ? 'fill-sol-red dark:fill-sol-red' : 'fill-sol-blue dark:fill-sol-orange'}`}
                                />

                                {/* Axes */}
                                <line x1="5" y1="95" x2="95" y2="95" stroke="currentColor" className="text-gray-400" strokeWidth="0.5" />
                                <path d="M95,95 L93,93 M95,95 L93,97" stroke="currentColor" className="text-gray-400" strokeWidth="0.5" fill="none" />
                                <text x="50" y="99" textAnchor="middle" className="text-[3px] fill-sol-base01 dark:fill-sol-base0">Current A</text>

                                <line x1="5" y1="95" x2="5" y2="5" stroke="currentColor" className="text-gray-400" strokeWidth="0.5" />
                                <path d="M5,5 L3,7 M5,5 L7,7" stroke="currentColor" className="text-gray-400" strokeWidth="0.5" fill="none" />
                                <text x="2" y="50" textAnchor="middle" className="text-[3px] fill-sol-base01 dark:fill-sol-base0" transform="rotate(-90, 2, 50)">Current B</text>
                            </svg>
                        </div>
                        <p className="text-xs text-center mt-2 text-sol-base01 dark:text-sol-base0">
                            Move along diagonal for Mode Hops (DMA) vs Continuous Tuning (CMA)
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LaserPage;
