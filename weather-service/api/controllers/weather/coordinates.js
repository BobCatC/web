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

    const baseUrl = sails.config.weatherApi.baseUrl
    const apiKey = sails.config.weatherApi.key

    let response
    try {
      response = await sails.config.globals.fetch(`${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    } catch (error) {
      sails.log.warn(`Unable to fetch weather: ${error.message}`);
      return exits.unableToFetchWeather()
    }

    if (response.status != 200) {
      sails.log.warn(`Unexpected non-ok weather request status: ${response.status}`);
      return exits.unableToFetchWeather()
    }

    const data = await response.json();
    const result = await sails.helpers.parseWeatherData(data);
    return exits.success(result)
  }
};