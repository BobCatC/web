const fetch = require('node-fetch');

module.exports = {


  friendlyName: 'Coordinates',


  description: 'Coordinates weather.',


  inputs: {
    lat: {
      description: 'Latitude',
      type: 'number',
      required: true
    },
    lon: {
      description: 'Longitude',
      type: 'number',
      required: true
    }
  },


  exits: {
    unableToFetchWeather: {
      statusCode: 500
    }
  },


  fn: async function ({ lat, lon }, exits) {
    sails.log.info(`Quering weather by coordinates with lat=${lat}, lon=${lon}`)

    apiKey = 'c49aa141b23994b2563a6b32d32893b1';
    baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

    let response
    try {
      response = await fetch(`${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    } catch (error) {
      sails.log.warn(`Unable to fetch weather: ${error.message}`);
      return exits.unableToFetchWeather()
    }

    if (response.status != 200) {
      sails.log.warn(`Unexpected non-ok weather request status: ${error.message}`);
      return exits.unableToFetchWeather()
    }

    const data = await response.json();
    const result = await sails.helpers.parseWeatherData(data);
    return exits.success(result)
  }
};