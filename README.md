# 🌦️ Weather App

A clean and modern **single-page weather application** built with **vanilla JavaScript**, featuring real-time weather data, a 5-day forecast, and a responsive design.


[🌍 Live Demo](weather-app-one-gilt.vercel.app)

---

## 📽️ Video 

👉 [Watch on video](https://youtu.be/jE8e1orhch0?si=33q4deMQdYSGUh73)

---

## 📋 Overview

This app demonstrates modern web development practices without frameworks. It allows users to search any city worldwide and view **current weather conditions** and an **extended 5-day forecast**.

---

## ✅ Features

### Core

* 🔍 **City Search** — Find weather by city name
* 🌡️ **Current Weather** — Temperature, conditions, humidity, wind, pressure
* ⏳ **Loading States** — Smooth animations while fetching
* ❌ **Error Handling** — Clear messages when city not found or API fails
* 📱 **Responsive UI** — Works on desktop, tablet, and mobile

### Bonus

* 💾 **LocalStorage** — Remembers the last searched city
* 📅 **5-Day Forecast** — Extended daily forecasts with details
* 🎨 **Modern UX** — Animations, hover effects, polished design
* 🧩 **State Management** — Centralized reactive state system
* 🔧 **Debug Tools** — API test page with logs

---

## 🛠️ Tech Stack

* **Language**: JavaScript (ES6+), HTML5, CSS3
* **Styling**: CSS Grid, Flexbox, CSS Variables
* **API**: [OpenWeatherMap](https://openweathermap.org/api)
* **Storage**: LocalStorage for persistence
* **Architecture**: Component-based with separation of concerns

---

## 📂 Project Structure

```
weather-app/
├── index.html
├── test.html                # Debugging page
├── css/
│   └── styles.css
├── js/
│   ├── config.js            # API key & settings
│   ├── app.js               # Main controller
│   ├── utils/
│   │   └── StateManager.js
│   ├── services/
│   │   └── WeatherService.js
│   └── components/
│       ├── SearchBar.js
│       ├── WeatherDisplay.js
│       └── ForecastDisplay.js
├── package.json
└── README.md
```

---

## ⚡ Quick Start

```bash
# Clone repo
git clone https://github.com/your-username/weather-app.git
cd weather-app

# Start local server (Python)
python -m http.server 8080

# Or using Node.js
npm install -g live-server
live-server --port=8080
```

Then open 👉 **[http://localhost:3000]**

---

## 🔑 API Setup

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api).
2. Open `js/config.js` and replace:

```js
API_KEY: 'your-api-key-here'
```

---

## 🧪 Testing

### Manual Testing

* Search valid and invalid cities
* Check error messages
* Verify 5-day forecast
* Resize window for responsive layout
* Refresh to confirm last city is saved

### Debug Tools

Visit `http://localhost:3000/test.html` to:

* Validate API key
* Simulate errors
* Inspect logs

---

## 🎨 Design & Assumptions

* **Architecture**: Component-based, centralized state, dedicated API service
* **UI/UX**: Gradient backgrounds, glassmorphism, smooth loaders
* **Performance**: Client-side caching, debounced requests, minimal DOM updates
* **Assumptions**:

  * ES6+ modern browsers
  * Free tier API limits apply
  * 10-minute cache validity

---

## 📈 Future Enhancements

* Geolocation-based weather
* Push notifications & alerts
* Weather maps integration
* Historical data
* PWA offline support

---

## 📄 License

MIT License — free to use for learning and development.

