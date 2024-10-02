const { ConfigurationService } = require('./services/configuration');
const { LoginService } = require('./services/login');
const { PlayService } = require('./services/play');
const { StatusService } = require('./services/status');

require('./registries');

new StatusService();
new LoginService();
new ConfigurationService();
new PlayService();
