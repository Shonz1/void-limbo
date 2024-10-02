/// <reference types="../../global.d.ts" />

const { C2SEncryptionResponsePacket } = require('../packets/inbound/login/encryption-response');
const { C2SLoginStartPacket } = require('../packets/inbound/login/login-start');
const { C2SPingRequestPacket } = require('../packets/inbound/status/ping-request');
const { C2SStatusRequestPacket } = require('../packets/inbound/status/status-request');
const { S2CDisconnectPacket } = require('../packets/outbound/login/disconnect');
const { S2CEncryptionRequestPacket } = require('../packets/outbound/login/encryption-request');
const { S2CLoginSuccessPacket } = require('../packets/outbound/login/login-success');
const { S2CSetCompressionPacket } = require('../packets/outbound/login/set-compression');
const { S2CChunkDataAndLightUpdatePacket } = require('../packets/outbound/play/chunk-data-and-light-update');
const { S2CGameEventPacket } = require('../packets/outbound/play/game-event');
const { S2CJoinGamePacket } = require('../packets/outbound/play/join-game');
const { S2CKeepAlivePacket } = require('../packets/outbound/play/keep-alive');
const { S2CPlayerAbilitiesPacket } = require('../packets/outbound/play/player-abilities');
const { S2CPlayerInfoUpdatePacket } = require('../packets/outbound/play/player-info-update');
const { S2CPlayerInfoUpdate4Packet } = require('../packets/outbound/play/player-info-update-4');
const { S2CSetDefaultSpawnPositionPacket } = require('../packets/outbound/play/set-default-spawn-position');
const { S2CSetDefaultSpawnPosition4Packet } = require('../packets/outbound/play/set-default-spawn-position-4');
const { S2CSyncPlayerPositionPacket } = require('../packets/outbound/play/sync-player-position');
const { S2CPingResponsePacket } = require('../packets/outbound/status/ping-response');
const { S2CStatusResponsePacket } = require('../packets/outbound/status/status-response');

{
  // Status
  common.registerInPacket(
    api.Phase.STATUS,
    [[api.ProtocolVersion.MINECRAFT_1_7_2, 0x00, api.ProtocolVersion.MINECRAFT_1_12_2]],
    C2SStatusRequestPacket,
  );
  common.registerInPacket(
    api.Phase.STATUS,
    [[api.ProtocolVersion.MINECRAFT_1_7_2, 0x01, api.ProtocolVersion.MINECRAFT_1_12_2]],
    C2SPingRequestPacket,
  );

  common.registerOutPacket(
    api.Phase.STATUS,
    [[api.ProtocolVersion.MINECRAFT_1_7_2, 0x00, api.ProtocolVersion.MINECRAFT_1_12_2]],
    S2CStatusResponsePacket,
  );
  common.registerOutPacket(
    api.Phase.STATUS,
    [[api.ProtocolVersion.MINECRAFT_1_7_2, 0x01, api.ProtocolVersion.MINECRAFT_1_12_2]],
    S2CPingResponsePacket,
  );
}

{
  // Login
  common.registerInPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_7_2, 0x00, api.ProtocolVersion.MINECRAFT_1_12_2]],
    C2SLoginStartPacket,
  );

  common.registerInPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_7_2, 0x01, api.ProtocolVersion.MINECRAFT_1_12_2]],
    C2SEncryptionResponsePacket,
  );

  common.registerOutPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_7_2, 0x00, api.ProtocolVersion.MINECRAFT_1_12_2]],
    S2CDisconnectPacket,
  );
  common.registerOutPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_7_2, 0x01, api.ProtocolVersion.MINECRAFT_1_12_2]],
    S2CEncryptionRequestPacket,
  );
  common.registerOutPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_7_2, 0x02, api.ProtocolVersion.MINECRAFT_1_12_2]],
    S2CLoginSuccessPacket,
  );
  common.registerOutPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_8, 0x03, api.ProtocolVersion.MINECRAFT_1_12_2]],
    S2CSetCompressionPacket,
  );
}

{
  // Play
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_7_2, 0x01],
      [api.ProtocolVersion.MINECRAFT_1_9, 0x23, api.ProtocolVersion.MINECRAFT_1_12_2],
    ],
    S2CJoinGamePacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_7_2, 0x39],
      [api.ProtocolVersion.MINECRAFT_1_9, 0x2b],
      [api.ProtocolVersion.MINECRAFT_1_12_1, 0x2c, api.ProtocolVersion.MINECRAFT_1_12_2],
    ],
    S2CPlayerAbilitiesPacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_7_2, 0x08],
      [api.ProtocolVersion.MINECRAFT_1_9, 0x2e],
      [api.ProtocolVersion.MINECRAFT_1_12_1, 0x2f, api.ProtocolVersion.MINECRAFT_1_12_2],
    ],
    S2CSyncPlayerPositionPacket,
  );

  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_7_2, 0x05, api.ProtocolVersion.MINECRAFT_1_7_6]],
    S2CSetDefaultSpawnPosition4Packet,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_8, 0x05],
      [api.ProtocolVersion.MINECRAFT_1_9, 0x43],
      [api.ProtocolVersion.MINECRAFT_1_12, 0x45],
      [api.ProtocolVersion.MINECRAFT_1_12_1, 0x46, api.ProtocolVersion.MINECRAFT_1_12_2],
    ],
    S2CSetDefaultSpawnPositionPacket,
  );

  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_7_2, 0x38, api.ProtocolVersion.MINECRAFT_1_7_6]],
    S2CPlayerInfoUpdate4Packet,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_8, 0x38],
      [api.ProtocolVersion.MINECRAFT_1_9, 0x2d],
      [api.ProtocolVersion.MINECRAFT_1_12_1, 0x2e, api.ProtocolVersion.MINECRAFT_1_12_2],
    ],
    S2CPlayerInfoUpdatePacket,
  );

  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_7_2, 0x2b],
      [api.ProtocolVersion.MINECRAFT_1_9, 0x1e, api.ProtocolVersion.MINECRAFT_1_12_2],
    ],
    S2CGameEventPacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_7_2, 0x21],
      [api.ProtocolVersion.MINECRAFT_1_9, 0x20, api.ProtocolVersion.MINECRAFT_1_12_2],
    ],
    S2CChunkDataAndLightUpdatePacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_7_2, 0x00],
      [api.ProtocolVersion.MINECRAFT_1_9, 0x1f, api.ProtocolVersion.MINECRAFT_1_12_2],
    ],
    S2CKeepAlivePacket,
  );
}
