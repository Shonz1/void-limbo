const {
  C2SStatusRequestPacket,
  C2SPingRequestPacket,
  C2SLoginStartPacket,
  C2SLoginAcknowledgedPacket,
  C2SFinishConfigurationPacket,
  S2CStatusResponsePacket,
  S2CPingResponsePacket,
  S2CDisconnectPacket,
  S2CLoginSuccessPacket,
  S2CFinishConfigurationPacket,
  S2CRegistryDataPacket,
  S2CJoinGamePacket,
  S2CRespawnPacket,
  S2CPlayerAbilitiesPacket,
  S2CSyncPlayerPositionPacket,
  S2CSetDefaultSpawnPositionPacket,
  S2CKeepAlivePacket,
  C2SPluginMessagePacket,
  S2CPluginMessagePacket,
} = require('./packets');

const REGISTRY_MAP = new Map([
  [
    network.Direction.SERVERBOUND,
    new Map([
      [
        network.Phase.STATUS,
        new Map([
          [C2SStatusRequestPacket.id, C2SStatusRequestPacket],
          [C2SPingRequestPacket.id, C2SPingRequestPacket],
        ]),
      ],
      [
        network.Phase.LOGIN,
        new Map([
          [C2SLoginStartPacket.id, C2SLoginStartPacket],
          [C2SLoginAcknowledgedPacket.id, C2SLoginAcknowledgedPacket],
        ]),
      ],
      [
        network.Phase.CONFIGURATION,
        new Map([
          [C2SFinishConfigurationPacket.id, C2SFinishConfigurationPacket],
          [C2SPluginMessagePacket.id, C2SPluginMessagePacket],
        ]),
      ],
    ]),
  ],
  [
    network.Direction.CLIENTBOUND,
    new Map([
      [
        network.Phase.STATUS,
        new Map([
          [S2CStatusResponsePacket.id, S2CStatusResponsePacket],
          [S2CPingResponsePacket.id, S2CPingResponsePacket],
        ]),
      ],
      [
        network.Phase.LOGIN,
        new Map([
          [S2CDisconnectPacket.id, S2CDisconnectPacket],
          [S2CLoginSuccessPacket.id, S2CLoginSuccessPacket],
        ]),
      ],
      [
        network.Phase.CONFIGURATION,
        new Map([
          [S2CFinishConfigurationPacket.id, S2CFinishConfigurationPacket],
          [S2CRegistryDataPacket.id, S2CRegistryDataPacket],
          [S2CPluginMessagePacket.id, S2CPluginMessagePacket],
        ]),
      ],
      [
        network.Phase.PLAY,
        new Map([
          [S2CJoinGamePacket.id, S2CJoinGamePacket],
          [S2CRespawnPacket.id, S2CRespawnPacket],
          [S2CPlayerAbilitiesPacket.id, S2CPlayerAbilitiesPacket],
          [S2CSyncPlayerPositionPacket.id, S2CSyncPlayerPositionPacket],
          [S2CSetDefaultSpawnPositionPacket.id, S2CSetDefaultSpawnPositionPacket],
          [S2CKeepAlivePacket.id, S2CKeepAlivePacket],
        ]),
      ],
    ]),
  ],
]);

module.exports = { REGISTRY_MAP };
