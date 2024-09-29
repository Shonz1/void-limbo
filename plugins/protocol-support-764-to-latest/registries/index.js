const {
  S2CSpawnEntityPacket,
  S2CRemoveEntitiesPacket,
  S2CPlayerAbilitiesPacket,
  S2CJoinGamePacket,
  S2CRespawnPacket,
  S2CSyncPlayerPositionPacket,
  S2CSetDefaultSpawnPositionPacket,
  S2CKeepAlivePacket,
  S2CPlayerInfoUpdatePacket,
  S2CPlayerInfoRemovePacket,
  S2CGameEventPacket,
  S2CChunkDataAndLightUpdatePacket,
  S2CUpdateEntityPositionPacket,
  S2CUpdateEntityPositionAndRotationPacket,
  S2CUpdateEntityRotationPacket,
  S2CSetHeadRotationPacket,
  C2SSetPlayerPositionPacket,
  C2SSetPlayerPositionAndRotationPacket,
  C2SSetPlayerRotationPacket,
  C2SSetPlayerOnGroundPacket,
} = require('../../.protocol-765-support/packets');
const { C2SFinishConfigurationPacket } = require('../packets/inbound/configuration/finish-configuration');
const { C2SPluginMessagePacket } = require('../packets/inbound/configuration/plugin-message');
const { C2SEncryptionResponsePacket } = require('../packets/inbound/login/encryption-response');
const { C2SLoginAcknowledgedPacket } = require('../packets/inbound/login/login-acknowledged');
const { C2SLoginStartPacket } = require('../packets/inbound/login/login-start');
const { C2SPingRequestPacket } = require('../packets/inbound/status/ping-request');
const { C2SStatusRequestPacket } = require('../packets/inbound/status/status-request');
const { S2CFinishConfigurationPacket } = require('../packets/outbound/configuration/finish-configuration');
const { S2CPluginMessagePacket } = require('../packets/outbound/configuration/plugin-message');
const { S2CRegistryDataPacket } = require('../packets/outbound/configuration/registry-data');
const { S2CDisconnectPacket } = require('../packets/outbound/login/disconnect');
const { S2CEncryptionRequestPacket } = require('../packets/outbound/login/encryption-request');
const { S2CLoginSuccessPacket } = require('../packets/outbound/login/login-success');
const { S2CSetCompressionPacket } = require('../packets/outbound/login/set-compression');
const { S2CPingResponsePacket } = require('../packets/outbound/status/ping-response');
const { S2CStatusResponsePacket } = require('../packets/outbound/status/status-response');

{
  // Status
  common.registerInPacket(api.Phase.STATUS, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x00]], C2SStatusRequestPacket);
  common.registerInPacket(api.Phase.STATUS, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x01]], C2SPingRequestPacket);

  common.registerOutPacket(api.Phase.STATUS, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x00]], S2CStatusResponsePacket);
  common.registerOutPacket(api.Phase.STATUS, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x01]], S2CPingResponsePacket);
}

{
  // Login
  common.registerInPacket(api.Phase.LOGIN, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x00]], C2SLoginStartPacket);
  common.registerInPacket(api.Phase.LOGIN, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x01]], C2SEncryptionResponsePacket);
  common.registerInPacket(api.Phase.LOGIN, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x03]], C2SLoginAcknowledgedPacket);

  common.registerOutPacket(api.Phase.LOGIN, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x00]], S2CDisconnectPacket);
  common.registerOutPacket(api.Phase.LOGIN, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x01]], S2CEncryptionRequestPacket);
  common.registerOutPacket(api.Phase.LOGIN, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x02]], S2CLoginSuccessPacket);
  common.registerOutPacket(api.Phase.LOGIN, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x03]], S2CSetCompressionPacket);
}

{
  // Configuration
  common.registerInPacket(api.Phase.CONFIGURATION, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x01]], C2SPluginMessagePacket);
  common.registerInPacket(api.Phase.CONFIGURATION, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x02]], C2SFinishConfigurationPacket);

  common.registerOutPacket(api.Phase.CONFIGURATION, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x00]], S2CPluginMessagePacket);
  common.registerOutPacket(api.Phase.CONFIGURATION, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x02]], S2CFinishConfigurationPacket);
  common.registerOutPacket(api.Phase.CONFIGURATION, [[api.ProtocolVersion.MINECRAFT_1_20_2, 0x05]], S2CRegistryDataPacket);
}

{
  // Play
  common.registerInPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, C2SSetPlayerPositionPacket.id]],
    C2SSetPlayerPositionPacket,
  );
  common.registerInPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, C2SSetPlayerPositionAndRotationPacket.id]],
    C2SSetPlayerPositionAndRotationPacket,
  );
  common.registerInPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, C2SSetPlayerRotationPacket.id]],
    C2SSetPlayerRotationPacket,
  );
  common.registerInPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, C2SSetPlayerOnGroundPacket.id]],
    C2SSetPlayerOnGroundPacket,
  );

  common.registerOutPacket(api.Phase.PLAY, [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CSpawnEntityPacket.id]], S2CSpawnEntityPacket);
  common.registerOutPacket(api.Phase.PLAY, [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CRemoveEntitiesPacket.id]], S2CRemoveEntitiesPacket);
  common.registerOutPacket(api.Phase.PLAY, [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CJoinGamePacket.id]], S2CJoinGamePacket);
  common.registerOutPacket(api.Phase.PLAY, [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CRespawnPacket.id]], S2CRespawnPacket);
  common.registerOutPacket(api.Phase.PLAY, [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CPlayerAbilitiesPacket.id]], S2CPlayerAbilitiesPacket);
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CSyncPlayerPositionPacket.id]],
    S2CSyncPlayerPositionPacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CSetDefaultSpawnPositionPacket.id]],
    S2CSetDefaultSpawnPositionPacket,
  );
  common.registerOutPacket(api.Phase.PLAY, [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CKeepAlivePacket.id]], S2CKeepAlivePacket);
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CPlayerInfoUpdatePacket.id]],
    S2CPlayerInfoUpdatePacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CPlayerInfoRemovePacket.id]],
    S2CPlayerInfoRemovePacket,
  );
  common.registerOutPacket(api.Phase.PLAY, [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CGameEventPacket.id]], S2CGameEventPacket);
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CChunkDataAndLightUpdatePacket.id]],
    S2CChunkDataAndLightUpdatePacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CUpdateEntityPositionPacket.id]],
    S2CUpdateEntityPositionPacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CUpdateEntityPositionAndRotationPacket.id]],
    S2CUpdateEntityPositionAndRotationPacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CUpdateEntityRotationPacket.id]],
    S2CUpdateEntityRotationPacket,
  );
  common.registerOutPacket(api.Phase.PLAY, [[api.ProtocolVersion.MINECRAFT_1_20_3, S2CSetHeadRotationPacket.id]], S2CSetHeadRotationPacket);
}
