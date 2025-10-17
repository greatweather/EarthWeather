
import React, { useState, useCallback } from 'react';
import { Globe } from './components/Globe';
import { Hud } from './components/Hud';
import { WeatherDisplay } from './components/WeatherDisplay';
import { StarryBackground } from './components/StarryBackground';
import { getWeather } from './services/api';
import { WeatherData, Coordinates } from './types';

interface WeatherCardPosition {
    x: number;
    y: number;
}

const App: React.FC = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false); // No initial loading
    const [error, setError] = useState<string | null>(null);
    const [targetCoordinates, setTargetCoordinates] = useState<Coordinates | null>(null);
    const [weatherCardPosition, setWeatherCardPosition] = useState<WeatherCardPosition | null>(null);

    // Fix: Wrap `handleError` in `useCallback` to ensure it has a stable identity.
    // State setters from `useState` are guaranteed to be stable and do not need to be dependencies.
    const handleError = useCallback((err: unknown) => {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(message);
        setWeatherData(null);
    }, []);

    // Fix: Add `handleError` to the dependency array of `useCallback`.
    // This ensures `handleSearch` does not have a stale closure over `handleError`.
    const handleSearch = useCallback(async (city: string) => {
        setIsLoading(true);
        setError(null);
        setWeatherData(null);
        setTargetCoordinates(null);
        setWeatherCardPosition(null);
        try {
            const { weather, coords } = await getWeather(city);
            setWeatherData(weather);
            setTargetCoordinates(coords);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);
    
    const handleCloseWeather = () => {
        setWeatherData(null);
        setTargetCoordinates(null);
        setWeatherCardPosition(null);
    };

    return (
        <div className="relative w-screen h-dvh overflow-hidden bg-[#0a0e21] text-white">
            <StarryBackground />
            <Globe 
                targetCoordinates={targetCoordinates} 
                onTargetPositionUpdate={setWeatherCardPosition}
            />
            <Hud
                onSearch={handleSearch}
                isLoading={isLoading}
            />
            {/* WeatherDisplay is rendered in its own layer to allow for free absolute positioning */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-30">
                 <WeatherDisplay 
                    weatherData={weatherData} 
                    isLoading={isLoading} 
                    error={error} 
                    position={weatherCardPosition}
                    onClose={handleCloseWeather}
                />
            </div>
        </div>
    );
};

export default App;