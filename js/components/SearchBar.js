// SearchBar Component
class SearchBar {
    constructor() {
        this.elements = {
            input: document.getElementById('cityInput'),
            searchBtn: document.getElementById('searchBtn'),
            lastSearched: document.getElementById('lastSearched'),
            lastSearchedBtn: document.getElementById('lastSearchedBtn')
        };
        
        this.isSearching = false;
        this.searchHistory = this.loadSearchHistory();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateLastSearchedDisplay();
        
        // Subscribe to state changes
        stateManager.subscribe((state) => {
            this.handleStateChange(state);
        });
        
        // Focus on input when page loads
        setTimeout(() => {
            this.elements.input.focus();
        }, 100);
    }
    
    bindEvents() {
        // Search button click
        this.elements.searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSearch();
        });
        
        // Enter key press in input
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch();
            }
        });
        
        // Input changes
        this.elements.input.addEventListener('input', (e) => {
            this.handleInputChange(e.target.value);
        });
        
        // Last searched city click
        if (this.elements.lastSearchedBtn) {
            this.elements.lastSearchedBtn.addEventListener('click', () => {
                this.searchLastCity();
            });
        }
        
        // Clear input on focus if it contains placeholder-like text
        this.elements.input.addEventListener('focus', () => {
            this.elements.input.select();
        });
        
        // Handle paste events
        this.elements.input.addEventListener('paste', (e) => {
            setTimeout(() => {
                this.handleInputChange(e.target.value);
            }, 0);
        });
    }
    
    async handleSearch() {
        const cityName = this.elements.input.value.trim();
        
        if (!cityName) {
            this.showInputError('Please enter a city name');
            return;
        }
        
        if (this.isSearching) {
            return; // Prevent multiple simultaneous searches
        }
        
        try {
            this.isSearching = true;
            this.clearInputError();
            
            // Set loading state
            stateManager.setLoading(true, `Searching for ${cityName}...`);
            
            // Perform search
            const weatherData = await weatherService.getWeatherData(cityName);
            
            // Update state with results
            stateManager.setWeatherData(weatherData.currentWeather, weatherData.forecast);
            
            // Save to search history and localStorage
            this.addToSearchHistory(cityName);
            stateManager.setLastSearchedCity(cityName);
            
            // Clear input and update display
            this.elements.input.value = '';
            this.updateLastSearchedDisplay();
            
            // Show success feedback
            this.showSearchSuccess(weatherData.currentWeather.name);
            
        } catch (error) {
            console.error('Search error:', error);
            stateManager.setError(error.message);
            this.showInputError(error.message);
        } finally {
            this.isSearching = false;
        }
    }
    
    handleInputChange(value) {
        // Clear any previous error states
        if (value.trim()) {
            this.clearInputError();
        }
        
        // Enable/disable search button based on input
        this.elements.searchBtn.disabled = !value.trim();
        
        // Add visual feedback for valid input
        if (value.trim().length >= 2) {
            this.elements.input.classList.add('valid-input');
        } else {
            this.elements.input.classList.remove('valid-input');
        }
    }
    
    async searchLastCity() {
        const lastCity = stateManager.getState().lastSearchedCity;
        if (lastCity) {
            this.elements.input.value = lastCity;
            await this.handleSearch();
        }
    }
    
    handleStateChange(state) {
        // Update UI based on loading state
        if (state.loading) {
            this.setLoadingState(true);
        } else {
            this.setLoadingState(false);
        }
        
        // Update last searched display
        if (state.lastSearchedCity !== this.currentLastSearched) {
            this.currentLastSearched = state.lastSearchedCity;
            this.updateLastSearchedDisplay();
        }
    }
    
    setLoadingState(loading) {
        this.elements.searchBtn.disabled = loading;
        this.elements.input.disabled = loading;
        
        if (loading) {
            this.elements.searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.elements.input.classList.add('loading');
        } else {
            this.elements.searchBtn.innerHTML = '<i class="fas fa-search"></i>';
            this.elements.input.classList.remove('loading');
        }
    }
    
    updateLastSearchedDisplay() {
        const lastCity = stateManager.getState().lastSearchedCity;
        
        if (lastCity && this.elements.lastSearched && this.elements.lastSearchedBtn) {
            this.elements.lastSearchedBtn.textContent = lastCity;
            this.elements.lastSearched.style.display = 'block';
            this.elements.lastSearched.classList.add('fade-in');
        } else if (this.elements.lastSearched) {
            this.elements.lastSearched.style.display = 'none';
        }
    }
    
    showInputError(message) {
        this.elements.input.classList.add('error');
        this.elements.input.setAttribute('data-error', message);
        
        // Create or update error tooltip
        this.showErrorTooltip(message);
        
        // Auto-clear error after 5 seconds
        setTimeout(() => {
            this.clearInputError();
        }, 5000);
    }
    
    clearInputError() {
        this.elements.input.classList.remove('error');
        this.elements.input.removeAttribute('data-error');
        this.hideErrorTooltip();
    }
    
    showErrorTooltip(message) {
        // Remove existing tooltip
        this.hideErrorTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'search-error-tooltip';
        tooltip.textContent = message;
        
        // Position tooltip
        const inputRect = this.elements.input.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.top = `${inputRect.bottom + 5}px`;
        tooltip.style.left = `${inputRect.left}px`;
        tooltip.style.zIndex = '1000';
        
        document.body.appendChild(tooltip);
        this.currentTooltip = tooltip;
        
        // Animate in
        setTimeout(() => {
            tooltip.classList.add('visible');
        }, 10);
    }
    
    hideErrorTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }
    
    showSearchSuccess(cityName) {
        // Brief success feedback
        this.elements.input.classList.add('success');
        setTimeout(() => {
            this.elements.input.classList.remove('success');
        }, 1000);
        
        // Optional: Show toast notification
        if (window.showToast) {
            window.showToast(`Weather data loaded for ${cityName}`, 'success');
        }
    }
    
    // Search history management
    addToSearchHistory(cityName) {
        if (!cityName) return;
        
        const normalizedCity = cityName.trim().toLowerCase();
        
        // Remove if already exists (to move to front)
        this.searchHistory = this.searchHistory.filter(city => 
            city.toLowerCase() !== normalizedCity
        );
        
        // Add to front
        this.searchHistory.unshift(cityName.trim());
        
        // Keep only last 10 searches
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // Save to localStorage
        this.saveSearchHistory();
    }
    
    loadSearchHistory() {
        try {
            const history = localStorage.getItem('weather_search_history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.warn('Failed to load search history:', error);
            return [];
        }
    }
    
    saveSearchHistory() {
        try {
            localStorage.setItem('weather_search_history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('Failed to save search history:', error);
        }
    }
    
    getSearchHistory() {
        return [...this.searchHistory];
    }
    
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }
    
    // Public methods for external control
    setValue(value) {
        this.elements.input.value = value;
        this.handleInputChange(value);
    }
    
    getValue() {
        return this.elements.input.value.trim();
    }
    
    focus() {
        this.elements.input.focus();
    }
    
    clear() {
        this.elements.input.value = '';
        this.handleInputChange('');
        this.clearInputError();
    }
    
    disable() {
        this.elements.input.disabled = true;
        this.elements.searchBtn.disabled = true;
    }
    
    enable() {
        this.elements.input.disabled = false;
        this.elements.searchBtn.disabled = false;
    }
}

// Add CSS for search component enhancements
const searchBarStyles = `
    .city-input.valid-input {
        border-left: 3px solid #4CAF50;
    }
    
    .city-input.error {
        border-left: 3px solid #f44336;
        animation: shake 0.5s ease-in-out;
    }
    
    .city-input.success {
        border-left: 3px solid #4CAF50;
        animation: pulse 0.5s ease-in-out;
    }
    
    .city-input.loading {
        opacity: 0.7;
    }
    
    .search-error-tooltip {
        background: #f44336;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.85rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateY(-5px);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    }
    
    .search-error-tooltip.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .search-error-tooltip::before {
        content: '';
        position: absolute;
        top: -5px;
        left: 20px;
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 5px solid #f44336;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = searchBarStyles;
document.head.appendChild(styleSheet);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchBar;
} else {
    window.SearchBar = SearchBar;
}
