module.exports = {
  friendlyName: 'Get all favorite cities',

  exits: {
    success: {
      statusCode: 200
    }
  },

  fn: async function (inputs, exits, env) {
    let user = await sails.helpers.getSessionUser(env.req, env.res);
    let favoriteCities = await FavoriteCity.find({user: user.id});
    favoriteCities = favoriteCities.map(function(city) {
      return city.cityName
    })
    return exits.success(favoriteCities)
  }
};
