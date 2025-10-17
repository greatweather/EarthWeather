import React from 'react';
import { SearchBar } from './SearchBar';

interface HudProps {
    isLoading: boolean;
    onSearch: (city: string) => void;
}

// Renamed to HudComponent to be wrapped by React.memo
const HudComponent: React.FC<HudProps> = ({ isLoading, onSearch }) => {
    return (
        <div className="absolute top-0 left-0 w-full h-full p-4 md:p-8 pointer-events-none z-20 flex flex-col justify-between">
            <header className="w-full flex justify-center">
                <h1 className="font-orbitron text-2xl md:text-4xl text-white text-center tracking-widest uppercase" style={{ textShadow: '0 0 10px #00e0ff' }}>
                    Earth Weather Explorer
                </h1>
            </header>

            {/* This empty main acts as a spacer to push the footer down */}
            <main className="flex-grow"></main>

            <footer className="w-full flex flex-col items-center">
                <SearchBar onSearch={onSearch} isLoading={isLoading} />
                 <p className="text-xs text-gray-400 mt-4 text-center">
                    Weather data from Open-Meteo | Satellite data from NOAA / CIRA
                </p>
            </footer>
        </div>
    );
};

// Export the memoized component to prevent re-renders from parent state changes
// that do not affect this component's props. This is critical for fixing the
// Chinese IME issue caused by high-frequency re-renders.
export const Hud = React.memo(HudComponent);