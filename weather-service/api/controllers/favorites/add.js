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

  },


  fn: async function ({cityName}) {
    sails.log.info(`Add ${cityName} to favorites`)
    // All done.
    return;

  }


};
