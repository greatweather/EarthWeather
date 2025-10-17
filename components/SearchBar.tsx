
import React, { useState, KeyboardEvent, useMemo, useRef, useEffect } from 'react';
import { City } from '../types';
import { cities } from '../data/cities';
import { toPinyin } from '../services/pinyin';

interface SearchBarProps {
    onSearch: (search: { query: string } | { city: City }) => void;
    isLoading: boolean;
}

// Pre-process cities with pinyin for efficient searching
const citiesWithPinyin = cities.map(city => ({
    ...city,
    pinyin: toPinyin(city.name_zh.toLowerCase())
}));

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<City[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (searchTerm: string) => {
        const trimmedSearchTerm = searchTerm.trim();
        if (!trimmedSearchTerm || isLoading) {
            return;
        }

        const lowerCaseTerm = trimmedSearchTerm.toLowerCase();

        // Prioritize local search for direct input before falling back to API
        const localMatch = citiesWithPinyin.find(city =>
            city.name_en.toLowerCase() === lowerCaseTerm ||
            city.name_zh === trimmedSearchTerm || // Exact match for Chinese characters
            city.pinyin === lowerCaseTerm
        );

        if (localMatch) {
            handleSelectCity(localMatch);
        } else {
            // Fallback to remote geocoding
            onSearch({ query: trimmedSearchTerm });
            setQuery('');
            setSuggestions([]);
        }
    };

    const handleSelectCity = (city: City) => {
        onSearch({ city });
        setQuery('');
        setSuggestions([]);
        setActiveIndex(-1); // Reset active index
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setActiveIndex(-1);

        if (value.length < 1) {
            setSuggestions([]);
            return;
        }

        const lowerCaseValue = value.toLowerCase();
        const filtered = citiesWithPinyin.filter(city =>
            city.name_en.toLowerCase().includes(lowerCaseValue) ||
            city.name_zh.includes(value) ||
            city.pinyin.includes(lowerCaseValue)
        ).slice(0, 7); // Show up to 7 suggestions

        setSuggestions(filtered);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.nativeEvent.isComposing) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (event.key === 'Enter') {
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                handleSelectCity(suggestions[activeIndex]);
            } else {
                handleSearch(query);
            }
        } else if (event.key === 'Escape') {
            setSuggestions([]);
        }
    };
    
    const baseButtonClasses = "p-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto";
    const iconButtonClasses = `${baseButtonClasses} bg-white/10 backdrop-blur-sm text-white hover:bg-cyan-500/50 hover:shadow-[0_0_10px_#00e0ff]`;

    return (
        <div ref={searchContainerRef} className="w-full max-w-sm relative pointer-events-auto">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search city (e.g., Shanghai, 纽约, or an)"
                    disabled={isLoading}
                    className="flex-grow bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-cyan-400/50 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 ease-in-out shadow-inner"
                    autoComplete="off"
                />
                <button onClick={() => handleSearch(query)} disabled={isLoading || !query} className={iconButtonClasses}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>

            {suggestions.length > 0 && (
                <ul className="absolute bottom-full mb-2 w-full bg-black/50 backdrop-blur-lg border border-cyan-400/50 rounded-2xl overflow-hidden shadow-lg z-10">
                    {suggestions.map((city, index) => (
                        <li
                            key={`${city.lat}-${city.lon}`}
                            className={`px-4 py-2 cursor-pointer transition-colors duration-200 ${
                                index === activeIndex ? 'bg-cyan-500/40' : 'hover:bg-cyan-500/20'
                            }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectCity(city);
                            }}
                        >
                            <span className="font-semibold">{city.name_zh}</span>
                            <span className="text-gray-300 ml-2">{city.name_en}</span>
                            <span className="text-gray-400 text-sm float-right pt-1">{city.country_zh}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};