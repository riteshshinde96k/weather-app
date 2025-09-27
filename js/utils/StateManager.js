// State Management for Weather App
class StateManager {
    constructor() {
        this.state = {
            loading: false,
            error: null,
            currentWeather: null,
            forecast: null,
            lastSearchedCity: this.getLastSearchedCity(),
            currentView: 'current' // 'current' or 'forecast'
        };
        
        this.listeners = [];
        this.cache = new Map();
    }
    
    // Subscribe to state changes
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    // Notify all listeners of state changes
    notify() {
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('Error in state listener:', error);
            }
        });
    }
    
    // Update state and notify listeners
    setState(updates) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        // Log state changes in development
        if (this.isDevelopment()) {
            console.log('State updated:', {
                previous: prevState,
                current: this.state,
                changes: updates
            });
        }
        
        this.notify();
    }
    
    // Get current state
    getState() {
        return { ...this.state };
    }
    
    // Set loading state
    setLoading(loading, message = 'Loading...') {
        this.setState({
            loading,
            error: loading ? null : this.state.error,
            loadingMessage: message
        });
    }
    
    // Set error state
    setError(error) {
        this.setState({
            loading: false,
            error: error || 'An unexpected error occurred'
        });
    }
    
    // Clear error state
    clearError() {
        this.setState({ error: null });
    }
    
    // Set weather data
    setWeatherData(currentWeather, forecast = null) {
        this.setState({
            loading: false,
            error: null,
            currentWeather,
            forecast
        });
        
        // Cache the data
        if (currentWeather && currentWeather.name) {
            this.cacheWeatherData(currentWeather.name.toLowerCase(), {
                currentWeather,
                forecast,
                timestamp: Date.now()
            });
        }
    }
    
    // Set current view (current weather or forecast)
    setCurrentView(view) {
        this.setState({ currentView: view });
    }
    
    // Cache management
    cacheWeatherData(cityKey, data) {
        this.cache.set(cityKey, data);
        
        // Clean old cache entries (keep last 10 cities)
        if (this.cache.size > 10) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }
    
    getCachedWeatherData(cityName) {
        const cityKey = cityName.toLowerCase();
        const cached = this.cache.get(cityKey);
        
        if (cached && this.isCacheValid(cached.timestamp)) {
            return cached;
        }
        
        // Remove expired cache
        if (cached) {
            this.cache.delete(cityKey);
        }
        
        return null;
    }
    
    isCacheValid(timestamp) {
        return Date.now() - timestamp < CONFIG.CACHE_DURATION;
    }
    
    // LocalStorage management for last searched city
    setLastSearchedCity(cityName) {
        if (!cityName) return;
        
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_SEARCHED_CITY, cityName);
            this.setState({ lastSearchedCity: cityName });
        } catch (error) {
            console.warn('Failed to save last searched city:', error);
        }
    }
    
    getLastSearchedCity() {
        try {
            return localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_SEARCHED_CITY) || null;
        } catch (error) {
            console.warn('Failed to get last searched city:', error);
            return null;
        }
    }
    
    clearLastSearchedCity() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.LAST_SEARCHED_CITY);
            this.setState({ lastSearchedCity: null });
        } catch (error) {
            console.warn('Failed to clear last searched city:', error);
        }
    }
    
    // User preferences management
    saveUserPreferences(preferences) {
        try {
            const currentPrefs = this.getUserPreferences();
            const updatedPrefs = { ...currentPrefs, ...preferences };
            localStorage.setItem(
                CONFIG.STORAGE_KEYS.USER_PREFERENCES,
                JSON.stringify(updatedPrefs)
            );
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
        }
    }
    
    getUserPreferences() {
        try {
            const prefs = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PREFERENCES);
            return prefs ? JSON.parse(prefs) : {};
        } catch (error) {
            console.warn('Failed to get user preferences:', error);
            return {};
        }
    }
    
    // Utility methods
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname === '';
    }
    
    // Reset state to initial values
    reset() {
        this.state = {
            loading: false,
            error: null,
            currentWeather: null,
            forecast: null,
            lastSearchedCity: this.getLastSearchedCity(),
            currentView: 'current'
        };
        this.cache.clear();
        this.notify();
    }
    
    // Get formatted state for debugging
    getDebugInfo() {
        return {
            state: this.state,
            cacheSize: this.cache.size,
            listenersCount: this.listeners.length,
            cachedCities: Array.from(this.cache.keys())
        };
    }
}

// Create and export singleton instance
const stateManager = new StateManager();

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    stateManager.setError('An unexpected error occurred. Please try again.');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
} else {
    window.StateManager = StateManager;
    window.stateManager = stateManager;
}
