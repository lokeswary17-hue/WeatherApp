/**
 * Weather App - script.js
 * Powered by Open-Meteo APIs (No API key required)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const searchForm = document.getElementById('search-form');
  const cityInput = document.getElementById('city-input');
  const clearBtn = document.getElementById('clear-btn');
  const searchBtn = document.getElementById('search-btn');

  const loadingPanel = document.getElementById('loading');
  const errorPanel = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  const weatherContent = document.getElementById('weather-content');

  const cityNameEl = document.getElementById('city-name');
  const currentDateEl = document.getElementById('current-date');
  const weatherEmojiEl = document.getElementById('weather-emoji');
  const currentTempEl = document.getElementById('current-temp');
  const weatherDescEl = document.getElementById('weather-desc');
  const humidityEl = document.getElementById('humidity');
  const windSpeedEl = document.getElementById('wind-speed');
  const forecastContainer = document.getElementById('forecast-container');

  const STORAGE_KEY = 'weather_app_last_city';
  const DEFAULT_CITY = 'London';

  // --- Weather Interpretation Codes (WMO) ---
  const WEATHER_CODES = {
    0: { desc: 'Clear sky', emoji: '☀️' },
    1: { desc: 'Mainly clear', emoji: '🌤️' },
    2: { desc: 'Partly cloudy', emoji: '⛅' },
    3: { desc: 'Overcast', emoji: '☁️' },
    45: { desc: 'Foggy', emoji: '🌫️' },
    48: { desc: 'Rime fog', emoji: '🌫️' },
    51: { desc: 'Light drizzle', emoji: '🌦️' },
    53: { desc: 'Moderate drizzle', emoji: '🌦️' },
    55: { desc: 'Dense drizzle', emoji: '🌧️' },
    56: { desc: 'Freezing drizzle', emoji: '🌨️' },
    57: { desc: 'Dense freezing drizzle', emoji: '🌨️' },
    61: { desc: 'Slight rain', emoji: '🌧️' },
    63: { desc: 'Moderate rain', emoji: '🌧️' },
    65: { desc: 'Heavy rain', emoji: '🌧️' },
    66: { desc: 'Freezing rain', emoji: '🌨️' },
    67: { desc: 'Heavy freezing rain', emoji: '🌨️' },
    71: { desc: 'Slight snow fall', emoji: '❄️' },
    73: { desc: 'Moderate snow fall', emoji: '❄️' },
    75: { desc: 'Heavy snow fall', emoji: '❄️' },
    77: { desc: 'Snow grains', emoji: '❄️' },
    80: { desc: 'Slight showers', emoji: '🌦️' },
    81: { desc: 'Moderate showers', emoji: '🌧️' },
    82: { desc: 'Violent showers', emoji: '⛈️' },
    85: { desc: 'Snow showers', emoji: '🌨️' },
    86: { desc: 'Heavy snow showers', emoji: '🌨️' },
    95: { desc: 'Thunderstorm', emoji: '⛈️' },
    96: { desc: 'Thunderstorm with hail', emoji: '⛈️' },
    99: { desc: 'Heavy hail thunderstorm', emoji: '⛈️' }
  };

  /**
   * Helper to retrieve weather description and emoji from a WMO code
   */
  function getWeatherInfo(code) {
    return WEATHER_CODES[code] || { desc: 'Partly cloudy', emoji: '⛅' };
  }

  /**
   * Helper to parse ISO date string (YYYY-MM-DD) into a localized Date
   */
  function parseDateString(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dateStr);
  }

  // --- UI State Handlers ---

  function showLoading() {
    loadingPanel.classList.remove('hidden');
    errorPanel.classList.add('hidden');
    weatherContent.classList.add('hidden');
    searchBtn.disabled = true;
  }

  function showError(message) {
    loadingPanel.classList.add('hidden');
    errorPanel.classList.remove('hidden');
    weatherContent.classList.add('hidden');
    errorText.textContent = message;
    searchBtn.disabled = false;
  }

  function showWeather() {
    loadingPanel.classList.add('hidden');
    errorPanel.classList.add('hidden');
    weatherContent.classList.remove('hidden');
    searchBtn.disabled = false;
  }

  /**
   * Render Current Weather and 5-Day Forecast into the DOM
   */
  function renderWeatherData(locationName, forecastData) {
    const current = forecastData.current;
    const daily = forecastData.daily;

    // 1. Current Weather
    cityNameEl.textContent = locationName;

    // Format current date: e.g. Thursday, Oct 22
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });

    const currentWeather = getWeatherInfo(current.weather_code);
    weatherEmojiEl.textContent = currentWeather.emoji;
    weatherEmojiEl.setAttribute('aria-label', currentWeather.desc);
    currentTempEl.textContent = Math.round(current.temperature_2m);
    weatherDescEl.textContent = currentWeather.desc;

    humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
    windSpeedEl.textContent = `${current.wind_speed_10m} km/h`;

    // 2. 5-Day Forecast
    forecastContainer.innerHTML = '';
    const daysToShow = Math.min(5, daily.time.length);

    for (let i = 0; i < daysToShow; i++) {
      const dateStr = daily.time[i];
      const maxTemp = Math.round(daily.temperature_2m_max[i]);
      const minTemp = Math.round(daily.temperature_2m_min[i]);
      const code = daily.weather_code[i];
      const dayWeather = getWeatherInfo(code);

      // Determine day title ("Today" for index 0, or short weekday)
      let dayTitle = 'Today';
      if (i > 0) {
        const dateObj = parseDateString(dateStr);
        dayTitle = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      }

      const card = document.createElement('div');
      card.className = 'forecast-card';
      card.innerHTML = `
        <span class="forecast-day">${dayTitle}</span>
        <span class="forecast-emoji" title="${dayWeather.desc}" aria-label="${dayWeather.desc}">${dayWeather.emoji}</span>
        <div class="forecast-temps">
          <span class="temp-max">${maxTemp}°</span>
          <span class="temp-min">${minTemp}°</span>
        </div>
      `;

      forecastContainer.appendChild(card);
    }

    showWeather();
  }

  /**
   * Fetch weather data for a given city name
   */
  async function fetchWeather(city) {
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      showError('Please enter a city name to search.');
      return;
    }

    showLoading();

    try {
      // Step 1: Geocoding API lookup
      const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedCity)}&count=1`;
      const geoResponse = await fetch(geocodingUrl);

      if (!geoResponse.ok) {
        throw new Error('Unable to connect to location service. Please check your internet connection.');
      }

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`City "${trimmedCity}" not found. Please verify the spelling and try again.`);
      }

      const result = geoData.results[0];
      const { name, country, latitude, longitude } = result;
      const displayName = country ? `${name}, ${country}` : name;

      // Step 2: Open-Meteo Forecast API lookup
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
      const forecastResponse = await fetch(forecastUrl);

      if (!forecastResponse.ok) {
        throw new Error('Unable to fetch forecast data. Please try again later.');
      }

      const forecastData = await forecastResponse.json();

      // Step 3: Render and save to localStorage
      renderWeatherData(displayName, forecastData);
      localStorage.setItem(STORAGE_KEY, displayName);

    } catch (err) {
      console.error('Weather App Error:', err);
      showError(err.message || 'Something went wrong while fetching weather data.');
    }
  }

  // --- Event Listeners ---

  // Search submission (click or Enter key)
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = cityInput.value;
    if (query) {
      fetchWeather(query);
    } else {
      showError('Please enter a city name.');
    }
  });

  // Clear button toggle & action
  cityInput.addEventListener('input', () => {
    if (cityInput.value.length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  });

  clearBtn.addEventListener('click', () => {
    cityInput.value = '';
    clearBtn.classList.add('hidden');
    cityInput.focus();
  });

  // --- Initial Application Load ---
  const savedCity = localStorage.getItem(STORAGE_KEY);
  const initialCity = savedCity || DEFAULT_CITY;
  cityInput.value = initialCity;
  clearBtn.classList.remove('hidden');
  fetchWeather(initialCity);
});
