// Weather Service for API interactions
class WeatherService {
    constructor() {
        this.requestController = null;
    }
    
    // Main method to get weather data for a city
    async getWeatherData(cityName) {
        if (!cityName || typeof cityName !== 'string') {
            throw new Error('City name is required');
        }
        
        // Check if API key is configured
        if (!CONFIG.isValidApiKey()) {
            throw new Error('API key not configured. Please add your OpenWeatherMap API key to config.js');
        }
        
        const trimmedCity = cityName.trim();
        
        // Check cache first
        const cached = stateManager.getCachedWeatherData(trimmedCity);
        if (cached) {
            console.log('Using cached data for:', trimmedCity);
            return {
                currentWeather: cached.currentWeather,
                forecast: cached.forecast
            };
        }
        
        try {
            // Cancel any ongoing request
            this.cancelRequest();
            
            // Create new abort controller
            this.requestController = new AbortController();
            
            // Fetch both current weather and forecast concurrently
            const [currentWeather, forecast] = await Promise.all([
                this.getCurrentWeather(trimmedCity),
                this.getForecast(trimmedCity)
            ]);
            
            return {
                currentWeather,
                forecast
            };
            
        } catch (error) {
            this.handleApiError(error);
            throw error;
        } finally {
            this.requestController = null;
        }
    }
    
    // Get current weather for a city
    async getCurrentWeather(cityName) {
        const url = CONFIG.buildUrl(CONFIG.ENDPOINTS.CURRENT_WEATHER, {
            q: cityName
        });
        
        const response = await this.makeRequest(url);
        return this.processCurrentWeatherData(response);
    }
    
    // Get 5-day forecast for a city
    async getForecast(cityName) {
        const url = CONFIG.buildUrl(CONFIG.ENDPOINTS.FORECAST, {
            q: cityName
        });
        
        const response = await this.makeRequest(url);
        return this.processForecastData(response);
    }
    
    // Make HTTP request with error handling
    async makeRequest(url) {
        const options = {
            method: 'GET',
            signal: this.requestController?.signal
        };
        
        try {
            console.log('Making request to:', url);
            const response = await fetch(url, options);
            
            if (!response.ok) {
                console.error('HTTP Error:', response.status, response.statusText);
                await this.handleHttpError(response);
            }
            
            const data = await response.json();
            console.log('API Response received:', data);
            return data;
            
        } catch (error) {
            console.error('Fetch error:', error);
            
            if (error.name === 'AbortError') {
                throw new Error('Request was cancelled');
            }
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error(CONFIG.ERROR_MESSAGES.NETWORK_ERROR);
            }
            
            // More specific error handling
            if (error.message.includes('CORS')) {
                throw new Error('CORS error: Unable to access weather API from this domain');
            }
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error: Please check your internet connection and try again');
            }
            
            throw error;
        }
    }
    
    // Handle HTTP errors
    async handleHttpError(response) {
        let errorMessage = CONFIG.ERROR_MESSAGES.GENERIC_ERROR;
        
        try {
            const errorData = await response.json();
            
            switch (response.status) {
                case 404:
                    errorMessage = CONFIG.ERROR_MESSAGES.CITY_NOT_FOUND;
                    break;
                case 401:
                    errorMessage = CONFIG.ERROR_MESSAGES.INVALID_API_KEY;
                    break;
                case 429:
                    errorMessage = CONFIG.ERROR_MESSAGES.RATE_LIMIT;
                    break;
                case 500:
                case 502:
                case 503:
                    errorMessage = CONFIG.ERROR_MESSAGES.API_ERROR;
                    break;
                default:
                    errorMessage = errorData.message || CONFIG.ERROR_MESSAGES.GENERIC_ERROR;
            }
        } catch (parseError) {
            // If we can't parse the error response, use default message
            console.warn('Failed to parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
    }
    
    // Process current weather data
    processCurrentWeatherData(data) {
        return {
            id: data.id,
            name: data.name,
            country: data.sys.country,
            coordinates: {
                lat: data.coord.lat,
                lon: data.coord.lon
            },
            weather: {
                main: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon
            },
            temperature: {
                current: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                min: Math.round(data.main.temp_min),
                max: Math.round(data.main.temp_max)
            },
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
            wind: {
                speed: data.wind?.speed || 0,
                direction: data.wind?.deg || 0
            },
            clouds: data.clouds?.all || 0,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            timezone: data.timezone,
            timestamp: data.dt,
            fetchedAt: Date.now()
        };
    }
    
    // Process forecast data
    processForecastData(data) {
        const dailyForecasts = new Map();
        
        // Group forecasts by date
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString();
            
            if (!dailyForecasts.has(dateKey)) {
                dailyForecasts.set(dateKey, []);
            }
            
            dailyForecasts.get(dateKey).push({
                datetime: item.dt,
                temperature: {
                    current: Math.round(item.main.temp),
                    min: Math.round(item.main.temp_min),
                    max: Math.round(item.main.temp_max),
                    feelsLike: Math.round(item.main.feels_like)
                },
                weather: {
                    main: item.weather[0].main,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon
                },
                humidity: item.main.humidity,
                pressure: item.main.pressure,
                wind: {
                    speed: item.wind?.speed || 0,
                    direction: item.wind?.deg || 0
                },
                clouds: item.clouds?.all || 0,
                pop: Math.round((item.pop || 0) * 100) // Probability of precipitation
            });
        });
        
        // Process daily summaries
        const dailySummaries = [];
        let dayCount = 0;
        
        for (const [dateKey, forecasts] of dailyForecasts) {
            if (dayCount >= CONFIG.FORECAST_DAYS) break;
            
            // Skip today if we already have current weather
            const forecastDate = new Date(dateKey);
            const today = new Date();
            if (forecastDate.toDateString() === today.toDateString() && dayCount === 0) {
                continue;
            }
            
            const summary = this.createDailySummary(dateKey, forecasts);
            dailySummaries.push(summary);
            dayCount++;
        }
        
        return {
            city: {
                id: data.city.id,
                name: data.city.name,
                country: data.city.country,
                coordinates: {
                    lat: data.city.coord.lat,
                    lon: data.city.coord.lon
                }
            },
            daily: dailySummaries,
            raw: data.list,
            fetchedAt: Date.now()
        };
    }
    
    // Create daily summary from hourly forecasts
    createDailySummary(dateKey, forecasts) {
        const date = new Date(dateKey);
        
        // Find the most common weather condition
        const weatherCounts = {};
        forecasts.forEach(f => {
            const key = f.weather.main;
            weatherCounts[key] = (weatherCounts[key] || 0) + 1;
        });
        
        const mostCommonWeather = Object.keys(weatherCounts).reduce((a, b) => 
            weatherCounts[a] > weatherCounts[b] ? a : b
        );
        
        // Get the forecast item with the most common weather for icon
        const representativeForecast = forecasts.find(f => 
            f.weather.main === mostCommonWeather
        ) || forecasts[0];
        
        // Calculate temperature range
        const temps = forecasts.map(f => f.temperature.current);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        
        // Calculate average humidity
        const avgHumidity = Math.round(
            forecasts.reduce((sum, f) => sum + f.humidity, 0) / forecasts.length
        );
        
        return {
            date: date.toISOString().split('T')[0],
            dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
            shortDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            temperature: {
                min: minTemp,
                max: maxTemp
            },
            weather: {
                main: mostCommonWeather,
                description: representativeForecast.weather.description,
                icon: representativeForecast.weather.icon
            },
            humidity: avgHumidity,
            forecasts: forecasts
        };
    }
    
    // Cancel ongoing request
    cancelRequest() {
        if (this.requestController) {
            this.requestController.abort();
            this.requestController = null;
        }
    }
    
    // Handle API errors
    handleApiError(error) {
        console.error('Weather API Error:', error);
        
        // Log additional context in development
        if (stateManager.isDevelopment()) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }
    }
    
    // Utility method to get weather icon URL
    getWeatherIconUrl(iconCode, size = '@2x') {
        return CONFIG.getIconUrl(iconCode, size);
    }
    
    // Utility method to format wind direction
    getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                          'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }
    
    // Utility method to format visibility
    formatVisibility(visibilityInMeters) {
        if (!visibilityInMeters) return 'N/A';
        
        const km = visibilityInMeters / 1000;
        if (km >= 10) {
            return `${Math.round(km)} km`;
        } else {
            return `${km.toFixed(1)} km`;
        }
    }
}

// Create and export singleton instance
const weatherService = new WeatherService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherService;
} else {
    window.WeatherService = WeatherService;
    window.weatherService = weatherService;
}
