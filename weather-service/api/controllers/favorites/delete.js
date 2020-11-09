module.exports = {


  friendlyName: 'Delete',


  description: 'Delete favorites.',


  inputs: {
    cityName: {
      description: 'City name to be deleted from favorites',
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
