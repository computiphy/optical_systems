import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/ui/Card';
import Slider from '../../components/ui/Slider';
import WaveformPlot from './WaveformPlot';
import IQPlot from './IQPlot';
import { ChevronDown, ChevronUp, Activity, Radio } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import theoryContent from './../../theory/coherent-detection.md?raw';

const CoherentDetectionPage = () => {
    // Signal Parameters
    const [sigAmp, setSigAmp] = useState(1.0);
    const [sigFreq, setSigFreq] = useState(20.0);
    const [sigPhase, setSigPhase] = useState(0);

    // LO Parameters
    const [loAmp, setLoAmp] = useState(1.0);
    const [loFreq, setLoFreq] = useState(20.5);
    const loPhase = 0; // Fixed as requested

    // Animation State
    const [time, setTime] = useState(0);
    const requestRef = useRef();
    const [isAnimating, setIsAnimating] = useState(true);

    // Calculations
    const phaseDiff = sigPhase - loPhase;
    const freqDiff = sigFreq - loFreq;

    // Beat Current Amplitude
    const beatCurrent = 2 * sigAmp * loAmp;

    const [showCalc, setShowCalc] = useState(true);
    const [pllLocked, setPllLocked] = useState(false);
    const [showTheory, setShowTheory] = useState(false);

    const animate = (t) => {
        setTime(t * 0.005); // Scale time
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (isAnimating) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(requestRef.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isAnimating]);

    // Phase Logic
    // Raw beat phase (rotating)
    const rawPhase = (freqDiff * time * 0.5) + phaseDiff;
    // Recovered phase (static, compensated for freq offset)
    const recoveredPhase = phaseDiff;

    // What to display
    const displayedPhase = pllLocked ? recoveredPhase : rawPhase;

    // I and Q components
    const iComp = sigAmp * loAmp * Math.cos(displayedPhase);
    const qComp = sigAmp * loAmp * Math.sin(displayedPhase);

    // DC Component
    const dcCurrent = (sigAmp * sigAmp) + (loAmp * loAmp);

    return (
        <div className="p-6 pb-20 h-screen flex flex-col overflow-y-auto">
            <div className="mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Activity className="text-sol-magenta dark:text-sol-orange" size={20} />
                    <h2 className="text-xl font-bold text-sol-blue dark:text-sol-orange">
                        Coherent Detection & Heterodyning
                    </h2>
                    <button
                        onClick={() => setShowTheory(!showTheory)}
                        className="p-2 rounded-full hover:bg-sol-base3 dark:hover:bg-gray-800 text-sol-base01 dark:text-sol-orange transition-colors"
                        title="Toggle Theory"
                    >
                        {showTheory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>

                {showTheory && (
                    <Card className="mt-4 prose prose-sm dark:prose-invert max-w-none">
                        <div className="text-sol-base00 dark:text-sol-base0 markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {theoryContent}
                            </ReactMarkdown>
                        </div>
                    </Card>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-20">

                {/* LEFT COLUMN: Controls & Phase Recovery (Span 4) */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Signal Controls */}
                    <Card className="p-4">
                        <h3 className="font-bold text-sm text-sol-blue dark:text-sol-orange border-b border-sol-base1 dark:border-sol-orange/30 pb-1 mb-3 flex items-center gap-2">
                            <Radio size={16} /> Signal (Es)
                        </h3>
                        <div className="space-y-2">
                            <Slider
                                label="Amplitude"
                                value={sigAmp}
                                min={0.1} max={2.0} step={0.1}
                                onChange={(e) => setSigAmp(parseFloat(e.target.value))}
                            />
                            <Slider
                                label="Frequency"
                                value={sigFreq}
                                min={1.0} max={50.0} step={0.5}
                                onChange={(e) => setSigFreq(parseFloat(e.target.value))}
                            />
                            <Slider
                                label="Phase (rad)"
                                value={sigPhase}
                                min={0} max={2 * Math.PI} step={0.1}
                                onChange={(e) => setSigPhase(parseFloat(e.target.value))}
                                unit=" rad"
                            />
                        </div>
                    </Card>

                    {/* LO Controls */}
                    <Card className="p-4">
                        <h3 className="font-bold text-sm text-sol-magenta dark:text-sol-orange border-b border-sol-base1 dark:border-sol-orange/30 pb-1 mb-3 flex items-center gap-2">
                            <Activity size={16} /> Local Oscillator (ELO)
                        </h3>
                        <div className="space-y-2">
                            <Slider
                                label="Amplitude"
                                value={loAmp}
                                min={0.1} max={2.0} step={0.1}
                                onChange={(e) => setLoAmp(parseFloat(e.target.value))}
                            />
                            <Slider
                                label="Frequency"
                                value={loFreq}
                                min={1.0} max={50.0} step={0.5}
                                onChange={(e) => setLoFreq(parseFloat(e.target.value))}
                            />
                            <div className="flex justify-between items-center p-1.5 bg-sol-base3 dark:bg-gray-900 rounded border border-sol-base1 dark:border-sol-orange/30 mt-2">
                                <span className="text-xs font-bold text-sol-base00 dark:text-sol-base0">Phase</span>
                                <span className="text-xs font-mono text-sol-base01 dark:text-sol-base0">Fixed (0 rad)</span>
                            </div>
                        </div>
                    </Card>

                    {/* Phase Recovery Visuals */}
                    <Card className="p-4 flex flex-col items-center">
                        <div className="w-full flex justify-between items-center border-b border-sol-base1 dark:border-sol-orange/30 pb-1 mb-2">
                            <h3 className="font-bold text-sm text-sol-base00 dark:text-sol-base0">Phase Recovery</h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-xs font-semibold text-sol-base01 dark:text-sol-base0">PLL Lock</span>
                                <input
                                    type="checkbox"
                                    checked={pllLocked}
                                    onChange={(e) => setPllLocked(e.target.checked)}
                                    className="w-4 h-4 accent-sol-blue dark:accent-sol-orange cursor-pointer"
                                />
                            </label>
                        </div>

                        <IQPlot i={iComp} q={qComp} phase={displayedPhase} />

                        <div className="mt-2 text-center">
                            <p className="text-xs text-sol-base01 dark:text-sol-base0">
                                {pllLocked ? "Carrier Recovered (Locked)" : "Raw Beat Signal (Rotating)"}
                            </p>
                            <p className={`font-mono text-base ${pllLocked ? 'text-sol-green dark:text-sol-green font-bold' : 'text-sol-blue dark:text-sol-orange'}`}>
                                {(displayedPhase % (2 * Math.PI)).toFixed(2)} rad
                            </p>

                            <div className="mt-3 pt-3 border-t border-sol-base2 dark:border-sol-orange/30 text-left">
                                <p className="text-[10px] text-sol-base01 dark:text-sol-base0 leading-tight">
                                    <strong>PLL Lock:</strong> Simulates a Phase-Locked Loop that tracks and compensates for the frequency difference (Δω) between the Signal and LO. When locked, the rotating vector stabilizes, revealing the constant phase offset (Δφ) carrying the data.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Waveforms & Calculations (Span 8) */}
                <div className="lg:col-span-8 space-y-4">
                    <Card className="p-4">
                        <h3 className="font-bold text-sm text-sol-base00 dark:text-sol-base0 border-b border-sol-base1 dark:border-sol-orange/30 pb-1 mb-3">Signal Visualization</h3>

                        {/* Stacked Waveforms */}
                        <div className="space-y-4">
                            <div className="h-28">
                                <p className="text-[10px] text-sol-base01 dark:text-sol-base0 mb-0.5 font-semibold">Signal (Es)</p>
                                <WaveformPlot
                                    amplitude={sigAmp}
                                    frequency={sigFreq}
                                    phase={sigPhase}
                                    color="#268bd2"
                                />
                            </div>
                            <div className="h-28">
                                <p className="text-[10px] text-sol-base01 dark:text-sol-base0 mb-0.5 font-semibold">Local Oscillator (ELO)</p>
                                <WaveformPlot
                                    amplitude={loAmp}
                                    frequency={loFreq}
                                    phase={loPhase}
                                    color="#d33682"
                                />
                            </div>
                            <div className="h-32 pt-2 border-t border-sol-base2 dark:border-sol-orange/30">
                                <div className="flex justify-between items-end mb-0.5">
                                    <p className="text-xs font-bold text-sol-base00 dark:text-sol-base0">Superposition (Es + ELO)</p>
                                    <p className="text-[10px] text-sol-base01 dark:text-sol-base0 italic">
                                        Note: The envelope beats at |ωs - ωLO|
                                    </p>
                                </div>
                                <WaveformPlot
                                    amplitude={sigAmp}
                                    frequency={sigFreq}
                                    phase={sigPhase}
                                    color="#859900"
                                    isSum={true}
                                    secondSignal={{
                                        amplitude: loAmp,
                                        frequency: loFreq,
                                        phase: loPhase
                                    }}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Calculations */}
                    <Card className="h-fit p-4">
                        <div
                            className="cursor-pointer group"
                            onClick={() => setShowCalc(!showCalc)}
                        >
                            <div className="flex justify-between items-center mb-2 border-b border-sol-base1 dark:border-sol-orange/30 pb-1">
                                <h3 className="font-bold text-lg text-sol-blue dark:text-sol-orange">Heterodyne Calculations</h3>
                                {showCalc ? <ChevronUp className="text-sol-base01 dark:text-sol-orange" size={16} /> : <ChevronDown className="text-sol-base01 dark:text-sol-orange" size={16} />}
                            </div>
                        </div>

                        {showCalc && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-sol-base3 dark:bg-gray-900 p-3 rounded border border-sol-base1 dark:border-sol-orange/30">
                                        <p className="text-[10px] text-sol-base01 dark:text-sol-base0 uppercase font-bold mb-0.5">DC Current Component</p>
                                        <p className="font-mono text-sm text-sol-base00 dark:text-sol-base0">
                                            IDC = |Es|² + |ELO|²
                                        </p>
                                        <p className="font-mono text-lg font-bold text-sol-yellow dark:text-sol-yellow mt-1">
                                            {dcCurrent.toFixed(3)} A
                                        </p>
                                    </div>
                                    <div className="bg-sol-base3 dark:bg-gray-900 p-3 rounded border border-sol-base1 dark:border-sol-orange/30">
                                        <p className="text-[10px] text-sol-base01 dark:text-sol-base0 uppercase font-bold mb-0.5">Beat Current Amplitude</p>
                                        <p className="font-mono text-sm text-sol-base00 dark:text-sol-base0">
                                            Ibeat = 2 · |Es| · |ELO|
                                        </p>
                                        <p className="font-mono text-lg font-bold text-sol-red dark:text-sol-orange mt-1">
                                            {beatCurrent.toFixed(3)} A
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-sol-base1 dark:border-sol-orange/30">
                                    <p className="font-semibold text-xs text-sol-base01 dark:text-sol-base0 mb-1">Phase Recovery Logic:</p>
                                    <div className="font-mono text-xs bg-sol-base03 dark:bg-black text-sol-base1 dark:text-sol-orange p-3 rounded overflow-x-auto">
                                        I(t) ∝ |Es + ELO|² <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp; = |Es|² + |ELO|² + 2|Es||ELO|cos(Δωt + Δφ)<br />
                                        <br />
                                        Recovered Phase φ = atan2(Q, I)<br />
                                        Current Δφ = {(phaseDiff).toFixed(3)} rad {freqDiff !== 0 && `+ ${(freqDiff).toFixed(2)}t`}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CoherentDetectionPage;
