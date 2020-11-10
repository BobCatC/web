module.exports = {
  friendlyName: 'Get user by token',

  description: 'Fetch user by token or create a new one',

  inputs: {
    token: {
      type: 'string',
      required: false
    }
  },

  fn: async function ({token}) {
    sails.log.info(`token: ${token}`);
    if (token == undefined) {
      token = `${Math.random()}`;
      sails.log.info(`token: ${token}`);
    } else {
      let user = await User.findOne({ cookies: token })
      if (user != undefined) {
        return user;
      }
    }
    sails.log.info(`token: ${token}`);

    return await User.create({
      cookies: token
    })
    .fetch()
  }
};

