module.exports = {
  friendlyName: 'Add',

  description: 'Add favorites.',

  inputs: {
    cityName: {
      description: 'City name to be added to favorites',
      type: 'string',
      required: true
    }
  },

  exits: {
    cityAlreadyInFavorites: {
      statusCode: 409,
    },
    success: {
      statusCode: 200
    }
  },

  fn: async function ({cityName}, exits, env) {
    sails.log.info(`Add ${cityName} to favorites`)

    let user = await sails.helpers.getSessionUser(env.req, env.res);
    cityName = await sails.helpers.formatCityName(cityName);
    
    let favoriteCity = await FavoriteCity.findOne({ user: user.id, cityName: cityName });

    if (favoriteCity == undefined) {
      favoriteCity = await FavoriteCity.create({
        cityName: cityName,
        user: user.id
      });

      return exits.success();
    } else {
      return exits.cityAlreadyInFavorites();
    }
  }
};
