// const expect = require('chai').expect
// var assert = require('assert')
// // const request = require('request')
// const sinon = require('sinon')
// const fetchMock = require('fetch-mock')
// const main = require('./assets/js/main.js')

// import * as expect from 'chai'
// import {assert} from 'assert'
import assert from 'assert'
import fetchMock from 'fetch-mock'
import sinon from 'sinon'
import * as weather from './assets/js/weather-api.js'

const baseUrl = 'https://web.ip-kharisova.ru:1338'

const city = `{
  "cityName": "A1",
  "tempreture": 27,
  "windSpeed": 6.67,
  "windDirection": "S",
  "clouds": 100,
  "pressure": 1014,
  "humidity": 83,
  "location": {
      "latitude": 1,
      "longitude": 2
  },
  "iconUrl": "https://openweathermap.org/img/wn/10d@2x.png"
}`

// MARK: - fetchWeatherByLocation

describe('fetchWeatherByLocation', () => {
  const lat = 1, lon = 2

  afterEach(() => {
    fetchMock.reset()
  })

  it('Should return WeatherProperties', (done) => {
    fetchMock.get(`${baseUrl}/weather/coordinates?lat=${lat}&lon=${lon}`, city)
    weather.fetchWeatherByLocation(lat, lon)
      .then(p => {
        assert(p !== undefined)
        assert(p instanceof weather.WeatherProperties)
        assert(p.cityName === "A1")
        done()
      })
      .catch(error => {
        done(error)
      })
  })

  it('Should throw if not 200', (done) => {
    fetchMock.get(`${baseUrl}/weather/coordinates?lat=${lat}&lon=${lon}`, 500)
    weather.fetchWeatherByLocation(lat, lon)
      .then(_ => {
        done(new Error("Expected exception"))
      })
      .catch(_ => {
        done()
      })
  })
})

// MARK: - fetchWeatherByCityName

describe('fetchWeatherByCityName', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  it('Should return WeatherProperties', (done) => {
    const cityName = 'A1'
    fetchMock.get(`${baseUrl}/weather/city?q=${cityName}`, city)
    weather.fetchWeatherByCityName(cityName)
      .then(p => {
        assert(p !== undefined)
        assert(p instanceof weather.WeatherProperties)
        assert(p.cityName === "A1")
        done()
      })
      .catch(error => {
        done(error)
      })
  })

  it('Should throw on wrong name', (done) => {
    const cityName = 'A2'
    fetchMock.get(`${baseUrl}/weather/city?q=${cityName}`, 404)
    weather.fetchWeatherByCityName(cityName)
      .then(_ => {
        done(new Error("Expected exception"))
      })
      .catch(_ => {
        done()
      })
  })

  it('Should throw if not 200', (done) => {
    const cityName = '123'
    fetchMock.get(`${baseUrl}/weather/city?q=${cityName}`, 500)
    weather.fetchWeatherByCityName(cityName)
      .then(_ => {
        done(new Error("Expected exception"))
      })
      .catch(_ => {
        done()
      })
  })
})

// MARK: - addCityToFavorites

describe('addCityToFavorites', () => {
  let storage

  before(() => {
    storage = {
      store: {},

      getItem: function (key) {
        return this.store[key]
      },
  
      setItem: function (key, value) {
        this.store[key] = value;
      }
    }

    weather.setStorage(storage)
  })

  afterEach(() => {
    fetchMock.reset()
    weather.setStorage(undefined)
    storage = undefined
  })

  it('Should return 200 if OK', (done) => {
    const cityName = 'A2'
    fetchMock.post(`${baseUrl}/favorites?cityName=${cityName}`, 200)
    weather.addCityToFavorites(cityName)
      .then(() => {
        done()
      })
      .catch(error => {
        done(error)
      })
  })

  it('Should throw on duplication', (done) => {
    const cityName = 'A1'
    fetchMock.post(`${baseUrl}/favorites?cityName=${cityName}`, 409)
    weather.addCityToFavorites(cityName)
      .then(() => {
        done(new Error("Exception expected"))
      })
      .catch(error => {
        done()
      })
  })

  it('Should throw on wrong city name', (done) => {
    const cityName = '123'
    fetchMock.post(`${baseUrl}/favorites?cityName=${cityName}`, 404)
    weather.addCityToFavorites(cityName)
      .then(() => {
        done(new Error("Exception expected"))
      })
      .catch(error => {
        done()
      })
  })

  it('Should throw on unsuccessful code', (done) => {
    const cityName = 'A1'
    fetchMock.post(`${baseUrl}/favorites?cityName=${cityName}`, 500)
    weather.addCityToFavorites(cityName)
      .then(() => {
        done(new Error("Exception expected"))
      })
      .catch(error => {
        done()
      })
  })
})