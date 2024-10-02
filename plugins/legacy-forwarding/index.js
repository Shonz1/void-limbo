/// <reference path="../global.d.ts" />

api.eventManager.subscribe('pre-login-complete', async event => {
  const { channel } = event;

  if (configs.FORWARDING_MODE !== 'legacy') {
    return;
  }

  const remoteAddress = channel.getRemoteAddress();
  const addressParts = remoteAddress.split('\0');

  const realIp = addressParts[1];
  const uuid = addressParts[2];
  const properties = JSON.parse(addressParts[3] || '[]');

  channel.setRemoteAddress(realIp);

  const player = channel.getAssociation();
  const gameProfile = player.getGameProfile();

  player.setGameProfile(new api.GameProfile({ uuid, name: gameProfile.name, properties }));
});
