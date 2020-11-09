module.exports = {


  friendlyName: 'Coordinates',


  description: 'Coordinates weather.',


  inputs: {
    lat: {
      description: 'Latitude',
      type: 'number',
      required: true
    },
    long: {
      description: 'Longitude',
      type: 'number',
      required: true
    }
  },


  exits: {

  },


  fn: async function ({lat, long}) {
    sails.log.info(`Quering weather by coordinates with lat=${lat}, long=${long}`)
    // All done.
    return;

  }


};
