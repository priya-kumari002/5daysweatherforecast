const cityInput=document.querySelector(".city-input");
const searchButton=document.querySelector(".search-btn");


const locationButton=document.querySelector(".location-btn");


const currentWeatherDiv=document.querySelector(".current-weather");
const weatherCardsDiv=document.querySelector(".weather-cards");
const API_KEY="926a463965978f1e0d90edc891c5fd5d";





const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) { // HTML for the main weather card
        return `<section class="details">

        
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>

     <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
         <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
     </section>
     <section class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather">
                <h4>${weatherItem.weather[0].description}</h4>
            </section>`;
    } 
    
    
    
    
    
    
    else {
        return `<li class="card">
        <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
     <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather">
        <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
      <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
    }
};















const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });



            // Clear previous weather
            cityInput.value = "";



            weatherCardsDiv.innerHTML = "";
            currentWeatherDiv.innerHTML = "";

            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, index);
                } 
                
                
                else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather data!");
        });
};










//3 integrate the save function
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    console.log(`fetching coordinates for city:${cityName}`);
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};


const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
   const { latitude, longitude } = position.coords;
 const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL)     .then(res => res.json())
                .then(data => {
                    if (!data.length) return alert("No city found for your coordinates.");
      const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city!");
                });
        },





        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please allow access to your location.");
            }
        }
    );
};








//save city to local storage 
const saveCityToLocalStorage = (city) => {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!cities.includes(city)) {
        cities.push(city);
 localStorage.setItem('recentCities', JSON.stringify(cities));
        updateDropdown(cities);
    }
};
//dropdown menu
const updateDropdown = (cities) => {
    const dropdown = document.getElementById('cityDropdown');
    dropdown.innerHTML = '<option value="" disabled selected>Select a city</option>';
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        dropdown.appendChild(option);
    });
};

//populate dropdown on page
const loadRecentCities = () => {
    const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    updateDropdown(cities);
};
//handle dropdown section
document.getElementById('cityDropdown').addEventListener('change', (e) => {
const selectedCity = e.target.value;
if (selectedCity) {
     cityInput.value = selectedCity;
 getCityCoordinates();
    }
});





locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());









