// ForecastDisplay Component
class ForecastDisplay {
    constructor() {
        this.elements = {
            currentBtn: document.getElementById('currentBtn'),
            forecastBtn: document.getElementById('forecastBtn'),
            forecastContainer: document.getElementById('forecastContainer'),
            forecastGrid: document.getElementById('forecastGrid'),
            weatherSection: document.getElementById('weatherSection')
        };
        
        this.currentForecastData = null;
        this.currentView = 'current';
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        
        // Subscribe to state changes
        stateManager.subscribe((state) => {
            this.handleStateChange(state);
        });
    }
    
    bindEvents() {
        // Toggle buttons
        this.elements.currentBtn.addEventListener('click', () => {
            this.switchView('current');
        });
        
        this.elements.forecastBtn.addEventListener('click', () => {
            this.switchView('forecast');
        });
    }
    
    handleStateChange(state) {
        // Update forecast data when available
        if (state.forecast && state.forecast !== this.currentForecastData) {
            this.currentForecastData = state.forecast;
            this.displayForecastData(state.forecast);
        }
        
        // Handle view changes
        if (state.currentView && state.currentView !== this.currentView) {
            this.currentView = state.currentView;
            this.updateViewDisplay();
        }
        
        // Show/hide forecast section based on data availability
        if (state.currentWeather || state.forecast) {
            this.showForecastToggle();
        } else {
            this.hideForecastToggle();
        }
    }
    
    switchView(view) {
        if (view === this.currentView) return;
        
        this.currentView = view;
        stateManager.setCurrentView(view);
        this.updateViewDisplay();
    }
    
    updateViewDisplay() {
        // Update toggle buttons
        this.elements.currentBtn.classList.toggle('active', this.currentView === 'current');
        this.elements.forecastBtn.classList.toggle('active', this.currentView === 'forecast');
        
        // Show/hide forecast container
        if (this.currentView === 'forecast') {
            this.showForecastContainer();
        } else {
            this.hideForecastContainer();
        }
        
        // Update current weather card visibility
        const currentWeatherCard = document.querySelector('.current-weather');
        if (currentWeatherCard) {
            currentWeatherCard.style.display = this.currentView === 'current' ? 'block' : 'none';
        }
    }
    
    displayForecastData(forecastData) {
        if (!forecastData || !forecastData.daily) {
            console.warn('Invalid forecast data');
            return;
        }
        
        try {
            // Clear existing forecast items
            this.elements.forecastGrid.innerHTML = '';
            
            // Create forecast items
            forecastData.daily.forEach((dayData, index) => {
                const forecastItem = this.createForecastItem(dayData, index);
                this.elements.forecastGrid.appendChild(forecastItem);
            });
            
            // Add staggered animation
            this.animateForecastItems();
            
        } catch (error) {
            console.error('Error displaying forecast data:', error);
            this.showForecastError('Failed to display forecast data');
        }
    }
    
    createForecastItem(dayData, index) {
        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.style.animationDelay = `${index * 0.1}s`;
        
        // Determine if this is today, tomorrow, etc.
        const dayLabel = this.getDayLabel(dayData.date, index);
        
        item.innerHTML = `
            <div class="forecast-day">${dayLabel}</div>
            <div class="forecast-date">${dayData.shortDate}</div>
            <img class="forecast-icon" 
                 src="${weatherService.getWeatherIconUrl(dayData.weather.icon)}" 
                 alt="${dayData.weather.description}">
            <div class="forecast-temps">
                <span class="forecast-high">${dayData.temperature.max}°</span>
                <span class="forecast-low">${dayData.temperature.min}°</span>
            </div>
            <div class="forecast-condition">${this.capitalizeWords(dayData.weather.description)}</div>
            <div class="forecast-humidity">
                <i class="fas fa-tint"></i>
                ${dayData.humidity}%
            </div>
        `;
        
        // Add click handler for detailed view
        item.addEventListener('click', () => {
            this.showDayDetails(dayData, index);
        });
        
        // Add hover effects
        item.addEventListener('mouseenter', () => {
            this.highlightForecastItem(item);
        });
        
        item.addEventListener('mouseleave', () => {
            this.unhighlightForecastItem(item);
        });
        
        return item;
    }
    
    getDayLabel(dateString, index) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        }
    }
    
    showDayDetails(dayData, index) {
        // Create modal or expanded view for day details
        const modal = this.createDayDetailsModal(dayData, index);
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeDayDetailsModal(modal);
            }
        });
    }
    
    createDayDetailsModal(dayData, index) {
        const modal = document.createElement('div');
        modal.className = 'forecast-modal';
        
        const dayLabel = this.getDayLabel(dayData.date, index);
        
        modal.innerHTML = `
            <div class="forecast-modal-content">
                <div class="forecast-modal-header">
                    <h3>${dayLabel}</h3>
                    <p>${dayData.date}</p>
                    <button class="forecast-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="forecast-modal-body">
                    <div class="forecast-modal-main">
                        <img class="forecast-modal-icon" 
                             src="${weatherService.getWeatherIconUrl(dayData.weather.icon, '@4x')}" 
                             alt="${dayData.weather.description}">
                        <div class="forecast-modal-temps">
                            <div class="forecast-modal-high">${dayData.temperature.max}°C</div>
                            <div class="forecast-modal-low">${dayData.temperature.min}°C</div>
                        </div>
                    </div>
                    
                    <div class="forecast-modal-condition">
                        ${this.capitalizeWords(dayData.weather.description)}
                    </div>
                    
                    <div class="forecast-modal-details">
                        <div class="forecast-modal-detail">
                            <i class="fas fa-tint"></i>
                            <span>Humidity: ${dayData.humidity}%</span>
                        </div>
                    </div>
                    
                    ${dayData.forecasts ? this.createHourlyForecast(dayData.forecasts) : ''}
                </div>
            </div>
        `;
        
        // Bind close button
        const closeBtn = modal.querySelector('.forecast-modal-close');
        closeBtn.addEventListener('click', () => {
            this.closeDayDetailsModal(modal);
        });
        
        return modal;
    }
    
    createHourlyForecast(hourlyData) {
        if (!hourlyData || hourlyData.length === 0) return '';
        
        const hourlyItems = hourlyData.slice(0, 8).map(hour => {
            const time = new Date(hour.datetime * 1000);
            const timeStr = time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
            
            return `
                <div class="hourly-item">
                    <div class="hourly-time">${timeStr}</div>
                    <img class="hourly-icon" 
                         src="${weatherService.getWeatherIconUrl(hour.weather.icon)}" 
                         alt="${hour.weather.description}">
                    <div class="hourly-temp">${hour.temperature.current}°</div>
                    <div class="hourly-humidity">${hour.humidity}%</div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="forecast-modal-hourly">
                <h4>Hourly Forecast</h4>
                <div class="hourly-grid">
                    ${hourlyItems}
                </div>
            </div>
        `;
    }
    
    closeDayDetailsModal(modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    animateForecastItems() {
        const items = this.elements.forecastGrid.querySelectorAll('.forecast-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    highlightForecastItem(item) {
        item.style.transform = 'translateY(-5px) scale(1.02)';
        item.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    }
    
    unhighlightForecastItem(item) {
        item.style.transform = 'translateY(0) scale(1)';
        item.style.boxShadow = '';
    }
    
    showForecastContainer() {
        this.elements.forecastContainer.style.display = 'block';
        this.elements.forecastContainer.classList.add('fade-in');
        
        setTimeout(() => {
            this.elements.forecastContainer.classList.remove('fade-in');
        }, 500);
    }
    
    hideForecastContainer() {
        this.elements.forecastContainer.style.display = 'none';
    }
    
    showForecastToggle() {
        const toggleElement = document.querySelector('.forecast-toggle');
        if (toggleElement) {
            toggleElement.style.display = 'flex';
        }
    }
    
    hideForecastToggle() {
        const toggleElement = document.querySelector('.forecast-toggle');
        if (toggleElement) {
            toggleElement.style.display = 'none';
        }
    }
    
    showForecastError(message) {
        this.elements.forecastGrid.innerHTML = `
            <div class="forecast-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
    
    // Utility methods
    capitalizeWords(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }
    
    formatTemperature(temp) {
        return Math.round(temp);
    }
    
    // Public methods
    refresh() {
        if (this.currentForecastData) {
            this.displayForecastData(this.currentForecastData);
        }
    }
    
    clear() {
        this.currentForecastData = null;
        this.elements.forecastGrid.innerHTML = '';
        this.hideForecastContainer();
        this.hideForecastToggle();
    }
    
    getCurrentView() {
        return this.currentView;
    }
    
    // Enhanced features
    enableComparisonMode() {
        // Allow comparing multiple days
        this.comparisonMode = true;
        this.selectedDays = [];
    }
    
    disableComparisonMode() {
        this.comparisonMode = false;
        this.selectedDays = [];
    }
    
    exportForecastData() {
        if (!this.currentForecastData) return null;
        
        return {
            city: this.currentForecastData.city,
            forecast: this.currentForecastData.daily,
            exportedAt: new Date().toISOString()
        };
    }
}

// Add CSS for forecast display enhancements
const forecastDisplayStyles = `
    .forecast-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    }
    
    .forecast-modal.visible {
        opacity: 1;
    }
    
    .forecast-modal-content {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        transform: translateY(20px);
        transition: transform 0.3s ease-out;
    }
    
    .forecast-modal.visible .forecast-modal-content {
        transform: translateY(0);
    }
    
    .forecast-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f0f0f0;
    }
    
    .forecast-modal-header h3 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #333;
        margin: 0;
    }
    
    .forecast-modal-header p {
        color: #666;
        margin: 0.25rem 0 0 0;
        font-size: 0.9rem;
    }
    
    .forecast-modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #666;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .forecast-modal-close:hover {
        background: #f0f0f0;
        color: #333;
    }
    
    .forecast-modal-main {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2rem;
        gap: 2rem;
    }
    
    .forecast-modal-icon {
        width: 100px;
        height: 100px;
    }
    
    .forecast-modal-temps {
        text-align: center;
    }
    
    .forecast-modal-high {
        font-size: 3rem;
        font-weight: 700;
        color: #333;
        line-height: 1;
    }
    
    .forecast-modal-low {
        font-size: 1.5rem;
        color: #666;
        margin-top: 0.5rem;
    }
    
    .forecast-modal-condition {
        text-align: center;
        font-size: 1.2rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 2rem;
        text-transform: capitalize;
    }
    
    .forecast-modal-details {
        display: grid;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .forecast-modal-detail {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 10px;
    }
    
    .forecast-modal-detail i {
        color: #667eea;
        font-size: 1.2rem;
        width: 20px;
        text-align: center;
    }
    
    .forecast-modal-hourly {
        border-top: 2px solid #f0f0f0;
        padding-top: 2rem;
    }
    
    .forecast-modal-hourly h4 {
        font-size: 1.2rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 1rem;
        text-align: center;
    }
    
    .hourly-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 1rem;
    }
    
    .hourly-item {
        text-align: center;
        padding: 1rem 0.5rem;
        background: rgba(102, 126, 234, 0.05);
        border-radius: 10px;
        transition: all 0.3s ease;
    }
    
    .hourly-item:hover {
        background: rgba(102, 126, 234, 0.1);
        transform: translateY(-2px);
    }
    
    .hourly-time {
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    
    .hourly-icon {
        width: 40px;
        height: 40px;
        margin-bottom: 0.5rem;
    }
    
    .hourly-temp {
        font-size: 1rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.25rem;
    }
    
    .hourly-humidity {
        font-size: 0.75rem;
        color: #888;
    }
    
    .forecast-error {
        grid-column: 1 / -1;
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    
    .forecast-error i {
        font-size: 2rem;
        color: #f44336;
        margin-bottom: 1rem;
    }
    
    .forecast-error p {
        font-size: 1rem;
        margin: 0;
    }
    
    /* Mobile responsiveness for modal */
    @media (max-width: 768px) {
        .forecast-modal-content {
            padding: 1.5rem;
            margin: 1rem;
        }
        
        .forecast-modal-main {
            flex-direction: column;
            gap: 1rem;
        }
        
        .forecast-modal-icon {
            width: 80px;
            height: 80px;
        }
        
        .forecast-modal-high {
            font-size: 2.5rem;
        }
        
        .hourly-grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }
`;

// Inject styles
const forecastStyleSheet = document.createElement('style');
forecastStyleSheet.textContent = forecastDisplayStyles;
document.head.appendChild(forecastStyleSheet);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForecastDisplay;
} else {
    window.ForecastDisplay = ForecastDisplay;
}
