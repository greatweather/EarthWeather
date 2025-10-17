
import React, { useState, KeyboardEvent } from 'react';

interface SearchBarProps {
    onSearch: (city: string) => void;
    isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
    const [city, setCity] = useState('');

    const handleSearch = () => {
        if (city && !isLoading) {
            onSearch(city);
            setCity('');
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        // Prevent search from firing while composing characters with an IME
        if (event.nativeEvent.isComposing) {
            return;
        }
        if (event.key === 'Enter') {
            handleSearch();
        }
    };
    
    const baseButtonClasses = "p-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto";
    const iconButtonClasses = `${baseButtonClasses} bg-white/10 backdrop-blur-sm text-white hover:bg-cyan-500/50 hover:shadow-[0_0_10px_#00e0ff]`;

    return (
        <div className="w-full max-w-sm flex items-center gap-2 pointer-events-auto">
            <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search a city to get the weather"
                disabled={isLoading}
                className="flex-grow bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-cyan-400/50 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 ease-in-out shadow-inner"
            />
            <button onClick={handleSearch} disabled={isLoading} className={iconButtonClasses}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
        </div>
    );
};