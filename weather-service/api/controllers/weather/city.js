module.exports = {


  friendlyName: 'City',


  description: 'City weather.',


  inputs: {
    q: {
      description: 'City name',
      type: 'string',
      required: true
    }   
  },


  exits: {

  },


  fn: async function ({q}) {
    sails.log.info(`Get weather by city name with q=${q}`)
    return;
  }


};
