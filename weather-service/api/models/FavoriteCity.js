/**
 * FavoriteCity.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'favorite_cities',

  attributes: {
    cityName: {
      type: 'string',
      columnName: 'city_name',
      required: true,
    },
    user: {
      required: true,
      model: 'User',
      columnName: 'user_id'
    }
  },
};