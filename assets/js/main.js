// MARK: - Classes

class Location {
        constructor(latitude, longitude) {
                this.latitude = latitude;
                this.longitude = longitude;
        }
}

class WeatherProperties {
        constructor() {

        }

        tempretureText() {
                return `${this.tempreture}°`;
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

baseUrl = 'http://localhost:1337';

async function fetchWeatherByLocation(latitude, longitude) {
        let response;
        try {
                response = await fetch(`${baseUrl}/weather/coordinates?lat=${latitude}&lon=${longitude}`);
        } catch (error) {
                console.log(`Unable to fetch weather: ${error.message}`);
                alert("Unknown weather API error");
                const response = undefined;
        }

        if (response.status != 200) {
                alert("Unknown weather API error");
                throw new Error("Unknown weather API error");
        }

        const data = await response.json();
        return parseWeatherData(data);
}

async function fetchWeatherByCityName(cityName) {
        let response;
        try {
                response = await fetch(`${baseUrl}/weather/city?q=${cityName}`, { credentials: "same-origin" });

        } catch (error) {
                console.log(`Unable to fetch weather: ${error.message}`)
                alert("Unknown weather API error");
        }

        if (response.status == 404) {
                alert("Wrong city name");
                throw new Error("Wrong city name");
        }

        if (response.status != 200) {
                alert("Unknown weather API error")
                throw new Error("Unknown weather API error")
        }

        const data = await response.json();
        return parseWeatherData(data);
}

function parseWeatherData(data) {
        data.location = Object.assign(new Location, data.location)
        return Object.assign(new WeatherProperties, data);
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

const tokenHeader = 'X-Auth-Token'

async function addCityToFavorites(cityName) {
        const params = new URLSearchParams({ cityName: cityName })
        const headers = createTokenHeaders()
        const response = await fetch(`${baseUrl}/favorites?` + params, { method: 'POST', headers: headers })
        return await extractAndSaveToken(response)
}

async function getFavoriteCities() {
        const headers = createTokenHeaders()
        const response = await fetch(`${baseUrl}/favorites`, { headers: headers })
        return await extractAndSaveToken(response)
}

async function deleteCityFromFavorites(cityName) {
        const params = new URLSearchParams({ cityName: cityName })
        const headers = createTokenHeaders()
        const response = await fetch(`${baseUrl}/favorites?` + params, { method: 'DELETE', headers: headers })
        return await extractAndSaveToken(response)
}

function extractAndSaveToken(response) {
        const token = response.headers.get('X-Auth-Token')
        if (token != undefined) {
                localStorage.setItem('token', token)
        }
        return response
}

function getToken() {
        return localStorage.getItem('token')
}

function createTokenHeaders() {
        const token = getToken()
        let headers = {}
        if (token != undefined) {
                headers[tokenHeader] = token
        }
        return headers
}

// MARK: - Actions

function addFavoriteCityButtonDidTap(event) {
        event.preventDefault()
        input = event.target.querySelector('.add-city-input');
        cityName = input.value;
        input.value = "";

        loadingCityUI = createLoadingCityUI(cityName);
        updateFavoriteCity(cityName, loadingCityUI);

        addCityToFavorites(cityName)
                .then(response => {
                        if (response.status == 404) {
                                alert('Wrong city name')
                                throw new Error(`Wrong city name: ${cityName}`)
                        }

                        if (response.status == 409) {
                                alert('Already in Favorites!')
                                throw new Error(`Trying to add favorite city to favorites again`)
                        }

                        if (response.status != 200) {
                                alert('Unexpected weather API error')
                                throw new Error(`Unexpected API response status: ${response.status}`)
                        }

                        addFavoriteCity(cityName)
                })
                .catch(error => {
                        console.log(`Error during adding favorite city: ${error.message}`)
                        removeFavoriteCity(cityName);
                })
}

function reloadLocationButtonDidTap(event) {
        updateCurrentCity();
}

// MARK: - Helpers

function updateElementContent(element, newValue) {
        element.innerHTML = '';
        element.appendChild(newValue);
}

function replaceDocumentElement(query, html) {
        updateElementContent(document.querySelector(query), html);
}

function idForCity(cityName) {
        return `${cityName.replace(' ', '')}-city`.toLowerCase();
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

        replaceDocumentElement('.current-city-info-container', cityUI);
        replaceDocumentElement('.current-city-properties-container', propertiesUI);
}

function updateFavoriteCities() {
        getFavoriteCities()
                .then(response => {
                        if (response.status != 200) {
                                alert('Unexpected weather API error')
                                throw new Error(`Unexpected API response status: ${response.status}`)
                        }

                        return response
                })
                .then(response => response.json())
                .then(data => {
                        console.log(`Response of favorites: ${data}`)
                        data.forEach(addFavoriteCity)
                })
}

function addFavoriteCity(cityName) {
        fetchWeatherByCityName(cityName)
                .then(properties => {
                        cityUI = createCityUI(properties);
                        updateFavoriteCity(cityName, cityUI);
                })
                .catch(error => {
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
                        removeFavoriteCity(cityName)
                });
        }
}

function removeFavoriteCity(cityName) {
        document.querySelector('#' + idForCity(cityName)).remove();
        deleteCityFromFavorites(cityName)
}

// MARK: - UI

function createCurrentCityUI(properties) {
        template = document.querySelector('#current-city-template');
        content = template.content;
        content.querySelector('.current-city-name').textContent = properties.cityName;
        content.querySelector('.current-city-tempreture').textContent = properties.tempretureText();
        content.querySelector('.current-weather-img').setAttribute('src', properties.iconUrl);

        return content.cloneNode(true);
}

function createCityUI(properties) {
        propertiesListUI = createWeatherPropertiesListUI(properties);
        template = document.querySelector('#city-template');
        content = template.content;
        content.querySelector('h3').textContent = properties.cityName;
        content.querySelector('.city-tempreture').textContent = properties.tempretureText();
        content.querySelector('.city-weather-img').setAttribute('src', properties.iconUrl);
        updateElementContent(content.querySelector('.weather-properties-list'), propertiesListUI);

        content = content.cloneNode(true);
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
document.querySelector('.add-city').addEventListener('submit', addFavoriteCityButtonDidTap);

// cleanLocalData();
updateCurrentCity();
updateFavoriteCities();