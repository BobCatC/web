import * as location from './location.js'
import * as weather from './weather-api.js'

// Actions

function addFavoriteCityButtonDidTap(event) {
  event.preventDefault()
  const input = event.target.querySelector('.add-city-input') 
  const cityName = input.value 
  input.value = "" 

  if (cityExistsLocally(cityName)) {
    alert("Trying to duplicate the city!")
    return
  }

  const loadingCityUI = createLoadingCityUI(cityName) 
  updateFavoriteCity(cityName, loadingCityUI) 

  weather.addCityToFavorites(cityName)
    .then(() => {
      addFavoriteCity(cityName)
    })
    .catch(error => {
      console.log(`Error during adding favorite city: ${error.message}`)
      alert(error.message)
      removeFavoriteCity(cityName) 
    })
}

function reloadLocationButtonDidTap(event) {
  updateCurrentCity() 
}

// MARK: - Helpers

function updateElementContent(element, newValue) {
  element.innerHTML = '' 
  element.appendChild(newValue) 
}

function replaceDocumentElement(query, html) {
  updateElementContent(document.querySelector(query), html) 
}

function idForCity(cityName) {
  return `${cityName.replace(' ', '')}-city`.toLowerCase() 
}

export function updateCurrentCity() {
  location.getLocation(navigator.geolocation)
    .then(location => {
      weather.fetchWeatherByLocation(location.latitude, location.longitude)
        .then(updateCurrentCityWithProperties)
    }) 
}

function updateCurrentCityWithProperties(properties) {
  const cityUI = createCurrentCityUI(properties) 
  const propertiesUI = createWeatherPropertiesListUI(properties) 

  replaceDocumentElement('.current-city-info-container', cityUI) 
  replaceDocumentElement('.current-city-properties-container', propertiesUI) 
}

export function updateFavoriteCities() {
  weather.getFavoriteCities()
    .then(data => {
      console.log(`Response of favorites: ${data}`)
      data.forEach(addFavoriteCity)
    })
    .catch(error => {
      alert(error.message)
    })
}

function addFavoriteCity(cityName) {
  weather.fetchWeatherByCityName(cityName)
    .then(properties => {
      const cityUI = createCityUI(properties) 
      updateFavoriteCity(cityName, cityUI) 
    })
    .catch(error => {
      removeFavoriteCity(cityName) 
      alert(error.message)
    }) 
}

function updateFavoriteCity(cityName, cityUI) {
  const elementId = idForCity(cityName) 
  cityUI.firstElementChild.setAttribute('id', elementId) 
  const section = document.querySelector('main').querySelector('#' + elementId) 

  if (section == undefined) {
    document.querySelector('main').appendChild(cityUI) 
  } else {
    section.innerHTML = cityUI.firstElementChild.innerHTML 
    section.querySelector('.close-button').addEventListener('click', event => {
      removeFavoriteCity(cityName)
    }) 
  }
}

function cityExistsLocally(cityName) {
  const elementId = idForCity(cityName) 
  const section = document.querySelector('main').querySelector('#' + elementId) 
  return section != undefined
}

function removeFavoriteCity(cityName) {
  document.querySelector('#' + idForCity(cityName)).remove() 
  weather.deleteCityFromFavorites(cityName)
}

// MARK: - UI

function createCurrentCityUI(properties) {
  const template = document.querySelector('#current-city-template') 
  const content = template.content 
  content.querySelector('.current-city-name').textContent = properties.cityName 
  content.querySelector('.current-city-tempreture').textContent = properties.tempretureText() 
  content.querySelector('.current-weather-img').setAttribute('src', properties.iconUrl) 

  return content.cloneNode(true) 
}

function createCityUI(properties) {
  const propertiesListUI = createWeatherPropertiesListUI(properties) 
  const template = document.querySelector('#city-template') 
  let content = template.content 
  content.querySelector('h3').textContent = properties.cityName 
  content.querySelector('.city-tempreture').textContent = properties.tempretureText() 
  content.querySelector('.city-weather-img').setAttribute('src', properties.iconUrl) 
  updateElementContent(content.querySelector('.weather-properties-list'), propertiesListUI) 

  content = content.cloneNode(true) 
  content.querySelector('.close-button').addEventListener('click', event => {
    removeFavoriteCity(properties.cityName)
  }) 
  return content 
}

function createLoadingCityUI(cityName) {
  const template = document.querySelector('#loading-city-template') 
  return template.content.cloneNode(true) 
}

function createWeatherPropertiesListUI(properties) {
  const template = document.querySelector('#weather-properties-list-template') 
  const p = template.content.querySelectorAll('p') 
  p[0].textContent = properties.windText() 
  p[1].textContent = properties.cloudsText() 
  p[2].textContent = properties.pressureText() 
  p[3].textContent = properties.humidityText() 
  p[4].textContent = properties.locationText() 

  return template.content.cloneNode(true) 
}

// MARK: - Bootstrap

export function bindDocumentEvents(document) {
  document.querySelector('.update-button').addEventListener('click', reloadLocationButtonDidTap) 
  document.querySelector('.update-button-mobile').addEventListener('click', reloadLocationButtonDidTap) 
  document.querySelector('.add-city').addEventListener('submit', addFavoriteCityButtonDidTap) 
}

export function setupWeatherApiStorage() {
  weather.setStorage(localStorage)
}