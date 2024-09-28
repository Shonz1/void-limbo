module.exports = {
  ...require('./s2c-disconnect.packet'),
  ...require('./c2s-login-start.packet'),
  ...require('./s2c-login-success.packet'),
  ...require('./c2s-login-acknowledged.packet'),
  ...require('./s2c-set-compression.packet'),
  ...require('./s2c-encryption-request.packet'),
  ...require('./c2s-encryption-response.packet'),
};
