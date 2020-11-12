module.exports = {
  inputs: {
    data: {
      type: 'ref',
      required: true
    }
  },

  fn: async function ({data}) {
    properties = new Object();
    properties.cityName = data.name;
    properties.tempreture = Math.round(data.main.temp - 273);
    properties.windSpeed = data.wind.speed;
    properties.windDirection = await sails.helpers.windDirection(data.wind.deg);
    properties.clouds = data.clouds.all;
    properties.pressure = data.main.pressure;
    properties.humidity = data.main.humidity;
    properties.location = new Location(data.coord.lat, data.coord.lon);
    properties.iconUrl = `https://openweathermap.org/img/wn/${data.weather[0]['icon']}@2x.png`;
    return properties;
  }
};

class Location {
  constructor(latitude, longitude) {
          this.latitude = latitude;
          this.longitude = longitude;
  }
}