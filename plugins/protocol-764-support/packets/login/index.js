module.exports = {
  ...require('./s2c-disconnect.packet'),
  ...require('./c2s-login-start.packet'),
  ...require('./s2c-login-success.packet'),
  ...require('./c2s-login-acknowledged.packet'),
};
