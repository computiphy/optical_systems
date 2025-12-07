/*
Optical Modulation Visualizer — React Component

This file implements the interactive visualization you requested (Option 2):
- Adds modulation formats: BPSK, QPSK, 8QAM, 16QAM, 32QAM, 64QAM
- Adds Symbol Rate slider (the real cause of bandwidth change)
- Adds Roll-off (α) slider (RRC pulse shaping)
- Keeps the existing Time and Frequency canvases and general look
- Keeps Density slider (interpreted as the number of random narrow tones added to make the spectrum look "line-dense")
- Removes the old Bandwidth slider (bandwidth is now determined by symbol rate and roll-off: BW ≈ Rs(1+α))

Notes:
- This demo uses a sampleRate for display only (48 kHz). Carrier and frequencies are for visualization and not real optical carrier values.
- The RRC implementation is simplified for interactivity but captures the essential spectral shaping.
*/

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import theoryContent from '../../theory/band-formation.md?raw';

export default function OpticalModulationVisualizer() {
    // Visualization sampling (display-only)
    const sampleRate = 48000; // display sampling rate (Hz)
    const sampleCount = 4096; // samples used for synthesis and DFT

    // UI state
    const [density, setDensity] = useState(60); // number of narrow tones to add for "line density"
    const [carrier, setCarrier] = useState(8000); // visualization carrier (Hz)
    const [modFormat, setModFormat] = useState("QPSK");
    const [symbolRate, setSymbolRate] = useState(2000); // baud (controls real BW)
    const [rollOff, setRollOff] = useState(0.2); // RRC roll-off α
    const [snrDb, setSnrDb] = useState(30); // for amplitude scaling / realism
    const [showTheory, setShowTheory] = useState(false);

    const timeCanvas = useRef(null);
    const freqCanvas = useRef(null);

    // device pixel ratio helper
    const DPR = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    // --- Utility: constellation mapping ---
    function mapSymbols(format, Nsym) {
        // returns complex symbols as array of {i, q}
        const out = [];
        if (format === "BPSK") {
            for (let k = 0; k < Nsym; k++) out.push({ i: Math.random() > 0.5 ? 1 : -1, q: 0 });
            return out;
        }
        if (format === "QPSK") {
            for (let k = 0; k < Nsym; k++) {
                const b1 = Math.random() > 0.5 ? 1 : -1;
                const b2 = Math.random() > 0.5 ? 1 : -1;
                out.push({ i: b1 / Math.SQRT2, q: b2 / Math.SQRT2 });
            }
            return out;
        }

        // For M-QAM, generate square QAM constellations (Gray mapping not critical here)
        const M = +format.replace("QAM", "");
        const mroot = Math.round(Math.sqrt(M));
        if (mroot * mroot !== M) {
            // non-square (e.g., 32QAM) -> use approximate circular-ish set (simple approach)
            for (let k = 0; k < Nsym; k++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 1 + Math.floor(Math.random() * Math.sqrt(M)) / Math.sqrt(M);
                out.push({ i: radius * Math.cos(angle), q: radius * Math.sin(angle) });
            }
            return out;
        }

        // square QAM grid centered at 0 with average power normalized to 1
        const levels = [];
        const start = -(mroot - 1);
        for (let r = 0; r < mroot; r++) levels.push(start + 2 * r);
        // normalize average energy
        let energy = 0;
        for (let a of levels) for (let b of levels) energy += a * a + b * b;
        energy /= (levels.length * levels.length);
        const norm = Math.sqrt(energy);

        for (let k = 0; k < Nsym; k++) {
            const ai = levels[Math.floor(Math.random() * levels.length)];
            const aq = levels[Math.floor(Math.random() * levels.length)];
            out.push({ i: ai / norm, q: aq / norm });
        }
        return out;
    }

    // --- RRC pulse shaping ---
    function rrcImpulse(rollOff, sps, spanSymbols = 8) {
        // returns impulse response of RRC with given roll-off, samples per symbol (sps) and span in symbols
        const N = spanSymbols * sps + 1;
        const h = new Float32Array(N);
        const mid = (N - 1) / 2;
        for (let n = 0; n < N; n++) {
            const t = (n - mid) / sps; // time in symbol units
            if (Math.abs(t) < 1e-8) {
                h[n] = 1 - rollOff + (4 * rollOff / Math.PI);
            } else if (Math.abs(Math.abs(4 * rollOff * t) - 1) < 1e-8) {
                const term = (rollOff / Math.sqrt(2)) * ((1 + 2 / Math.PI) * Math.sin(Math.PI / (4 * rollOff)) + (1 - 2 / Math.PI) * Math.cos(Math.PI / (4 * rollOff)));
                h[n] = term;
            } else {
                const piT = Math.PI * t;
                const num = Math.sin(piT * (1 - rollOff)) + 4 * rollOff * t * Math.cos(piT * (1 + rollOff));
                const den = piT * (1 - (4 * rollOff * t) * (4 * rollOff * t));
                h[n] = num / den;
            }
        }
        // normalize
        let s = 0;
        for (let i = 0; i < h.length; i++) s += h[i];
        for (let i = 0; i < h.length; i++) h[i] /= s;
        return h;
    }

    // convolution
    function convolve(signal, kernel) {
        const N = signal.length;
        const M = kernel.length;
        const out = new Float32Array(N + M - 1);
        for (let n = 0; n < out.length; n++) {
            let acc = 0;
            const kmin = Math.max(0, n - (N - 1));
            const kmax = Math.min(M - 1, n);
            for (let k = kmin; k <= kmax; k++) acc += kernel[k] * signal[n - k];
            out[n] = acc;
        }
        return out;
    }

    // compute magnitude spectrum using simple DFT at fixed bins
    function computeSpectrum(signal, bins = 768) {
        const N = signal.length;
        const mags = new Float32Array(bins);
        const fmax = sampleRate / 2;
        // precompute time vector
        for (let b = 0; b < bins; b++) {
            const freq = (b / bins) * fmax;
            let re = 0;
            let im = 0;
            for (let n = 0; n < N; n++) {
                const angle = -2 * Math.PI * freq * (n / sampleRate);
                const v = signal[n];
                re += v * Math.cos(angle);
                im += v * Math.sin(angle);
            }
            mags[b] = Math.sqrt(re * re + im * im);
        }
        // normalize
        const max = Math.max(...mags) || 1;
        for (let i = 0; i < mags.length; i++) mags[i] /= max;
        return mags;
    }

    // synthesize the I/Q baseband, pulse-shape, upconvert, and optionally add density tones
    function synthesize() {
        // Determine samples-per-symbol (sps) for display
        const sps = Math.max(2, Math.floor(sampleRate / Math.max(1, symbolRate)));
        const Nsym = Math.max(64, Math.ceil((sampleCount / sps)));

        // generate symbols
        const symbols = mapSymbols(modFormat, Nsym);
        // create upsampled I and Q
        const upLen = Nsym * sps;
        const Iup = new Float32Array(upLen);
        const Qup = new Float32Array(upLen);
        for (let k = 0; k < Nsym; k++) {
            const idx = k * sps;
            Iup[idx] = symbols[k].i;
            Qup[idx] = symbols[k].q;
        }

        // RRC pulse
        const rrc = rrcImpulse(rollOff, sps, 8);
        const Iflt = convolve(Iup, rrc);
        const Qflt = convolve(Qup, rrc);

        // trim or pad to sampleCount
        const start = Math.floor((Iflt.length - sampleCount) / 2);
        const sig = new Float32Array(sampleCount);
        for (let n = 0; n < sampleCount; n++) {
            const ii = Iflt[n + start] || 0;
            const qq = Qflt[n + start] || 0;
            // upconvert to carrier (real optical field approximation)
            const t = n / sampleRate;
            const real = ii * Math.cos(2 * Math.PI * carrier * t) - qq * Math.sin(2 * Math.PI * carrier * t);
            sig[n] = real;
        }

        // Add density narrow tones (to emulate discrete spectral lines). These are small amplitude.
        if (density > 1) {
            const halfBW = Math.max(200, symbolRate * (1 + rollOff) / 2);
            for (let k = 0; k < density; k++) {
                const f = carrier - halfBW + (k * (2 * halfBW)) / Math.max(1, density - 1);
                const phase = Math.random() * Math.PI * 2;
                const amp = 0.08 / Math.sqrt(density); // keep contribution small
                for (let n = 0; n < sampleCount; n++) sig[n] += amp * Math.sin(2 * Math.PI * f * (n / sampleRate) + phase);
            }
        }

        // scale by SNR-ish factor for visualization
        const signalPower = sig.reduce((a, b) => a + b * b, 0) / sig.length || 1e-9;
        const noisePower = signalPower / Math.pow(10, snrDb / 10);
        // add small white noise
        for (let n = 0; n < sampleCount; n++) sig[n] += (Math.random() - 0.5) * Math.sqrt(noisePower);

        return sig;
    }

    // Drawing routines (time & frequency)
    function drawTime(signal) {
        const canvas = timeCanvas.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const w = (canvas.width = canvas.clientWidth * DPR);
        const h = (canvas.height = canvas.clientHeight * DPR);
        ctx.clearRect(0, 0, w, h);

        ctx.lineWidth = 1.2 * DPR;
        ctx.beginPath();
        const len = Math.min(1024, signal.length);
        for (let i = 0; i < len; i++) {
            const x = (i / (len - 1)) * w;
            const v = signal[i];
            const y = (1 - (v - -1) / 2) * h;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "#0ea5e9";
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = `${12 * DPR}px sans-serif`;
        ctx.fillText("Time-domain (short window)", 8 * DPR, 16 * DPR);
        ctx.fillText(`Symbol rate: ${symbolRate} baud`, 8 * DPR, 34 * DPR);
        ctx.fillText(`Roll-off (α): ${rollOff}`, 8 * DPR, 50 * DPR);
    }

    function drawSpectrum(signal) {
        const canvas = freqCanvas.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const w = (canvas.width = canvas.clientWidth * DPR);
        const h = (canvas.height = canvas.clientHeight * DPR);
        ctx.clearRect(0, 0, w, h);

        const mags = computeSpectrum(signal, 1024);
        ctx.beginPath();
        for (let i = 0; i < mags.length; i++) {
            const x = (i / (mags.length - 1)) * w;
            const y = (1 - mags[i]) * (h - 28 * DPR) + 14 * DPR;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5 * DPR;
        ctx.stroke();

        // carrier marker
        const fmax = sampleRate / 2;
        const carrierX = (carrier / fmax) * w;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(carrierX - 1 * DPR, 2 * DPR, 2 * DPR, 10 * DPR);

        ctx.fillStyle = "#94a3b8";
        ctx.font = `${12 * DPR}px sans-serif`;
        ctx.fillText("Frequency-domain (normalized magnitude)", 8 * DPR, 16 * DPR);
        ctx.fillText(`Carrier: ${carrier} Hz`, 8 * DPR, 34 * DPR);
        const approxBW = Math.round(symbolRate * (1 + rollOff));
        ctx.fillText(`Approx BW ≈ Rs(1+α): ${approxBW} Hz`, 8 * DPR, 52 * DPR);
        ctx.fillText(`Density: ${density} lines`, 8 * DPR, 70 * DPR);
    }

    // main draw on state change
    useEffect(() => {
        const sig = synthesize();
        drawTime(sig);
        drawSpectrum(sig);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [density, carrier, modFormat, symbolRate, rollOff, snrDb]);

    // UI
    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold text-sol-blue dark:text-sol-orange">Optical Modulation — Band Formation Visualizer</h1>
                <button
                    onClick={() => setShowTheory((s) => !s)}
                    className="p-2 rounded-full hover:bg-sol-base3 dark:hover:bg-gray-800 text-sol-base01 dark:text-sol-orange transition-colors"
                    title="Toggle Theory"
                >
                    {showTheory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {/* Collapsible theory + references (hidden by default) */}
            {showTheory && (
                <Card className="mb-4 prose prose-sm dark:prose-invert max-w-none">
                    <div className="text-slate-700 dark:text-slate-300 markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {theoryContent}
                        </ReactMarkdown>
                    </div>
                </Card>
            )}

            <p className="text-sm text-sol-base01 dark:text-sol-base0 mb-4">
                This interactive demo shows realistic modulation formats. The <strong>Symbol Rate</strong> slider is the physical cause of
                bandwidth growth (BW ≈ R_s(1+α)). The <strong>Roll-off</strong> slider controls pulse-shaping (RRC) which affects occupied
                spectrum shape. Density adds small narrow tones to make the spectrum appear line-dense for illustrative purposes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900 rounded-lg p-3 shadow">
                    <canvas ref={timeCanvas} className="w-full h-48 block" />
                </div>
                <div className="bg-slate-900 rounded-lg p-3 shadow">
                    <canvas ref={freqCanvas} className="w-full h-48 block" />
                </div>
            </div>

            <Card className="mb-4">
                <div className="mb-3">
                    <label className="block text-sm font-medium text-sol-base01 dark:text-sol-base0 mb-1">Modulation format: {modFormat}</label>
                    <select
                        value={modFormat}
                        onChange={(e) => setModFormat(e.target.value)}
                        className="border rounded px-2 py-1 w-48 bg-sol-base3 dark:bg-gray-900 border-sol-base1 dark:border-sol-orange/30 text-sol-base00 dark:text-sol-base0 focus:outline-none focus:border-sol-blue dark:focus:border-sol-orange"
                    >
                        <option>BPSK</option>
                        <option>QPSK</option>
                        <option>8QAM</option>
                        <option>16QAM</option>
                        <option>32QAM</option>
                        <option>64QAM</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium text-sol-base01 dark:text-sol-base0 mb-1">Symbol Rate (baud): {symbolRate} Hz</label>
                    <input
                        type="range"
                        min="100"
                        max={Math.floor(sampleRate / 2.5)}
                        value={symbolRate}
                        onChange={(e) => setSymbolRate(Number(e.target.value))}
                        className="w-full accent-sol-blue dark:accent-sol-orange"
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium text-sol-base01 dark:text-sol-base0 mb-1">Roll-off α: {rollOff}</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={rollOff}
                        onChange={(e) => setRollOff(Number(e.target.value))}
                        className="w-full accent-sol-blue dark:accent-sol-orange"
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium text-sol-base01 dark:text-sol-base0 mb-1">Density (number of spectral lines): {density}</label>
                    <input
                        type="range"
                        min="1"
                        max="500"
                        value={density}
                        onChange={(e) => setDensity(Number(e.target.value))}
                        className="w-full accent-sol-blue dark:accent-sol-orange"
                    />
                </div>

                <div className="flex gap-4 items-center flex-wrap">
                    <div>
                        <label className="block text-sm font-medium text-sol-base01 dark:text-sol-base0 mb-1">Carrier (Hz)</label>
                        <input
                            type="number"
                            value={carrier}
                            onChange={(e) => setCarrier(Number(e.target.value))}
                            className="border rounded px-2 py-1 w-32 bg-sol-base3 dark:bg-gray-900 border-sol-base1 dark:border-sol-orange/30 text-sol-base00 dark:text-sol-base0 focus:outline-none focus:border-sol-blue dark:focus:border-sol-orange"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-sol-base01 dark:text-sol-base0 mb-1">SNR (dB)</label>
                        <input
                            type="number"
                            value={snrDb}
                            onChange={(e) => setSnrDb(Number(e.target.value))}
                            className="border rounded px-2 py-1 w-24 bg-sol-base3 dark:bg-gray-900 border-sol-base1 dark:border-sol-orange/30 text-sol-base00 dark:text-sol-base0 focus:outline-none focus:border-sol-blue dark:focus:border-sol-orange"
                        />
                    </div>

                    <div className="text-sm text-sol-base01 dark:text-sol-base0 ml-auto italic">
                        Tip: increase <strong>Symbol Rate</strong> to expand the occupied band. Change modulation type to see how constellation
                        affects the waveform and minor spectral differences.
                    </div>
                </div>
            </Card>
        </div>
    );
}
