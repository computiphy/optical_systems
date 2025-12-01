import React, { useState, useMemo } from 'react';
import ConstellationPlot from './ConstellationPlot';
import { getModDefs } from './modUtils';
import Card from '../../components/ui/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import theoryContent from './../../theory/modulation.md?raw';

const ModulationPage = () => {
    const [modType, setModType] = useState('QPSK');
    const [baudRate, setBaudRate] = useState(32);
    const [noise] = useState(0.05);
    const [showCalculation, setShowCalculation] = useState(false);
    const [showTheory, setShowTheory] = useState(false);

    const modDefs = useMemo(() => getModDefs(), []);
    const bitsPerSymbol = modDefs[modType].bits;
    const rawCapacity = baudRate * bitsPerSymbol * 2;

    return (
        <div className="p-8">
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-sol-blue dark:text-sol-orange">
                        Modulation Analysis
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="font-bold text-sol-base00 dark:text-sol-base0 border-b border-sol-base1 dark:border-sol-orange/30 pb-2 mb-4">Format</h3>
                        <div className="flex flex-col gap-2">
                            {Object.keys(modDefs).map(m => (
                                <label key={m} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-sol-base3 dark:hover:bg-gray-800 rounded transition-colors">
                                    <input
                                        type="radio"
                                        name="mod"
                                        checked={modType === m}
                                        onChange={() => setModType(m)}
                                        className="accent-sol-blue dark:accent-sol-orange"
                                    />
                                    <span className="text-sol-base01 dark:text-sol-base0 font-medium">{m}</span>
                                </label>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-sol-base00 dark:text-sol-base0 border-b border-sol-base1 dark:border-sol-orange/30 pb-2 mb-4">Baud Rate (GBd)</h3>
                        <div className="flex flex-col gap-2">
                            {[32, 48, 64, 96].map(br => (
                                <label key={br} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-sol-base3 dark:hover:bg-gray-800 rounded transition-colors">
                                    <input
                                        type="radio"
                                        name="baud"
                                        checked={baudRate === br}
                                        onChange={() => setBaudRate(br)}
                                        className="accent-sol-blue dark:accent-sol-orange"
                                    />
                                    <span className="text-sol-base01 dark:text-sol-base0 font-medium">{br} GBd</span>
                                </label>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Plot */}
                <div className="flex flex-col items-center space-y-6">
                    <Card className="p-4 bg-white dark:bg-gray-900 flex justify-center items-center shadow-inner w-full">
                        <ConstellationPlot modType={modType} noise={noise} modDefs={modDefs} />
                    </Card>
                </div>

                {/* Data */}
                <Card className="h-fit transition-all duration-300">
                    <div
                        className="cursor-pointer group"
                        onClick={() => setShowCalculation(!showCalculation)}
                    >
                        <div className="flex justify-between items-center mb-4 border-b border-sol-base1 dark:border-sol-orange/30 pb-2">
                            <h3 className="font-bold text-xl text-sol-blue dark:text-sol-orange">Bit Rate Calculations</h3>
                            {showCalculation ? <ChevronUp className="text-sol-base01 dark:text-sol-orange" /> : <ChevronDown className="text-sol-base01 dark:text-sol-orange" />}
                        </div>

                        <div className="flex flex-col gap-1 mb-4">
                            <div className="text-5xl font-bold text-sol-red dark:text-sol-orange tracking-tighter">
                                {rawCapacity} <span className="text-2xl text-sol-base01 dark:text-sol-base0 font-normal">Gbps</span>
                            </div>
                            <div className="text-sm text-sol-base01 dark:text-sol-base0 uppercase tracking-wide font-semibold mt-1">Raw throughput (Dual Pol)</div>
                        </div>

                        {showCalculation && (
                            <div className="mt-4 pt-4 border-t border-sol-base1 dark:border-sol-orange/30 text-sol-base00 dark:text-sol-base0 text-sm space-y-3 animate-fade-in">
                                <p className="font-semibold text-sol-base01 dark:text-sol-orange">Calculation Breakdown:</p>
                                <div className="grid grid-cols-[1fr_auto] gap-2">
                                    <span>Baud Rate:</span>
                                    <span className="font-mono">{baudRate} GBd</span>

                                    <span>Bits per Symbol ({modType}):</span>
                                    <span className="font-mono">{bitsPerSymbol} bits</span>

                                    <span>Polarization Multiplexing:</span>
                                    <span className="font-mono">× 2 (Dual Pol)</span>

                                    <div className="col-span-2 h-px bg-sol-base1 dark:bg-sol-orange/30 my-1"></div>

                                    <span className="font-bold">Total Capacity:</span>
                                    <span className="font-mono font-bold text-sol-blue dark:text-sol-orange">
                                        {baudRate} × {bitsPerSymbol} × 2 = {rawCapacity} Gbps
                                    </span>
                                </div>
                                <p className="text-xs text-sol-base01 dark:text-sol-base0 italic mt-2">
                                    Note: This is the raw line rate before Forward Error Correction (FEC) overhead is removed.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ModulationPage;