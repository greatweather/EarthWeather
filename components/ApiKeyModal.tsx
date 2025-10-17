import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
    onSave: (apiKey: string) => void;
    initialError?: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, initialError }) => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState(initialError);

    useEffect(() => {
        setError(initialError);
    }, [initialError]);

    const handleSave = () => {
        if (apiKey.trim() === '') {
            setError('API key cannot be empty.');
            return;
        }
        onSave(apiKey);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#0e122b] border border-cyan-400/50 rounded-2xl shadow-lg p-6 max-w-lg w-full text-white" style={{ textShadow: '0 0 5px #00e0ff' }}>
                <h2 className="font-orbitron text-2xl mb-4 text-cyan-300">API Key Required</h2>
                <p className="mb-4 text-gray-300">
                    This application requires a free API key from OpenWeatherMap to display weather data. Please create an account and get your key.
                </p>
                <a 
                    href="https://home.openweathermap.org/api_keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-cyan-500/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-colors mb-6"
                >
                    Get Your Free API Key
                </a>
                <div className="mb-4">
                    <label htmlFor="apiKeyInput" className="block text-sm font-medium text-gray-400 mb-2">Enter your OpenWeatherMap API Key:</label>
                    <input
                        id="apiKeyInput"
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste your API key here"
                        className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-cyan-400/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                    />
                </div>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                <button
                    onClick={handleSave}
                    className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0e122b] transition-colors"
                >
                    Save and Continue
                </button>
            </div>
        </div>
    );
};