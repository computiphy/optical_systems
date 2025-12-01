import React, { useState, useEffect, useRef } from 'react';
import TransferCurve from './TransferCurve';
import IQWaveformPlot from './IQWaveformPlot';
import ConstellationPlot from './ConstellationPlot';
import OpticalFieldPlot from './OpticalFieldPlot';
import SuperMzmDiagram from './SuperMzmDiagram';
import Card from '../../components/ui/Card';
import Slider from '../../components/ui/Slider';
import { ChevronDown, ChevronUp, Play, Pause, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import theoryContent from './../../theory/mzm.md?raw';

const MzmPage = () => {
    // State
    const [biasV, setBiasV] = useState(0);
    const [showTheory, setShowTheory] = useState(false);

    // New State for Advanced Features
    const [ampI, setAmpI] = useState(1.0);
    const [ampQ, setAmpQ] = useState(1.0);
    const [freq, setFreq] = useState(1.0);
    const [phaseShiftEnabled, setPhaseShiftEnabled] = useState(true);
    const [biasDrift, setBiasDrift] = useState(0); // Radians
    const [modulationFormat, setModulationFormat] = useState('QPSK');
    const [isPlaying, setIsPlaying] = useState(true);
    const [time, setTime] = useState(0);

    const requestRef = useRef();

    // Animation Loop
    const animate = (t) => {
        if (isPlaying) {
            setTime(prev => prev + 0.05 * freq);
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying, freq]);

    const getBiasName = () => {
        if (Math.abs(biasV) < 0.1) return "Peak";
        if (Math.abs(Math.abs(biasV) - Math.PI) < 0.1) return "Null Point";
        if (Math.abs(Math.abs(biasV) - Math.PI / 2) < 0.1) return "Quad Point";
        return "Intermediate";
    };

    return (
        <div className="p-8 space-y-6">
            {/* Header & Theory */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-sol-blue dark:text-sol-orange">
                        Super-MZM & IQ Modulation
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
                    <Card className="prose prose-sm dark:prose-invert max-w-none mb-6">
                        <div className="text-sol-base00 dark:text-sol-base0 markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {theoryContent}
                            </ReactMarkdown>
                        </div>
                    </Card>
                )}
            </div>

            {/* Top Row: Diagram & Main Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Architecture">
                        <SuperMzmDiagram phaseShiftEnabled={phaseShiftEnabled} />
                    </Card>
                </div>
                <div>
                    <Card title="Global Controls" className="h-full">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-sol-base01 dark:text-sol-base0 mb-1">Modulation Format</label>
                                <select
                                    value={modulationFormat}
                                    onChange={(e) => setModulationFormat(e.target.value)}
                                    className="w-full p-2 rounded bg-sol-base3 dark:bg-gray-900 border border-sol-base1 dark:border-sol-orange/30 text-sol-base00 dark:text-sol-base0 focus:outline-none focus:ring-1 focus:ring-sol-blue"
                                >
                                    <option value="NRZ">NRZ / OOK</option>
                                    <option value="BPSK">BPSK</option>
                                    <option value="QPSK">QPSK</option>
                                    <option value="8-PSK">8-PSK</option>
                                    <option value="16-QAM">16-QAM</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-sol-base01 dark:text-sol-base0">90° Phase Shift</span>
                                <button
                                    onClick={() => setPhaseShiftEnabled(!phaseShiftEnabled)}
                                    className={`w-12 h-6 rounded-full transition-colors ${phaseShiftEnabled ? 'bg-sol-green' : 'bg-gray-400'} relative`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${phaseShiftEnabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 pt-4">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="flex-1 py-2 px-4 rounded bg-sol-blue text-white hover:bg-sol-blue/90 flex items-center justify-center gap-2"
                                >
                                    {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play</>}
                                </button>
                                <button
                                    onClick={() => { setTime(0); setBiasDrift(0); setAmpI(1); setAmpQ(1); }}
                                    className="p-2 rounded bg-sol-base2 dark:bg-gray-800 text-sol-base00 dark:text-sol-base0 hover:bg-sol-base3 dark:hover:bg-gray-700"
                                    title="Reset"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Middle Row: Detailed Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <Slider label="I-Arm Amplitude" value={ampI} min={0} max={2} step={0.1} onChange={(e) => setAmpI(parseFloat(e.target.value))} />
                </Card>
                <Card>
                    <Slider label="Q-Arm Amplitude" value={ampQ} min={0} max={2} step={0.1} onChange={(e) => setAmpQ(parseFloat(e.target.value))} />
                </Card>
                <Card>
                    <Slider label="RF Frequency" value={freq} min={0.1} max={5} step={0.1} onChange={(e) => setFreq(parseFloat(e.target.value))} />
                </Card>
                <Card>
                    <Slider label="Bias Drift (Rad)" value={biasDrift} min={-1} max={1} step={0.05} onChange={(e) => setBiasDrift(parseFloat(e.target.value))} />
                </Card>
            </div>

            {/* Bottom Row: Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="I/Q Drive Waveforms">
                    <IQWaveformPlot
                        ampI={ampI}
                        ampQ={ampQ}
                        freq={freq}
                        phaseShiftEnabled={phaseShiftEnabled}
                        modulationFormat={modulationFormat}
                        time={time}
                    />
                </Card>

                <Card title="Constellation Diagram">
                    <div className="flex justify-center">
                        <ConstellationPlot
                            ampI={ampI}
                            ampQ={ampQ}
                            phaseShiftEnabled={phaseShiftEnabled}
                            modulationFormat={modulationFormat}
                            biasDrift={biasDrift}
                            time={time}
                        />
                    </div>
                </Card>

                <Card title="Optical Field Evolution (Real/Imag)">
                    <OpticalFieldPlot
                        ampI={ampI}
                        ampQ={ampQ}
                        freq={freq}
                        phaseShiftEnabled={phaseShiftEnabled}
                        modulationFormat={modulationFormat}
                        biasDrift={biasDrift}
                        time={time}
                    />
                </Card>

                <Card title="Single MZM Transfer Curve (Bias Check)">
                    <div className="space-y-4">
                        <TransferCurve biasV={biasV} />
                        <Slider
                            label="DC Bias Voltage"
                            value={biasV}
                            onChange={(e) => setBiasV(parseFloat(e.target.value))}
                            min={-Math.PI}
                            max={Math.PI}
                            step={0.05}
                            unit=" rad"
                        />
                        <div className="text-center font-bold text-sol-magenta dark:text-sol-orange">
                            {getBiasName()}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MzmPage;