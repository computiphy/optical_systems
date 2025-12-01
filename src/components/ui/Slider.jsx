import React from 'react';

const Slider = ({ label, value, onChange, min, max, step, unit = '' }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-sol-base00 dark:text-sol-base0">{label}</label>
                <span className="text-sm font-mono text-sol-blue dark:text-sol-orange">
                    {typeof value === 'number' ? value.toFixed(2) : value}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                className="w-full h-2 bg-sol-base1 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sol-blue dark:accent-sol-orange hover:accent-sol-cyan dark:hover:accent-sol-yellow transition-colors"
            />
        </div>
    );
};

export default Slider;
