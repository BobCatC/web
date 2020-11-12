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
    // let userToken = req.cookies.userToken;
    userToken = req.get('X-Auth-Token')
    let user = await sails.helpers.getUserByToken(userToken);
    sails.log.info(user);
    // res.cookie('userToken', user.cookies, {httpOnly: true, domain: 'http://localhost:1337'});
    res.set('X-Auth-Token', user.cookies)
    return user;
  }
};