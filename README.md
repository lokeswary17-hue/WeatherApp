# 🌤️ Modern Weather Web App

A clean, responsive, and modern weather forecast web application built with pure HTML5, modern CSS3, and vanilla JavaScript. Powered by the open and free [Open-Meteo APIs](https://open-meteo.com/), it requires **no API keys** and works right out of the box.

---

## ✨ Features

- **Instant Search:** Search any city worldwide by name with instant geocoding. Supports clicking the **Search** button or pressing the <kbd>Enter</kbd> key.
- **Real-Time Weather Metrics:**
  - City name and country identification
  - Current date and day
  - Current temperature in **°C**
  - Weather condition emoji and descriptive status (e.g. ☀️ Clear Sky, 🌧️ Rain, ⛈️ Thunderstorm)
  - Relative humidity percentage (%)
  - Wind speed (km/h)
- **5-Day Forecast:** Displays daily high and low temperatures along with corresponding weather condition emojis.
- **Smart Persistence:** Remembers the last searched city in `localStorage` and automatically loads its weather whenever you reopen or refresh the page.
- **Error Handling & Loading States:**
  - Elegant loading spinner while fetching data.
  - Friendly error messages for invalid or unrecognised cities and connection failures.
- **Clean Modern Design:**
  - Glassmorphic centered card with backdrop blur.
  - Smooth gradient background.
  - Responsive layout optimized for mobile, tablet, and desktop screens.
  - Quick-clear button for the search input.
- **Zero Dependencies:** Pure vanilla HTML, CSS, and JavaScript. No external libraries, build tools, or API keys required.

---

## 📁 File Structure

```text
weather/
├── index.html     # Semantic HTML5 markup and structure
├── style.css      # Modern CSS3 styling (glassmorphism, flexbox/grid, animations)
├── script.js      # Vanilla JavaScript logic for APIs, state, and localStorage
└── README.md      # Project documentation
```

---

## 🌐 APIs Used

This application uses Open-Meteo's free, public APIs without any API key:

1. **Geocoding API:**
   Converts the searched city name into geographic coordinates (latitude and longitude).
   ```text
   https://geocoding-api.open-meteo.com/v1/search?name={CITY}&count=1
   ```

2. **Forecast API:**
   Fetches current conditions (temperature, humidity, wind speed, weather code) and daily 5-day forecast (max/min temperatures, weather code).
   ```text
   https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto
   ```

3. **WMO Weather Interpretation Codes:**
   Maps numeric WMO weather condition codes (0–99) to human-readable weather descriptions and matching weather emojis.

---

## 🚀 How to Run Locally

You can run this project locally without any installation or build steps.

### Method 1: Direct File Open
Simply double-click `index.html` in your file explorer, or right-click `index.html` and select **Open with** > **Google Chrome / Microsoft Edge / Firefox**.

### Method 2: Local HTTP Server (Optional)
If you have Python or Node installed, you can start a local development server:

**Using Python:**
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

**Using Node.js (`npx serve`):**
```bash
npx serve .
```

---

## 📱 Browser Compatibility

- Google Chrome (latest)
- Mozilla Firefox (latest)
- Apple Safari (latest)
- Microsoft Edge (latest)
- Mobile browsers on iOS and Android
