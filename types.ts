export interface Coordinates {
    lat: number;
    lon: number;
}

export interface WeatherData {
    city: string;
    country: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherIcon: string;
    weatherDescription: string;
    maxTemp: number;
    minTemp: number;
    aqi: number;
}

export interface Star {
    x: number;
    y: number;
    z: number;
    speed: number;
}

export interface City {
    name_en: string;
    name_zh: string;
    country_en: string;
    country_zh: string;
    country_code: string;
    lat: number;
    lon: number;
}