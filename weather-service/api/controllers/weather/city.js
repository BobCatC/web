const fetch = require('node-fetch');

module.exports = {
  friendlyName: 'City',

  description: 'City weather.',

  inputs: {
    q: {
      description: 'City name',
      type: 'string',
      required: true
    }
  },

  exits: {
    cityNotFound: {
      statusCode: 404
    },
    unableToFetchWeather: {
      statusCode: 500
    }
  },

  fn: async function ({ q }, exits) {
    sails.log.info(`Get weather by city name with q=${q}`)

    const baseUrl = sails.config.weatherApi.baseUrl
    const apiKey = sails.config.weatherApi.key

    let response
    try {
      response = await fetch(`${baseUrl}?q=${q}&appid=${apiKey}`);
    } catch (error) {
      console.log(`Unable to fetch weather: ${error.message}`)
      return exits.unableToFetchWeather()
    }

    if (response.status == 404) {
      sails.log.warn("Wrong city name");
      return exits.cityNotFound()
    }

    if (response.status != 200) {
      console.log(`Unable to fetch weather: ${error.message}`)
      return exits.unableToFetchWeather()
    }

    const data = await response.json();
    const result = await sails.helpers.parseWeatherData(data)
    return exits.success(result)
  }
};
