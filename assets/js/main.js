// MARK: - Classes

class Location {
        constructor(latitude, longitude) {
                this.latitude = latitude;
                this.longitude = longitude;
        }
}

class LocalData {
        constructor(cities) {
                this.cities = cities
        }
}

class WeatherProperties {
        constructor() {

        }

        windText() {
                return `${this.windSpeed} m/s, ${this.windDirection}`;
        }

        cloudsText() {
                return `${this.clouds} %`;
        }

        pressureText() {
                return `${this.pressure} hpa`;
        }

        humidityText() {
                return `${this.humidity} %`;
        }

        locationText() {
                return `[${this.location.latitude} ${this.location.longitude}]`;
        }
}

// MARK: - Extensions

Array.prototype.remove = function (item) {
        return this.filter(value => {
                return value != item;
        })
};

// MARK: - Weather API

apiKey = 'c49aa141b23994b2563a6b32d32893b1';
baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

async function fetchWeatherByLocation(latitude, longitude) {
        const response = await fetch(`${baseUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
        const data = await response.json();
        return parseWeatherData(data);
}

async function fetchWeatherByCityName(cityName) {
        const response = await fetch(`${baseUrl}?q=${cityName}&appid=${apiKey}`);
        const data = await response.json();
        return parseWeatherData(data);
}

function parseWeatherData(data) {
        properties = new WeatherProperties();
        properties.cityName = data.name;
        properties.tempreture = Math.round(data.main.temp - 273);
        properties.windSpeed = data.wind.speed;
        properties.windDirection = windDirection(data.wind.deg);
        properties.clouds = data.clouds.all;
        properties.pressure = data.main.pressure;
        properties.humidity = data.main.humidity;
        properties.location = new Location(data.coord.lat, data.coord.lon);
        properties.iconUrl = `https://openweathermap.org/img/wn/${data.weather[0]['icon']}@2x.png`;
        return properties;
}

function windDirection(deg) {
        if (deg < 22.5 || deg >= 337.5) {
                return 'N';
        }
        if (deg < 67.5) {
                return 'NE';
        }
        if (deg < 112.5) {
                return 'E';
        }
        if (deg < 157.5) {
                return 'SE';
        }
        if (deg < 202.5) {
                return 'S';
        }
        if (deg < 247.5) {
                return 'SW';
        }
        if (deg < 292.5) {
                return 'W';
        }
        return 'NW'
}

// MARK: - Location

defaultLocation = new Location(59.894444, 30.264168);

function getLocation(handler) {
        geolocation = navigator.geolocation;
        geolocation.getCurrentPosition(location => {
                location = new Location(location.coords.latitude, location.coords.longitude);
                handler(location);
        }, error => {
                console.log(`Unable to extract Location: ${error.message}`);
                handler(defaultLocation);
        });
}

// MARK: - LocalStorage

LocalData.key = 'local-data';

function getLocalData() {
        localData = localStorage.getItem(LocalData.key);
        if (localData == undefined) {
                localData = new LocalData([]);
        } else {
                localData = Object.assign(new LocalData, JSON.parse(localData));
        }
        return localData;
}

function setLocalData(localData) {
        localData = JSON.stringify(localData);
        localStorage.setItem(LocalData.key, localData);
}

function cleanLocalData() {
        localStorage.removeItem(LocalData.key);
}

function addCityToLocalData(cityName) {
        localData = getLocalData();
        localData.cities.push(cityName);
        setLocalData(localData);
}

function removeCityFromLocalData(cityName) {
        localData = getLocalData();
        localData.cities = localData.cities.remove(cityName);
        setLocalData(localData);
}

function cityExistsInLocalData(cityName) {
        localData = getLocalData();
        return localData.cities.includes(cityName);
}

// MARK: - Actions

function addFavoriteCityButtonDidTap(event) {
        input = document.querySelector('.add-city-input');
        cityName = input.value;
        input.value = "";

        if (cityExistsInLocalData(cityName)) {
                return;
        }

        addCityToLocalData(cityName);
        addFavoriteCity(cityName);
}

function reloadLocationButtonDidTap(event) {
        updateCurrentCity();
}

// MARK: - Helpers

function updateElementContent(element, newValue) {
        element.innerHTML = '';
        element.appendChild(newValue);
}

function idForCity(cityName) {
        return `${cityName.replace(' ', '')}-city`;
}

function updateCurrentCity() {
        getLocation(location => {
                fetchWeatherByLocation(location.latitude, location.longitude)
                        .then(updateCurrentCityWithProperties)
        });
}

function updateCurrentCityWithProperties(properties) {
        cityUI = createCurrentCityUI(properties);
        propertiesUI = createWeatherPropertiesListUI(properties);

        updateElementContent(document.querySelector('.current-city-info-container'), cityUI);
        updateElementContent(document.querySelector('.current-city-properties-container'), propertiesUI);
}

function updateFavoriteCities() {
        localData = getLocalData();
        console.log(`Creating UI for cities: ${localData.cities}`)
        localData.cities.forEach(addFavoriteCity);
}

function addFavoriteCity(cityName) {
        loadingCityUI = createLoadingCityUI(cityName);
        updateFavoriteCity(cityName, loadingCityUI);
        fetchWeatherByCityName(cityName)
                .then(properties => {
                        cityUI = createCityUI(properties);
                        updateFavoriteCity(cityName, cityUI);
                })
                .catch(error => {
                        console.log(`Unable to add favorite city: ${error.message}`);
                        alert("Wrong city name");
                        removeFavoriteCity(cityName);
                });
}

function updateFavoriteCity(cityName, cityUI) {
        elementId = idForCity(cityName);
        cityUI.firstElementChild.setAttribute('id', elementId);
        section = document.querySelector('main').querySelector('#' + elementId);

        if (section == undefined) {
                document.querySelector('main').appendChild(cityUI);
        } else {
                section.innerHTML = cityUI.firstElementChild.innerHTML;
                section.querySelector('.close-button').addEventListener('click', event => {
                        removeFavoriteCity(properties.cityName)
                });
        }
}

function removeFavoriteCity(cityName) {
        document.querySelector('#' + idForCity(cityName)).remove();
        removeCityFromLocalData(cityName);
}

// MARK: - UI

function createCurrentCityUI(properties) {
        template = document.querySelector('#current-city-template');
        template.content.querySelector('.current-city-name').textContent = properties.cityName;
        template.content.querySelector('.current-city-tempreture').textContent = properties.tempreture;
        template.content.querySelector('.current-weather-img').setAttribute('src', properties.iconUrl);

        return template.content.cloneNode(true);
}

function createCityUI(properties) {
        propertiesListUI = createWeatherPropertiesListUI(properties);
        template = document.querySelector('#city-template');
        template.content.querySelector('h3').textContent = properties.cityName;
        template.content.querySelector('.city-tempreture').textContent = properties.tempreture;
        template.content.querySelector('.city-weather-img').setAttribute('src', properties.iconUrl);
        updateElementContent(template.content.querySelector('.weather-properties-list'), propertiesListUI);

        content = template.content.cloneNode(true);
        content.querySelector('.close-button').addEventListener('click', event => {
                removeFavoriteCity(properties.cityName)
        });
        return content;
}

function createLoadingCityUI(cityName) {
        template = document.querySelector('#loading-city-template');
        return template.content.cloneNode(true);
}

function createWeatherPropertiesListUI(properties) {
        template = document.querySelector('#weather-properties-list-template');
        p = template.content.querySelectorAll('p');
        p[0].textContent = properties.windText();
        p[1].textContent = properties.cloudsText();
        p[2].textContent = properties.pressureText();
        p[3].textContent = properties.humidityText();
        p[4].textContent = properties.locationText();

        return template.content.cloneNode(true);
}

// MARK: - Bootstrap

document.querySelector('.update-button').addEventListener('click', reloadLocationButtonDidTap);
document.querySelector('.update-button-mobile').addEventListener('click', reloadLocationButtonDidTap);
document.querySelector('#add-favorite-city').addEventListener('click', addFavoriteCityButtonDidTap);

// cleanLocalData();
updateCurrentCity();
updateFavoriteCities();