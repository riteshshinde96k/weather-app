// Weather App Configuration
const CONFIG = {
    // OpenWeatherMap API Configuration
    API_KEY: '5bb3181b77731314811876d4862e10d3', // Your OpenWeatherMap API key
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    ICON_URL: 'https://openweathermap.org/img/wn',
    
    // API Endpoints
    ENDPOINTS: {
        CURRENT_WEATHER: '/weather',
        FORECAST: '/forecast'
    },
    
    // Default Settings
    UNITS: 'metric', // metric, imperial, or kelvin
    LANGUAGE: 'en',
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        LAST_SEARCHED_CITY: 'weather_app_last_city',
        USER_PREFERENCES: 'weather_app_preferences'
    },
    
    // App Settings
    FORECAST_DAYS: 5,
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutes in milliseconds
    REQUEST_TIMEOUT: 10000, // 10 seconds
    
    // Error Messages
    ERROR_MESSAGES: {
        CITY_NOT_FOUND: 'City not found. Please check the spelling and try again.',
        NETWORK_ERROR: 'Network error. Please check your internet connection.',
        API_ERROR: 'Unable to fetch weather data. Please try again later.',
        INVALID_API_KEY: 'Invalid API key. Please check your configuration.',
        RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
        GENERIC_ERROR: 'Something went wrong. Please try again.'
    },
    
    // Success Messages
    SUCCESS_MESSAGES: {
        DATA_LOADED: 'Weather data loaded successfully',
        CITY_SAVED: 'City saved to your recent searches'
    }
};

// Utility function to build API URLs
CONFIG.buildUrl = function(endpoint, params = {}) {
    const url = new URL(this.BASE_URL + endpoint);
    
    // Add API key
    url.searchParams.append('appid', this.API_KEY);
    
    // Add default parameters
    url.searchParams.append('units', this.UNITS);
    url.searchParams.append('lang', this.LANGUAGE);
    
    // Add custom parameters
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.append(key, params[key]);
        }
    });
    
    return url.toString();
};

// Utility function to get weather icon URL
CONFIG.getIconUrl = function(iconCode, size = '@2x') {
    return `${this.ICON_URL}/${iconCode}${size}.png`;
};

// Utility function to validate API key
CONFIG.isValidApiKey = function() {
    return this.API_KEY && this.API_KEY !== 'YOUR_API_KEY' && this.API_KEY.length > 10;
};

// Test function to verify API configuration
CONFIG.testApiConnection = async function() {
    const testUrl = this.buildUrl(this.ENDPOINTS.CURRENT_WEATHER, { q: 'London' });
    console.log('Test API URL:', testUrl);
    
    try {
        const response = await fetch(testUrl);
        console.log('API Test Response Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('API Test Success:', data.name, data.main.temp + '°C');
            return true;
        } else {
            const errorData = await response.json();
            console.error('API Test Error:', errorData);
            return false;
        }
    } catch (error) {
        console.error('API Test Failed:', error);
        return false;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
