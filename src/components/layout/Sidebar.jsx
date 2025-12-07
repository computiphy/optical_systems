import React from 'react';
import { BookOpen, Grid, Zap, Activity, Anchor, BarChart2, Aperture, ChevronLeft, ChevronRight, Sun, Moon, Waves } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, toggleCollapse }) => {
    const { theme, toggleTheme } = useTheme();

    const menuItems = [
        // { id: 'basics', label: 'Basics & System', icon: BookOpen },
        { id: 'modulation', label: 'Modulation & Constellation Diagram', icon: Grid },
        { id: 'band-formation', label: 'Band Formation Visualizer', icon: Waves },
        { id: 'laser', label: 'LASER', icon: Zap },
        { id: 'mzm', label: 'MZM', icon: Activity },
        // { id: 'wavelocking', label: 'Wavelocking', icon: Anchor },
        // { id: 'gain', label: 'Gain Control', icon: BarChart2 },
        { id: 'coherent-detection', label: 'Coherent Detection', icon: BarChart2 },
    ];

    return (
        <div
            className={`h-screen fixed left-0 top-0 bg-sol-base2 dark:bg-black border-r border-sol-base1 dark:border-sol-orange/30 flex flex-col shadow-lg z-10 transition-all duration-300 ${isCollapsed ? 'w-[80px]' : 'w-[250px]'
                }`}
        >
            {/* Header */}
            <div className={`p-6 border-b border-sol-base1 dark:border-sol-orange/30 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'}`}>
                {!isCollapsed && (
                    <div className="overflow-hidden whitespace-nowrap">
                        <h1 className="text-xl font-bold text-sol-blue dark:text-sol-orange flex items-center gap-2">
                            <Aperture size={24} />
                            Optical Systems
                        </h1>
                        <p className="text-sm text-sol-base01 dark:text-sol-base0 mt-1"></p>
                    </div>
                )}
                {isCollapsed && <Aperture size={24} className="text-sol-blue dark:text-sol-orange" />}

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-sol-base3 dark:hover:bg-gray-900 text-sol-base00 dark:text-sol-orange transition-colors"
                    title="Toggle Dark Mode"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            {/* Toggle Button (Absolute to be on the border) */}
            <button
                onClick={toggleCollapse}
                className="absolute -right-3 top-20 bg-sol-base3 dark:bg-black border border-sol-base1 dark:border-sol-orange/30 rounded-full p-1 text-sol-base00 dark:text-sol-orange hover:text-sol-blue dark:hover:text-white shadow-sm z-20"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center transition-colors relative group ${isCollapsed ? 'justify-center px-2 py-4' : 'text-left px-6 py-3 gap-3'
                                } ${activeTab === item.id
                                    ? 'bg-white dark:bg-gray-900 text-sol-blue dark:text-sol-orange border-r-4 border-sol-blue dark:border-sol-orange font-bold shadow-sm'
                                    : 'text-sol-base01 dark:text-sol-base0 hover:bg-sol-base3 dark:hover:bg-gray-900 dark:hover:text-sol-orange'
                                }`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <Icon size={isCollapsed ? 24 : 18} className="flex-shrink-0" />

                            {!isCollapsed && (
                                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                    {item.label}
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-sol-base03 dark:bg-sol-orange text-sol-base3 dark:text-black text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-sol-base1 dark:border-sol-orange/30 text-xs text-sol-base01 dark:text-sol-base01 text-center overflow-hidden whitespace-nowrap">
                {isCollapsed ? 'v1.0' : 'Interactive Training Module v1.0'}
            </div>
        </div>
    );
};

export default Sidebar;