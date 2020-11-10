module.exports = {
  friendlyName: 'Delete',

  description: 'Delete favorite city',

  inputs: {
    cityName: {
      description: 'City name to be deleted from favorites',
      type: 'string',
      required: true
    }
  },

  exits: {
    unauthorized: {
      statusCode: 401
    }
  },

  fn: async function ({cityName}, exits, env) {
    sails.log.info(`Delete ${cityName} from favorites`)
    let user = await sails.helpers.getSessionUser(env.req, env.res);

    if (user == undefined) {
      return exits.unauthorized()
    }

    await FavoriteCity.destroy({ user: user.id, cityName: cityName });

    return exits.success();
  }
};