import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import ModulationPage from './modules/Modulation/ModulationPage';
import MzmPage from './modules/MZM/MzmPage';
import CoherentDetectionPage from './modules/CoherentDetection/CoherentDetectionPage';
import LaserPage from './modules/Laser/LaserPage';
import { BookOpen } from 'lucide-react';

// Simple placeholder for empty pages
const Placeholder = ({ title }) => (
    <div className="h-full flex flex-col items-center justify-center text-sol-base1 dark:text-sol-base0">
        <BookOpen size={64} className="mb-4 text-sol-base2 dark:text-sol-base01" />
        <h2 className="text-2xl font-bold">{title}</h2>
        <p>Coming Soon</p>
    </div>
);

const App = () => {
    const [activeTab, setActiveTab] = useState('modulation');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden transition-colors duration-300">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className={`flex-1 h-full overflow-auto relative transition-all duration-300 ${isSidebarCollapsed ? 'ml-[80px]' : 'ml-[250px]'}`}>
                {activeTab === 'basics' && <Placeholder title="System Basics" />}
                {activeTab === 'modulation' && <ModulationPage />}
                {activeTab === 'coherent-detection' && <CoherentDetectionPage />}
                {activeTab === 'laser' && <LaserPage />}
                {activeTab === 'mzm' && <MzmPage />}
                {activeTab === 'wavelocking' && <Placeholder title="Wavelocking" />}
                {activeTab === 'gain' && <Placeholder title="Gain Control" />}
            </main>
        </div>
    );
};

export default App;