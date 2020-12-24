module.exports = {


  friendlyName: 'City exists',


  description: '',


  inputs: {
    cityName: {
      type: 'string',
      required: true
    }
  },

  fn: async function ({ cityName }, exits) {
    const baseUrl = sails.config.weatherApi.baseUrl
    const apiKey = sails.config.weatherApi.key

    try {
      const response = await sails.config.globals.fetch(`${baseUrl}?q=${cityName}&appid=${apiKey}`);
      return exits.success(response.status == 200)
    } catch (error) {
      console.log(`Unable to fetch weather: ${error.message}`)
      return exits.success(false)
    }
  }
};

