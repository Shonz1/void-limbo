module.exports = {
  ...require('./s2c-join-game.packet'),
  ...require('./s2c-respawn.packet'),
  ...require('./s2c-player-abilities.packet'),
  ...require('./s2c-sync-player-position.packet'),
  ...require('./s2c-set-default-spawn-position.packet'),
  ...require('./s2c-keep-alive.packet'),
};
