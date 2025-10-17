import React, { useState, useCallback } from 'react';
import { Globe } from './components/Globe';
import { Hud } from './components/Hud';
import { WeatherDisplay } from './components/WeatherDisplay';
import { StarryBackground } from './components/StarryBackground';
import { fetchWeatherForLocation, geocodeLocation } from './services/api';
import { WeatherData, Coordinates, City } from './types';

interface WeatherCardPosition {
    x: number;
    y: number;
}

const App: React.FC = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [targetCoordinates, setTargetCoordinates] = useState<Coordinates | null>(null);
    const [weatherCardPosition, setWeatherCardPosition] = useState<WeatherCardPosition | null>(null);
    const [countryCode, setCountryCode] = useState<string | null>(null);
    const [loadingStatus, setLoadingStatus] = useState<{ message: string; progress: number } | null>({ message: 'Loading map textures...', progress: 0 });
    const [startCloudLoading, setStartCloudLoading] = useState<boolean>(false);


    const handleError = useCallback((err: unknown) => {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(message);
        setWeatherData(null);
    }, []);

    const handleSearch = useCallback(async (search: { query: string } | { city: City }) => {
        setIsLoading(true);
        setError(null);
        setWeatherData(null);
        setTargetCoordinates(null);
        setWeatherCardPosition(null);
        setCountryCode(null);
        try {
            let lat: number, lon: number, cityName: string, country: string;

            if ('city' in search) {
                // Local search from autocomplete
                const { city } = search;
                lat = city.lat;
                lon = city.lon;
                cityName = city.name_zh; // Prefer Chinese name for display
                country = city.country_code;
            } else {
                // Remote search fallback
                const location = await geocodeLocation(search.query);
                lat = location.lat;
                lon = location.lon;
                cityName = location.city;
                country = location.country;
            }

            const weather = await fetchWeatherForLocation(lat, lon, cityName, country);
            setWeatherData(weather);
            setTargetCoordinates({ lat, lon });
            setCountryCode(country);
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
        setCountryCode(null);
    };

    const handleTextureProgress = useCallback((progress: number) => {
        setLoadingStatus(prev => prev ? { ...prev, progress, message: 'Loading map textures...' } : { message: 'Loading map textures...', progress });
    }, []);

    const handleTexturesLoaded = useCallback(() => {
        setLoadingStatus({ message: 'Loading real-time satellite cloud imagery...', progress: 0 });
        setStartCloudLoading(true);
    }, []);

    const handleCloudProgress = useCallback((progress: number) => {
        setLoadingStatus(prev => prev ? { ...prev, progress, message: 'Loading real-time satellite cloud imagery...' } : { message: 'Loading real-time satellite cloud imagery...', progress });
    }, []);

    const handleCloudsLoaded = useCallback(() => {
        setLoadingStatus(null);
    }, []);


    return (
        <div className="relative w-screen h-dvh overflow-hidden bg-[#0a0e21] text-white">
            <StarryBackground />
            <Globe 
                targetCoordinates={targetCoordinates} 
                onTargetPositionUpdate={setWeatherCardPosition}
                onTextureProgress={handleTextureProgress}
                onTexturesLoaded={handleTexturesLoaded}
                onCloudProgress={handleCloudProgress}
                onCloudsLoaded={handleCloudsLoaded}
                startCloudLoading={startCloudLoading}
                countryCode={countryCode}
            />
            <Hud
                onSearch={handleSearch}
                isLoading={isLoading}
                loadingStatus={loadingStatus}
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