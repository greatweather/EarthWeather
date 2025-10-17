import { WeatherData } from '../types';

const WMO_CODES: { [key: number]: { description: string; icon: string } } = {
    0: { description: 'Clear sky', icon: '☀️' },
    1: { description: 'Mainly clear', icon: '🌤️' },
    2: { description: 'Partly cloudy', icon: '🌥️' },
    3: { description: 'Overcast', icon: '☁️' },
    45: { description: 'Fog', icon: '🌫️' },
    48: { description: 'Depositing rime fog', icon: '🌫️' },
    51: { description: 'Light drizzle', icon: '🌦️' },
    53: { description: 'Moderate drizzle', icon: '🌦️' },
    55: { description: 'Dense drizzle', icon: '🌦️' },
    56: { description: 'Light freezing drizzle', icon: '🌨️' },
    57: { description: 'Dense freezing drizzle', icon: '🌨️' },
    61: { description: 'Slight rain', icon: '🌧️' },
    63: { description: 'Moderate rain', icon: '🌧️' },
    65: { description: 'Heavy rain', icon: '🌧️' },
    66: { description: 'Light freezing rain', icon: '🌨️' },
    67: { description: 'Heavy freezing rain', icon: '🌨️' },
    71: { description: 'Slight snow fall', icon: '🌨️' },
    73: { description: 'Moderate snow fall', icon: '🌨️' },
    75: { description: 'Heavy snow fall', icon: '🌨️' },
    77: { description: 'Snow grains', icon: '🌨️' },
    80: { description: 'Slight rain showers', icon: '🌧️' },
    81: { description: 'Moderate rain showers', icon: '🌧️' },
    82: { description: 'Violent rain showers', icon: '🌧️' },
    85: { description: 'Slight snow showers', icon: '🌨️' },
    86: { description: 'Heavy snow showers', icon: '🌨️' },
    95: { description: 'Thunderstorm', icon: '⛈️' },
    96: { description: 'Thunderstorm with hail', icon: '⛈️' },
    99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

export interface LocationData {
    lat: number;
    lon: number;
    city: string;
    country: string;
}

export const geocodeLocation = async (query: string): Promise<LocationData> => {
    try {
        let lat: number, lon: number;
        let city: string, country: string;

        const coordsRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
        const isCoords = coordsRegex.test(query);

        if (isCoords) {
            const parts = query.split(',');
            lat = parseFloat(parts[0]);
            lon = parseFloat(parts[1]);
            
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=zh,en`);
            if (!geoResponse.ok) throw new Error('Failed to reverse geocode coordinates.');
            const geoData = await geoResponse.json();
            
            if (!geoData.results || geoData.results.length === 0) {
                city = 'Unknown Location';
                country = '';
            } else {
                city = geoData.results[0].name;
                country = geoData.results[0].country_code;
            }
        } else {
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=zh,en`);
            if (!geoResponse.ok) throw new Error(`Could not find location: ${query}`);
            const geoData = await geoResponse.json();
            
            if (!geoData.results || geoData.results.length === 0) {
                throw new Error(`Could not find location: ${query}`);
            }
            const location = geoData.results[0];
            lat = location.latitude;
            lon = location.longitude;
            city = location.name;
            country = location.country_code;
        }

        return { lat, lon, city, country };

    } catch (e) {
        console.error("Error geocoding location:", e);
        if (e instanceof Error && e.message.includes('Could not find location')) {
            throw e;
        }
        throw new Error("Failed to find location. The service may be unavailable.");
    }
};

export const fetchWeatherForLocation = async (lat: number, lon: number, city: string, country: string): Promise<WeatherData> => {
     try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&wind_speed_unit=ms`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

        const [weatherResponse, aqiResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(aqiUrl)
        ]);
        
        if (!weatherResponse.ok) {
            throw new Error("Failed to fetch weather data from Open-Meteo.");
        }
        if (!aqiResponse.ok) {
             console.warn("Failed to fetch AQI data. This might not be available for all locations.");
        }
        
        const weatherDataJson = await weatherResponse.json();
        const aqiDataJson = aqiResponse.ok ? await aqiResponse.json() : null;

        if (!weatherDataJson.current) {
             throw new Error("Incomplete weather data received.");
        }

        const wmoCode = weatherDataJson.current.weather_code;
        const weatherInfo = WMO_CODES[wmoCode] || { description: 'Unknown', icon: '🌍' };
        
        return {
            city,
            country,
            temperature: Math.round(weatherDataJson.current.temperature_2m),
            humidity: weatherDataJson.current.relative_humidity_2m,
            windSpeed: Number(weatherDataJson.current.wind_speed_10m.toFixed(1)),
            weatherIcon: weatherInfo.icon,
            weatherDescription: weatherInfo.description,
            maxTemp: Math.round(weatherDataJson.daily.temperature_2m_max[0]),
            minTemp: Math.round(weatherDataJson.daily.temperature_2m_min[0]),
            aqi: aqiDataJson?.current?.us_aqi ?? 0,
        };
    } catch(e) {
        console.error("Error fetching weather:", e);
        throw new Error("Failed to get weather data. The service may be unavailable.");
    }
};