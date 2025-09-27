// Main Weather App Application
class WeatherApp {
    constructor() {
        this.components = {};
        this.isInitialized = false;
        this.retryAttempts = 0;
        this.maxRetryAttempts = 3;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('Initializing Weather App...');
            
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
            
        } catch (error) {
            console.error('Failed to initialize Weather App:', error);
            this.handleInitializationError(error);
        }
    }
    
    initializeApp() {
        try {
            // Check if required elements exist
            this.validateRequiredElements();
            
            // Initialize components
            this.initializeComponents();
            
            // Set up global event listeners
            this.setupGlobalEventListeners();
            
            // Set up error handling
            this.setupErrorHandling();
            
            // Load last searched city if available
            this.loadLastSearchedCity();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('Weather App initialized successfully');
            
            // Show welcome message or tutorial for first-time users
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Failed to initialize app components:', error);
            this.handleInitializationError(error);
        }
    }
    
    validateRequiredElements() {
        const requiredElements = [
            'cityInput',
            'searchBtn',
            'loadingContainer',
            'errorContainer',
            'weatherSection'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }
    }
    
    initializeComponents() {
        // Initialize state manager (already done globally)
        console.log('State manager initialized');
        
        // Initialize weather service (already done globally)
        console.log('Weather service initialized');
        
        // Initialize UI components
        this.components.searchBar = new SearchBar();
        console.log('SearchBar component initialized');
        
        this.components.weatherDisplay = new WeatherDisplay();
        console.log('WeatherDisplay component initialized');
        
        this.components.forecastDisplay = new ForecastDisplay();
        console.log('ForecastDisplay component initialized');
        
        // Initialize additional UI handlers
        this.initializeUIHandlers();
    }
    
    initializeUIHandlers() {
        // Loading container handler
        this.loadingContainer = document.getElementById('loadingContainer');
        this.errorContainer = document.getElementById('errorContainer');
        this.retryBtn = document.getElementById('retryBtn');
        
        // Retry button handler
        if (this.retryBtn) {
            this.retryBtn.addEventListener('click', () => {
                this.handleRetry();
            });
        }
        
        // Subscribe to state changes for UI updates
        stateManager.subscribe((state) => {
            this.handleGlobalStateChange(state);
        });
    }
    
    setupGlobalEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
        
        // Online/offline status
        window.addEventListener('online', () => {
            this.handleOnlineStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleOnlineStatus(false);
        });
        
        // Visibility change (tab focus/blur)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Before unload (save state)
        window.addEventListener('beforeunload', () => {
            this.saveAppState();
        });
    }
    
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleGlobalError(e.error);
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleGlobalError(e.reason);
        });
    }
    
    handleGlobalStateChange(state) {
        // Update loading UI
        this.updateLoadingUI(state.loading, state.loadingMessage);
        
        // Update error UI
        this.updateErrorUI(state.error);
        
        // Update document title based on state
        this.updateDocumentTitle(state);
        
        // Update app theme based on weather (optional enhancement)
        this.updateAppTheme(state.currentWeather);
    }
    
    updateLoadingUI(loading, message = 'Loading...') {
        if (loading) {
            this.loadingContainer.style.display = 'block';
            this.errorContainer.style.display = 'none';
            
            const loadingText = this.loadingContainer.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
        } else {
            this.loadingContainer.style.display = 'none';
        }
    }
    
    updateErrorUI(error) {
        if (error) {
            this.errorContainer.style.display = 'block';
            this.loadingContainer.style.display = 'none';
            
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = error;
            }
        } else {
            this.errorContainer.style.display = 'none';
        }
    }
    
    updateDocumentTitle(state) {
        if (state.currentWeather) {
            const temp = state.currentWeather.temperature.current;
            const city = state.currentWeather.name;
            document.title = `${temp}°C - ${city} | Weather App`;
        } else {
            document.title = 'Weather App 🌤️';
        }
    }
    
    updateAppTheme(weatherData) {
        if (!weatherData) return;
        
        const body = document.body;
        const condition = weatherData.weather.main.toLowerCase();
        
        // Remove existing weather classes
        body.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'stormy');
        
        // Add appropriate weather class
        switch (condition) {
            case 'clear':
                body.classList.add('sunny');
                break;
            case 'clouds':
                body.classList.add('cloudy');
                break;
            case 'rain':
            case 'drizzle':
                body.classList.add('rainy');
                break;
            case 'snow':
                body.classList.add('snowy');
                break;
            case 'thunderstorm':
                body.classList.add('stormy');
                break;
        }
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.components.searchBar?.focus();
        }
        
        // Escape: Clear search or close modals
        if (e.key === 'Escape') {
            this.handleEscapeKey();
        }
        
        // F5: Refresh current weather
        if (e.key === 'F5' && !e.ctrlKey) {
            e.preventDefault();
            this.refreshCurrentWeather();
        }
    }
    
    handleEscapeKey() {
        // Close any open modals
        const modals = document.querySelectorAll('.forecast-modal');
        modals.forEach(modal => {
            if (modal.classList.contains('visible')) {
                modal.classList.remove('visible');
                setTimeout(() => modal.remove(), 300);
            }
        });
        
        // Clear search if no weather data
        const state = stateManager.getState();
        if (!state.currentWeather && !state.loading) {
            this.components.searchBar?.clear();
        }
    }
    
    async refreshCurrentWeather() {
        const state = stateManager.getState();
        if (state.currentWeather) {
            const cityName = state.currentWeather.name;
            try {
                stateManager.setLoading(true, `Refreshing ${cityName}...`);
                const weatherData = await weatherService.getWeatherData(cityName);
                stateManager.setWeatherData(weatherData.currentWeather, weatherData.forecast);
                this.showToast('Weather data refreshed', 'success');
            } catch (error) {
                stateManager.setError(error.message);
                this.showToast('Failed to refresh weather data', 'error');
            }
        }
    }
    
    handleWindowResize() {
        // Responsive adjustments if needed
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile', isMobile);
    }
    
    handleOnlineStatus(isOnline) {
        if (isOnline) {
            this.showToast('Connection restored', 'success');
            // Retry last failed request if any
            this.retryLastFailedRequest();
        } else {
            this.showToast('No internet connection', 'warning');
        }
    }
    
    handleVisibilityChange() {
        if (!document.hidden) {
            // Tab became visible, check if data needs refresh
            this.checkDataFreshness();
        }
    }
    
    async checkDataFreshness() {
        const state = stateManager.getState();
        if (state.currentWeather) {
            const fetchedAt = state.currentWeather.fetchedAt;
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (now - fetchedAt > fiveMinutes) {
                // Data is older than 5 minutes, suggest refresh
                this.showRefreshPrompt();
            }
        }
    }
    
    showRefreshPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'refresh-prompt';
        prompt.innerHTML = `
            <div class="refresh-prompt-content">
                <p>Weather data is outdated. Refresh for latest information?</p>
                <button class="refresh-yes">Refresh</button>
                <button class="refresh-no">Later</button>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        prompt.querySelector('.refresh-yes').addEventListener('click', () => {
            this.refreshCurrentWeather();
            prompt.remove();
        });
        
        prompt.querySelector('.refresh-no').addEventListener('click', () => {
            prompt.remove();
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (prompt.parentNode) {
                prompt.remove();
            }
        }, 10000);
    }
    
    async loadLastSearchedCity() {
        const lastCity = stateManager.getState().lastSearchedCity;
        if (lastCity && this.isFirstVisit()) {
            try {
                stateManager.setLoading(true, `Loading weather for ${lastCity}...`);
                const weatherData = await weatherService.getWeatherData(lastCity);
                stateManager.setWeatherData(weatherData.currentWeather, weatherData.forecast);
                this.showToast(`Welcome back! Showing weather for ${lastCity}`, 'info');
            } catch (error) {
                console.warn('Failed to load last searched city:', error);
                // Don't show error for this, just clear the last searched city
                stateManager.clearLastSearchedCity();
            }
        }
    }
    
    isFirstVisit() {
        const hasVisited = localStorage.getItem('weather_app_visited');
        if (!hasVisited) {
            localStorage.setItem('weather_app_visited', 'true');
            return true;
        }
        return false;
    }
    
    showWelcomeMessage() {
        if (this.isFirstVisit()) {
            setTimeout(() => {
                this.showToast('Welcome to Weather App! Enter a city name to get started.', 'info', 5000);
            }, 1000);
        }
    }
    
    handleRetry() {
        if (this.retryAttempts >= this.maxRetryAttempts) {
            this.showToast('Maximum retry attempts reached. Please refresh the page.', 'error');
            return;
        }
        
        this.retryAttempts++;
        stateManager.clearError();
        
        // Retry the last search
        const lastCity = stateManager.getState().lastSearchedCity;
        if (lastCity) {
            this.components.searchBar?.setValue(lastCity);
            this.components.searchBar?.handleSearch();
        }
    }
    
    retryLastFailedRequest() {
        // Implementation for retrying last failed request when connection is restored
        const state = stateManager.getState();
        if (state.error && !state.loading) {
            this.handleRetry();
        }
    }
    
    handleGlobalError(error) {
        console.error('Global app error:', error);
        
        // Don't show error UI for minor errors
        if (error.name === 'AbortError' || error.message.includes('fetch')) {
            return;
        }
        
        stateManager.setError('An unexpected error occurred. Please try again.');
    }
    
    handleInitializationError(error) {
        console.error('App initialization error:', error);
        
        // Show fallback error UI
        document.body.innerHTML = `
            <div class="app-error">
                <div class="app-error-content">
                    <h1>⚠️ App Error</h1>
                    <p>Failed to initialize the Weather App.</p>
                    <p class="error-details">${error.message}</p>
                    <button onclick="location.reload()" class="retry-btn">
                        <i class="fas fa-redo"></i>
                        Reload App
                    </button>
                </div>
            </div>
        `;
    }
    
    saveAppState() {
        // Save current app state before page unload
        const state = stateManager.getState();
        const appState = {
            lastSearchedCity: state.lastSearchedCity,
            currentView: state.currentView,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('weather_app_state', JSON.stringify(appState));
        } catch (error) {
            console.warn('Failed to save app state:', error);
        }
    }
    
    // Toast notification system
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Show with animation
        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);
        
        // Auto-remove
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }
    
    // Public API methods
    search(cityName) {
        if (this.components.searchBar) {
            this.components.searchBar.setValue(cityName);
            return this.components.searchBar.handleSearch();
        }
    }
    
    getCurrentWeather() {
        return stateManager.getState().currentWeather;
    }
    
    getForecast() {
        return stateManager.getState().forecast;
    }
    
    switchView(view) {
        if (this.components.forecastDisplay) {
            this.components.forecastDisplay.switchView(view);
        }
    }
    
    // Cleanup method
    destroy() {
        // Clean up components
        Object.values(this.components).forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        
        // Clear intervals and timeouts
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Save final state
        this.saveAppState();
        
        console.log('Weather App destroyed');
    }
}

// Toast notification styles
const toastStyles = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-in-out;
        max-width: 300px;
        word-wrap: break-word;
    }
    
    .toast.visible {
        opacity: 1;
        transform: translateX(0);
    }
    
    .toast-info {
        background: #2196F3;
    }
    
    .toast-success {
        background: #4CAF50;
    }
    
    .toast-warning {
        background: #FF9800;
    }
    
    .toast-error {
        background: #f44336;
    }
    
    .app-error {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 2rem;
    }
    
    .app-error-content {
        background: rgba(255, 255, 255, 0.1);
        padding: 3rem;
        border-radius: 20px;
        backdrop-filter: blur(10px);
    }
    
    .app-error h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }
    
    .app-error p {
        font-size: 1.1rem;
        margin-bottom: 1rem;
        opacity: 0.9;
    }
    
    .error-details {
        font-family: monospace;
        background: rgba(0, 0, 0, 0.2);
        padding: 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
    }
    
    .refresh-prompt {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    }
    
    .refresh-prompt-content {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .refresh-prompt-content p {
        margin-bottom: 1.5rem;
        color: #333;
        font-size: 1.1rem;
    }
    
    .refresh-prompt-content button {
        margin: 0 0.5rem;
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .refresh-yes {
        background: #4CAF50;
        color: white;
    }
    
    .refresh-yes:hover {
        background: #45a049;
    }
    
    .refresh-no {
        background: #f0f0f0;
        color: #333;
    }
    
    .refresh-no:hover {
        background: #e0e0e0;
    }
`;

// Inject toast styles
const toastStyleSheet = document.createElement('style');
toastStyleSheet.textContent = toastStyles;
document.head.appendChild(toastStyleSheet);

// Initialize the app
const weatherApp = new WeatherApp();

// Make app globally available for debugging
window.weatherApp = weatherApp;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherApp;
} else {
    window.WeatherApp = WeatherApp;
}
