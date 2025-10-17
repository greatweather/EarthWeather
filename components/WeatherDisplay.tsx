import React from 'react';
import { WeatherData } from '../types';

interface WeatherDisplayProps {
    weatherData: WeatherData | null;
    isLoading: boolean;
    error: string | null;
    position: { x: number; y: number } | null;
    onClose: () => void;
}

const getCardStyle = (icon: string | undefined): React.CSSProperties => {
    let backgroundColor = 'rgba(105, 105, 105, 0.35)'; // default gray, increased transparency
    if (!icon) return { backgroundColor };
    
    if (['☀️'].includes(icon)) backgroundColor = 'rgba(255, 215, 0, 0.35)'; // Gold
    else if (['☁️'].includes(icon)) backgroundColor = 'rgba(135, 206, 235, 0.35)'; // SkyBlue
    else if (['🌫️', '🌬️', '🌪️'].includes(icon)) backgroundColor = 'rgba(192, 192, 192, 0.35)'; // Silver
    else if (['🌧️', '🌦️'].includes(icon)) backgroundColor = 'rgba(30, 144, 255, 0.35)'; // DodgerBlue
    else if (['🌨️', '❄️'].includes(icon)) backgroundColor = 'rgba(135, 206, 250, 0.35)'; // LightSkyBlue
    else if (['⛈️', '🌩️'].includes(icon)) backgroundColor = 'rgba(72, 61, 139, 0.35)'; // DarkSlateBlue

    return { 
        backgroundColor,
        boxShadow: `0 0 20px ${backgroundColor.replace('0.35', '0.6')}`
    };
};

const getAqiInfo = (aqi: number): { text: string; color: string } => {
    if (aqi <= 50) return { text: 'Good', color: '#4ade80' }; // green-400
    if (aqi <= 100) return { text: 'Moderate', color: '#facc15' }; // yellow-400
    if (aqi <= 150) return { text: 'Unhealthy for Some', color: '#fb923c' }; // orange-400
    if (aqi <= 200) return { text: 'Unhealthy', color: '#f87171' }; // red-400
    if (aqi <= 300) return { text: 'Very Unhealthy', color: '#c084fc' }; // purple-400
    return { text: 'Hazardous', color: '#a16207' }; // ~maroon
};


export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, isLoading, error, position, onClose }) => {
    const isPositionedOnGlobe = weatherData && position;

    const wrapperBaseStyle: React.CSSProperties = {
        transition: 'all 0.7s cubic-bezier(0.25, 1, 0.5, 1)',
        width: '100%',
        maxWidth: '22rem',
    };

    const wrapperPositionStyle: React.CSSProperties = isPositionedOnGlobe
        ? {
            position: 'absolute',
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, 15px) scale(0.75)',
            transformOrigin: 'top center',
            maxWidth: '320px'
          }
        : {
            position: 'absolute',
            left: '50%',
            bottom: '10rem',
            transform: 'translateX(-50%) scale(0.95)',
            transformOrigin: 'center bottom',
          };

    const combinedStyle = { ...wrapperBaseStyle, ...wrapperPositionStyle };
    
    const cardStyle = getCardStyle(weatherData?.weatherIcon);
    const aqiInfo = weatherData ? getAqiInfo(weatherData.aqi) : null;

    if (isLoading) {
        return (
            <div style={combinedStyle}>
                <div className="p-4 text-center bg-white/10 backdrop-blur-md rounded-2xl shadow-lg pointer-events-auto">
                    <div className="font-orbitron text-lg text-cyan-300 animate-pulse">Loading...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={combinedStyle}>
                <div className="p-4 text-center bg-red-900/50 backdrop-blur-md rounded-2xl shadow-lg pointer-events-auto">
                    <div className="font-orbitron text-lg text-red-300">{error}</div>
                </div>
            </div>
        );
    }
    
    if (!weatherData) {
        return null;
    }

    return (
        <div style={combinedStyle}>
            <div 
                style={{ ...cardStyle, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                className="relative p-4 text-white backdrop-blur-md rounded-xl border border-white/20 pointer-events-auto"
            >
                {isPositionedOnGlobe && (
                    <button 
                        onClick={onClose} 
                        className="absolute top-2 right-2 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all z-10"
                        aria-label="Close weather display"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
                <div className="flex flex-col items-center text-center">
                    <div className="location mb-1">
                        <h2 className={`font-orbitron font-bold ${isPositionedOnGlobe ? 'text-2xl' : 'text-2xl'}`}>{weatherData.city}</h2>
                        <p className={`text-gray-300 ${isPositionedOnGlobe ? 'text-sm' : 'text-sm'}`}>{weatherData.country}</p>
                    </div>

                    <div className="flex items-center gap-4 my-1">
                        <div className={`${isPositionedOnGlobe ? 'text-5xl' : 'text-6xl'}`}>{weatherData.weatherIcon}</div>
                        <div className="weather-info text-left">
                            <div className={`font-bold font-orbitron ${isPositionedOnGlobe ? 'text-5xl' : 'text-5xl'}`}>{weatherData.temperature}°C</div>
                            <div className={`capitalize text-gray-200 ${isPositionedOnGlobe ? 'text-lg' : 'text-lg'}`}>{weatherData.weatherDescription}</div>
                        </div>
                    </div>
                    
                    <div className={`w-full flex justify-center gap-4 my-2 ${isPositionedOnGlobe ? 'text-base' : 'text-base'}`}>
                        <span>H: {weatherData.maxTemp}°</span>
                        <span>L: {weatherData.minTemp}°</span>
                    </div>

                    <div className={`details mt-3 pt-3 border-t border-white/20 w-full grid grid-cols-2 gap-2 ${isPositionedOnGlobe ? 'text-sm' : 'text-sm'}`}>
                        <div className="text-center">
                            <p className="text-gray-300 font-medium">Humidity</p>
                            <p>{weatherData.humidity}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-300 font-medium">Wind</p>
                            <p>{weatherData.windSpeed} m/s</p>
                        </div>
                        <div className="text-center col-span-2 mt-1">
                            <p className="text-gray-300 font-medium">Air Quality</p>
                            <p>
                                {weatherData.aqi} - <span style={{ color: aqiInfo?.color, fontWeight: 'bold' }}>{aqiInfo?.text}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};