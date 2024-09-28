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
  S2CSetCompressionPacket,
  S2CEncryptionRequestPacket,
  C2SEncryptionResponsePacket,
  S2CPlayerInfoUpdatePacket,
  S2CGameEventPacket,
  S2CChunkDataAndLightUpdatePacket,
  C2SSetPlayerPositionAndRotationPacket,
  C2SSetPlayerPositionPacket,
  C2SSetPlayerRotationPacket,
  C2SSetPlayerOnGroundPacket,
  S2CSpawnEntityPacket,
  S2CUpdateEntityPositionPacket,
  S2CUpdateEntityPositionAndRotationPacket,
  S2CUpdateEntityRotationPacket,
  S2CPlayerInfoRemovePacket,
  S2CRemoveEntitiesPacket,
} = require('./packets');
const { S2CSetHeadRotationPacket } = require('./packets/play/s2c-set-head-rotation.packet');

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
          [C2SEncryptionResponsePacket.id, C2SEncryptionResponsePacket],
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
      [
        network.Phase.PLAY,
        new Map([
          [C2SSetPlayerPositionPacket.id, C2SSetPlayerPositionPacket],
          [C2SSetPlayerPositionAndRotationPacket.id, C2SSetPlayerPositionAndRotationPacket],
          [C2SSetPlayerRotationPacket.id, C2SSetPlayerRotationPacket],
          [C2SSetPlayerOnGroundPacket.id, C2SSetPlayerOnGroundPacket],
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
          [S2CEncryptionRequestPacket.id, S2CEncryptionRequestPacket],
          [S2CSetCompressionPacket.id, S2CSetCompressionPacket],
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
          [S2CSpawnEntityPacket.id, S2CSpawnEntityPacket],
          [S2CRemoveEntitiesPacket.id, S2CRemoveEntitiesPacket],
          [S2CJoinGamePacket.id, S2CJoinGamePacket],
          [S2CRespawnPacket.id, S2CRespawnPacket],
          [S2CPlayerAbilitiesPacket.id, S2CPlayerAbilitiesPacket],
          [S2CSyncPlayerPositionPacket.id, S2CSyncPlayerPositionPacket],
          [S2CSetDefaultSpawnPositionPacket.id, S2CSetDefaultSpawnPositionPacket],
          [S2CKeepAlivePacket.id, S2CKeepAlivePacket],
          [S2CPlayerInfoUpdatePacket.id, S2CPlayerInfoUpdatePacket],
          [S2CPlayerInfoRemovePacket.id, S2CPlayerInfoRemovePacket],
          [S2CGameEventPacket.id, S2CGameEventPacket],
          [S2CChunkDataAndLightUpdatePacket.id, S2CChunkDataAndLightUpdatePacket],
          [S2CUpdateEntityPositionPacket.id, S2CUpdateEntityPositionPacket],
          [S2CUpdateEntityPositionAndRotationPacket.id, S2CUpdateEntityPositionAndRotationPacket],
          [S2CUpdateEntityRotationPacket.id, S2CUpdateEntityRotationPacket],
          [S2CSetHeadRotationPacket.id, S2CSetHeadRotationPacket],
        ]),
      ],
    ]),
  ],
]);

module.exports = { REGISTRY_MAP };
