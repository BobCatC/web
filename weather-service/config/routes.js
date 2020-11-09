/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
    "GET /weather/city": "weather/city",
    "GET /weather/coordinates": "weather/coordinates",
    "GET /favorites": "favorites/getAll",
    "POST /favorites": "favorites/add",
    "DELETE /favorites": "favorites/delete"
};
