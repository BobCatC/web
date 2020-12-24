import * as location from './location.js'

const baseUrl = 'https://web.ip-kharisova.ru:1338'
const tokenHeader = 'X-Auth-Token'
var storage

export function setStorage(s) {
  storage = s
}

export class WeatherProperties {
  constructor() {

  }

  tempretureText() {
    return `${this.tempreture}°`
  }

  windText() {
    return `${this.windSpeed} m/s, ${this.windDirection}`
  }

  cloudsText() {
    return `${this.clouds} %`
  }

  pressureText() {
    return `${this.pressure} hpa`
  }

  humidityText() {
    return `${this.humidity} %`
  }

  locationText() {
    return `[${this.location.latitude} ${this.location.longitude}]`
  }
}

export async function fetchWeatherByLocation(latitude, longitude) {
  let response
  try {
    response = await fetch(`${baseUrl}/weather/coordinates?lat=${latitude}&lon=${longitude}`)
  } catch (error) {
    console.log(`Unable to fetch weather: ${error.message}`)
    throw new Error("Unknown weather API error")
  }

  if (response.status != 200) {
    throw new Error("Unexpected weather API response status")
  }

  const data = await response.json()
  return parseWeatherData(data)
}

export async function fetchWeatherByCityName(cityName) {
  let response
  try {
    response = await fetch(`${baseUrl}/weather/city?q=${cityName}`, { credentials: "same-origin" })

  } catch (error) {
    console.log(`Unable to fetch weather: ${error.message}`)
    throw new Error("Unknown weather API error")
  }

  if (response.status == 404) {
    throw new Error("Wrong city name")
  }

  if (response.status != 200) {
    throw new Error("Unknown weather API error")
  }

  const data = await response.json()
  return parseWeatherData(data)
}

function parseWeatherData(data) {
  data.location = Object.assign(new location.Location, data.location)
  return Object.assign(new WeatherProperties, data)
}

export async function addCityToFavorites(cityName) {
  const params = new URLSearchParams({ cityName: cityName })
  const headers = createTokenHeaders()
  const response = await fetch(`${baseUrl}/favorites?` + params, { method: 'POST', headers: headers })

  if (response.status == 404) {
    throw new Error(`Wrong city name: ${cityName}`)
  }

  if (response.status == 409) {
    throw new Error(`Trying to add favorite city to favorites again`)
  }

  if (response.status != 200) {
    throw new Error(`Unexpected API response status: ${response.status}`)
  }

  extractAndSaveToken(response)
}

export async function getFavoriteCities() {
  const headers = createTokenHeaders()
  const response = await fetch(`${baseUrl}/favorites`, { headers: headers })

  if (response.status != 200) {
    throw new Error(`Unexpected API response status: ${response.status}`)
  }

  extractAndSaveToken(response)

  return await response.json()
}

export async function deleteCityFromFavorites(cityName) {
  const params = new URLSearchParams({ cityName: cityName })
  const headers = createTokenHeaders()
  const response = await fetch(`${baseUrl}/favorites?` + params, { method: 'DELETE', headers: headers })
  return await extractAndSaveToken(response)
}

function extractAndSaveToken(response) {
  const token = response.headers.get(tokenHeader)
  if (token != undefined) {
    setToken(token)
  }
}

function createTokenHeaders() {
  const token = getToken()
  let headers = {}
  if (token != undefined) {
    headers[tokenHeader] = token
  }
  return headers
}

function getToken() {
  return storage.getItem('token')
}

function setToken(token) {
  storage.setItem('token', token)
}