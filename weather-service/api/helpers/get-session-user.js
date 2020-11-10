module.exports = {
  inputs: {
    req: {
      type: 'ref',
      required: true
    },
    res: {
      type: 'ref',
      required: true
    }
  },

  fn: async function ({req, res}) {
    let userToken = req.signedCookies.userToken;
    let user = await sails.helpers.getUserByToken(userToken);
    sails.log.info(user);
    res.cookie('userToken', user.cookies, {signed: true});
    return user;
  }
};