// WeatherDisplay Component
class WeatherDisplay {
    constructor() {
        this.elements = {
            weatherSection: document.getElementById('weatherSection'),
            cityName: document.getElementById('cityName'),
            countryName: document.getElementById('countryName'),
            dateTime: document.getElementById('dateTime'),
            weatherIcon: document.getElementById('weatherIcon'),
            temperature: document.getElementById('temperature'),
            weatherCondition: document.getElementById('weatherCondition'),
            feelsLike: document.getElementById('feelsLike'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            visibility: document.getElementById('visibility'),
            pressure: document.getElementById('pressure')
        };
        
        this.currentWeatherData = null;
        this.updateInterval = null;
        
        this.init();
    }
    
    init() {
        // Subscribe to state changes
        stateManager.subscribe((state) => {
            this.handleStateChange(state);
        });
        
        // Start time update interval
        this.startTimeUpdates();
    }
    
    handleStateChange(state) {
        if (state.currentWeather && state.currentWeather !== this.currentWeatherData) {
            this.currentWeatherData = state.currentWeather;
            this.displayWeatherData(state.currentWeather);
            this.showWeatherSection();
        } else if (!state.currentWeather && !state.loading) {
            this.hideWeatherSection();
        }
    }
    
    displayWeatherData(weatherData) {
        try {
            // Location information
            this.elements.cityName.textContent = weatherData.name;
            this.elements.countryName.textContent = this.getCountryName(weatherData.country);
            
            // Weather icon
            const iconUrl = weatherService.getWeatherIconUrl(weatherData.weather.icon);
            this.elements.weatherIcon.src = iconUrl;
            this.elements.weatherIcon.alt = weatherData.weather.description;
            
            // Temperature
            this.elements.temperature.textContent = weatherData.temperature.current;
            this.elements.feelsLike.textContent = weatherData.temperature.feelsLike;
            
            // Weather condition
            this.elements.weatherCondition.textContent = this.capitalizeWords(weatherData.weather.description);
            
            // Weather details
            this.elements.humidity.textContent = `${weatherData.humidity}%`;
            this.elements.windSpeed.textContent = this.formatWindSpeed(weatherData.wind.speed);
            this.elements.visibility.textContent = this.formatVisibility(weatherData.visibility);
            this.elements.pressure.textContent = `${weatherData.pressure} hPa`;
            
            // Update date/time
            this.updateDateTime(weatherData.timezone);
            
            // Add animation classes
            this.animateWeatherCard();
            
            // Update document title
            document.title = `${weatherData.temperature.current}°C - ${weatherData.name} | Weather App`;
            
        } catch (error) {
            console.error('Error displaying weather data:', error);
            stateManager.setError('Failed to display weather data');
        }
    }
    
    showWeatherSection() {
        this.elements.weatherSection.style.display = 'block';
        this.elements.weatherSection.classList.add('fade-in', 'slide-up');
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            this.elements.weatherSection.classList.remove('fade-in', 'slide-up');
        }, 600);
    }
    
    hideWeatherSection() {
        this.elements.weatherSection.style.display = 'none';
        this.elements.weatherSection.classList.remove('fade-in', 'slide-up');
    }
    
    animateWeatherCard() {
        const weatherCard = this.elements.weatherSection.querySelector('.weather-card');
        if (weatherCard) {
            weatherCard.classList.add('fade-in');
            setTimeout(() => {
                weatherCard.classList.remove('fade-in');
            }, 500);
        }
    }
    
    updateDateTime(timezone = 0) {
        const now = new Date();
        const localTime = new Date(now.getTime() + (timezone * 1000));
        
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        };
        
        this.elements.dateTime.textContent = localTime.toLocaleDateString('en-US', options);
    }
    
    startTimeUpdates() {
        // Update time every minute
        this.updateInterval = setInterval(() => {
            if (this.currentWeatherData && this.currentWeatherData.timezone) {
                this.updateDateTime(this.currentWeatherData.timezone);
            }
        }, 60000);
    }
    
    stopTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // Utility methods
    getCountryName(countryCode) {
        const countries = {
            'US': 'United States',
            'GB': 'United Kingdom',
            'CA': 'Canada',
            'AU': 'Australia',
            'DE': 'Germany',
            'FR': 'France',
            'IT': 'Italy',
            'ES': 'Spain',
            'JP': 'Japan',
            'CN': 'China',
            'IN': 'India',
            'BR': 'Brazil',
            'RU': 'Russia',
            'MX': 'Mexico',
            'AR': 'Argentina',
            'ZA': 'South Africa',
            'EG': 'Egypt',
            'NG': 'Nigeria',
            'KE': 'Kenya',
            'MA': 'Morocco',
            'TH': 'Thailand',
            'VN': 'Vietnam',
            'ID': 'Indonesia',
            'MY': 'Malaysia',
            'SG': 'Singapore',
            'PH': 'Philippines',
            'KR': 'South Korea',
            'TW': 'Taiwan',
            'HK': 'Hong Kong',
            'NZ': 'New Zealand',
            'CH': 'Switzerland',
            'AT': 'Austria',
            'BE': 'Belgium',
            'NL': 'Netherlands',
            'SE': 'Sweden',
            'NO': 'Norway',
            'DK': 'Denmark',
            'FI': 'Finland',
            'PL': 'Poland',
            'CZ': 'Czech Republic',
            'HU': 'Hungary',
            'GR': 'Greece',
            'TR': 'Turkey',
            'IL': 'Israel',
            'AE': 'United Arab Emirates',
            'SA': 'Saudi Arabia',
            'QA': 'Qatar',
            'KW': 'Kuwait',
            'BH': 'Bahrain',
            'OM': 'Oman',
            'JO': 'Jordan',
            'LB': 'Lebanon',
            'SY': 'Syria',
            'IQ': 'Iraq',
            'IR': 'Iran',
            'AF': 'Afghanistan',
            'PK': 'Pakistan',
            'BD': 'Bangladesh',
            'LK': 'Sri Lanka',
            'NP': 'Nepal',
            'BT': 'Bhutan',
            'MM': 'Myanmar',
            'LA': 'Laos',
            'KH': 'Cambodia',
            'MN': 'Mongolia',
            'KZ': 'Kazakhstan',
            'UZ': 'Uzbekistan',
            'TM': 'Turkmenistan',
            'KG': 'Kyrgyzstan',
            'TJ': 'Tajikistan'
        };
        
        return countries[countryCode] || countryCode;
    }
    
    capitalizeWords(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }
    
    formatWindSpeed(speed) {
        if (!speed) return '0 m/s';
        
        const speedMs = Math.round(speed * 10) / 10;
        const speedKmh = Math.round(speed * 3.6);
        
        return `${speedMs} m/s (${speedKmh} km/h)`;
    }
    
    formatVisibility(visibilityKm) {
        if (!visibilityKm) return 'N/A';
        
        if (visibilityKm >= 10) {
            return `${Math.round(visibilityKm)} km`;
        } else {
            return `${visibilityKm.toFixed(1)} km`;
        }
    }
    
    formatPressure(pressure) {
        if (!pressure) return 'N/A';
        return `${pressure} hPa`;
    }
    
    getWindDirection(degrees) {
        if (degrees === undefined || degrees === null) return '';
        
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                          'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }
    
    getTemperatureColor(temp) {
        if (temp <= 0) return '#1e88e5';      // Blue for freezing
        if (temp <= 10) return '#42a5f5';     // Light blue for cold
        if (temp <= 20) return '#66bb6a';     // Green for mild
        if (temp <= 30) return '#ffeb3b';     // Yellow for warm
        if (temp <= 35) return '#ff9800';     // Orange for hot
        return '#f44336';                     // Red for very hot
    }
    
    // Public methods
    refresh() {
        if (this.currentWeatherData) {
            this.displayWeatherData(this.currentWeatherData);
        }
    }
    
    clear() {
        this.currentWeatherData = null;
        this.hideWeatherSection();
        document.title = 'Weather App 🌤️';
    }
    
    // Enhanced display methods
    displayTemperatureWithColor() {
        if (this.currentWeatherData) {
            const temp = this.currentWeatherData.temperature.current;
            const color = this.getTemperatureColor(temp);
            this.elements.temperature.style.color = color;
        }
    }
    
    displayWindWithDirection() {
        if (this.currentWeatherData && this.currentWeatherData.wind) {
            const speed = this.formatWindSpeed(this.currentWeatherData.wind.speed);
            const direction = this.getWindDirection(this.currentWeatherData.wind.direction);
            this.elements.windSpeed.textContent = `${speed} ${direction}`;
        }
    }
    
    // Animation helpers
    pulseElement(element) {
        element.classList.add('pulse');
        setTimeout(() => {
            element.classList.remove('pulse');
        }, 1000);
    }
    
    highlightUpdate(element) {
        element.classList.add('highlight-update');
        setTimeout(() => {
            element.classList.remove('highlight-update');
        }, 2000);
    }
    
    // Cleanup method
    destroy() {
        this.stopTimeUpdates();
        this.currentWeatherData = null;
    }
}

// Add CSS for weather display enhancements
const weatherDisplayStyles = `
    .weather-card .pulse {
        animation: pulse 1s ease-in-out;
    }
    
    .highlight-update {
        background-color: rgba(255, 235, 59, 0.3);
        transition: background-color 2s ease-out;
    }
    
    .temperature-color-transition {
        transition: color 0.5s ease-in-out;
    }
    
    .weather-icon {
        transition: transform 0.3s ease-in-out;
    }
    
    .weather-icon:hover {
        transform: scale(1.1) rotate(5deg);
    }
    
    .detail-item {
        transition: all 0.3s ease-in-out;
    }
    
    .detail-item:hover .detail-value {
        font-weight: 700;
        color: #667eea;
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    .weather-card.updating {
        opacity: 0.8;
        transition: opacity 0.3s ease-in-out;
    }
    
    .weather-details .detail-item.loading {
        opacity: 0.6;
        pointer-events: none;
    }
    
    .weather-details .detail-item.loading .detail-value::after {
        content: '...';
        animation: dots 1.5s infinite;
    }
    
    @keyframes dots {
        0%, 20% { content: ''; }
        40% { content: '.'; }
        60% { content: '..'; }
        80%, 100% { content: '...'; }
    }
`;

// Inject styles
const weatherStyleSheet = document.createElement('style');
weatherStyleSheet.textContent = weatherDisplayStyles;
document.head.appendChild(weatherStyleSheet);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherDisplay;
} else {
    window.WeatherDisplay = WeatherDisplay;
}
