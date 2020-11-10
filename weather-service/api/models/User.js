/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "users",

  attributes: {
    cookies: {
      type: 'string',
      required: true,
      unique: true,
    },
    favorites: {
      collection: 'FavoriteCity',
      via: 'user'
    }
  },
};

