import React from 'react';

const SuperMzmDiagram = ({ phaseShiftEnabled }) => {
    return (
        <div className="relative w-full h-64 bg-white dark:bg-gray-900 rounded border border-sol-base1 dark:border-sol-orange/30 p-4 flex items-center justify-center overflow-hidden">
            {/* SVG Diagram */}
            <svg width="100%" height="100%" viewBox="0 0 400 250" className="stroke-sol-base01 dark:stroke-sol-base0">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="fill-sol-base01 dark:fill-sol-base0" />
                    </marker>
                </defs>

                {/* --- Main Input Splitter --- */}
                <path d="M 10 125 L 40 125" strokeWidth="2" fill="none" />
                <path d="M 40 125 L 70 60" strokeWidth="2" fill="none" /> {/* To I-MZM */}
                <path d="M 40 125 L 70 190" strokeWidth="2" fill="none" /> {/* To Q-MZM */}

                {/* --- Top MZM (I-MZM) --- */}
                {/* Input Split */}
                <path d="M 70 60 L 90 60" strokeWidth="2" fill="none" />
                <path d="M 90 60 L 110 40" strokeWidth="2" fill="none" />
                <path d="M 90 60 L 110 80" strokeWidth="2" fill="none" />

                {/* Arms */}
                <path d="M 110 40 L 210 40" strokeWidth="2" fill="none" className="stroke-sol-blue" />
                <path d="M 110 80 L 210 80" strokeWidth="2" fill="none" className="stroke-sol-blue" />

                {/* RF Electrodes I */}
                <rect x="130" y="30" width="60" height="20" fill="none" strokeDasharray="4 2" className="stroke-sol-base1 dark:stroke-sol-base0" />
                <text x="160" y="25" textAnchor="middle" className="fill-sol-blue text-[10px] font-bold">RF I(t)</text>

                {/* Recombine */}
                <path d="M 210 40 L 230 60" strokeWidth="2" fill="none" />
                <path d="M 210 80 L 230 60" strokeWidth="2" fill="none" />
                <path d="M 230 60 L 280 60" strokeWidth="2" fill="none" /> {/* Output of I-MZM */}


                {/* --- Bottom MZM (Q-MZM) --- */}
                {/* Input Split */}
                <path d="M 70 190 L 90 190" strokeWidth="2" fill="none" />
                <path d="M 90 190 L 110 170" strokeWidth="2" fill="none" />
                <path d="M 90 190 L 110 210" strokeWidth="2" fill="none" />

                {/* Arms */}
                <path d="M 110 170 L 210 170" strokeWidth="2" fill="none" className="stroke-sol-magenta" />
                <path d="M 110 210 L 210 210" strokeWidth="2" fill="none" className="stroke-sol-magenta" />

                {/* RF Electrodes Q */}
                <rect x="130" y="160" width="60" height="20" fill="none" strokeDasharray="4 2" className="stroke-sol-base1 dark:stroke-sol-base0" />
                <text x="160" y="235" textAnchor="middle" className="fill-sol-magenta text-[10px] font-bold">RF Q(t)</text>

                {/* Recombine */}
                <path d="M 210 170 L 230 190" strokeWidth="2" fill="none" />
                <path d="M 210 210 L 230 190" strokeWidth="2" fill="none" />
                <path d="M 230 190 L 250 190" strokeWidth="2" fill="none" /> {/* Output of Q-MZM */}


                {/* --- Phase Shifter (90 deg) --- */}
                <circle cx="265" cy="190" r="12" strokeWidth="2" fill="none" className={phaseShiftEnabled ? "stroke-sol-green fill-sol-green/20" : "stroke-gray-400"} />
                <text x="265" y="193" textAnchor="middle" className="fill-sol-base01 dark:fill-sol-base0 text-[9px]">90°</text>
                <path d="M 277 190 L 280 190" strokeWidth="2" fill="none" />


                {/* --- Final Combiner --- */}
                <path d="M 280 60 L 330 125" strokeWidth="2" fill="none" />
                <path d="M 280 190 L 330 125" strokeWidth="2" fill="none" />
                <path d="M 330 125 L 380 125" strokeWidth="2" fill="none" />

                {/* Labels */}
                <text x="360" y="115" textAnchor="middle" className="fill-sol-base01 dark:fill-sol-base0 text-xs font-bold">E_out</text>
                <text x="25" y="115" textAnchor="middle" className="fill-sol-base01 dark:fill-sol-base0 text-xs">Laser In</text>

                {/* Annotations */}
                <text x="160" y="65" textAnchor="middle" className="fill-sol-base01 dark:fill-sol-base0 text-[10px] opacity-50">I-MZM</text>
                <text x="160" y="195" textAnchor="middle" className="fill-sol-base01 dark:fill-sol-base0 text-[10px] opacity-50">Q-MZM</text>

            </svg>
        </div>
    );
};

export default SuperMzmDiagram;
