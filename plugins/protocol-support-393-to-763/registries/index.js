/// <reference types="../../global.d.ts" />

const { C2SEncryptionResponsePacket } = require('../packets/inbound/login/encryption-response');
const { C2SEncryptionResponse759Packet } = require('../packets/inbound/login/encryption-response-759');
const { C2SLoginStartPacket } = require('../packets/inbound/login/login-start');
const { C2SLoginStart759Packet } = require('../packets/inbound/login/login-start-759');
const { C2SPingRequestPacket } = require('../packets/inbound/status/ping-request');
const { C2SStatusRequestPacket } = require('../packets/inbound/status/status-request');
const { S2CDisconnectPacket } = require('../packets/outbound/login/disconnect');
const { S2CEncryptionRequestPacket } = require('../packets/outbound/login/encryption-request');
const { S2CLoginSuccessPacket } = require('../packets/outbound/login/login-success');
const { S2CSetCompressionPacket } = require('../packets/outbound/login/set-compression');
const { S2CChunkDataAndLightUpdatePacket } = require('../packets/outbound/play/chunk-data-and-light-update');
const { S2CGameEventPacket } = require('../packets/outbound/play/game-event');
const { S2CJoinGame393Packet } = require('../packets/outbound/play/join-game-393');
const { S2CJoinGame477Packet } = require('../packets/outbound/play/join-game-477');
const { S2CJoinGame573Packet } = require('../packets/outbound/play/join-game-573');
const { S2CJoinGame735Packet } = require('../packets/outbound/play/join-game-735');
const { S2CJoinGame751Packet } = require('../packets/outbound/play/join-game-751');
const { S2CJoinGame757Packet } = require('../packets/outbound/play/join-game-757');
const { S2CJoinGame759Packet } = require('../packets/outbound/play/join-game-759');
const { S2CJoinGame763Packet } = require('../packets/outbound/play/join-game-763');
const { S2CKeepAlivePacket } = require('../packets/outbound/play/keep-alive');
const { S2CPlayerAbilitiesPacket } = require('../packets/outbound/play/player-abilities');
const { S2CPlayerInfoUpdatePacket } = require('../packets/outbound/play/player-info-update');
const { S2CPlayerInfoUpdate393Packet } = require('../packets/outbound/play/player-info-update-393');
const { S2CSetDefaultSpawnPositionPacket } = require('../packets/outbound/play/set-default-spawn-position');
const { S2CSyncPlayerPositionPacket } = require('../packets/outbound/play/sync-player-position');
const { S2CPingResponsePacket } = require('../packets/outbound/status/ping-response');
const { S2CStatusResponsePacket } = require('../packets/outbound/status/status-response');

{
  // Status
  common.registerInPacket(
    api.Phase.STATUS,
    [[api.ProtocolVersion.MINECRAFT_1_13, 0x00, api.ProtocolVersion.MINECRAFT_1_20]],
    C2SStatusRequestPacket,
  );
  common.registerInPacket(
    api.Phase.STATUS,
    [[api.ProtocolVersion.MINECRAFT_1_13, 0x01, api.ProtocolVersion.MINECRAFT_1_20]],
    C2SPingRequestPacket,
  );

  common.registerOutPacket(
    api.Phase.STATUS,
    [[api.ProtocolVersion.MINECRAFT_1_13, 0x00, api.ProtocolVersion.MINECRAFT_1_20]],
    S2CStatusResponsePacket,
  );
  common.registerOutPacket(
    api.Phase.STATUS,
    [[api.ProtocolVersion.MINECRAFT_1_13, 0x01, api.ProtocolVersion.MINECRAFT_1_20]],
    S2CPingResponsePacket,
  );
}

{
  // Login
  common.registerInPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_13, 0x00, api.ProtocolVersion.MINECRAFT_1_20]],
    C2SLoginStartPacket,
  );
  common.registerInPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_19, 0x00, api.ProtocolVersion.MINECRAFT_1_19_1]],
    C2SLoginStart759Packet,
  );

  common.registerInPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_13, 0x01, api.ProtocolVersion.MINECRAFT_1_20]],
    C2SEncryptionResponsePacket,
  );
  common.registerInPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_19, 0x01, api.ProtocolVersion.MINECRAFT_1_19_1]],
    C2SEncryptionResponse759Packet,
  );

  common.registerOutPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_13, 0x00, api.ProtocolVersion.MINECRAFT_1_20]],
    S2CDisconnectPacket,
  );
  common.registerOutPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_13, 0x01, api.ProtocolVersion.MINECRAFT_1_20]],
    S2CEncryptionRequestPacket,
  );
  common.registerOutPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_13, 0x02, api.ProtocolVersion.MINECRAFT_1_20]],
    S2CLoginSuccessPacket,
  );
  common.registerOutPacket(
    api.Phase.LOGIN,
    [[api.ProtocolVersion.MINECRAFT_1_13, 0x03, api.ProtocolVersion.MINECRAFT_1_20]],
    S2CSetCompressionPacket,
  );
}

{
  // Play
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_13, 0x25, api.ProtocolVersion.MINECRAFT_1_13_2]],
    S2CJoinGame393Packet,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_14, 0x25, api.ProtocolVersion.MINECRAFT_1_14_4]],
    S2CJoinGame477Packet,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_15, 0x26, api.ProtocolVersion.MINECRAFT_1_15_2]],
    S2CJoinGame573Packet,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_16, 0x25, api.ProtocolVersion.MINECRAFT_1_16_1]],
    S2CJoinGame735Packet,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_16_2, 0x24],
      [api.ProtocolVersion.MINECRAFT_1_17, 0x26, api.ProtocolVersion.MINECRAFT_1_18],
    ],
    S2CJoinGame751Packet,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_18, 0x26, api.ProtocolVersion.MINECRAFT_1_18_2]],
    S2CJoinGame757Packet,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_19, 0x23],
      [api.ProtocolVersion.MINECRAFT_1_19_1, 0x25],
      [api.ProtocolVersion.MINECRAFT_1_19_3, 0x24],
      [api.ProtocolVersion.MINECRAFT_1_19_4, 0x28, api.ProtocolVersion.MINECRAFT_1_19_4],
    ],
    S2CJoinGame759Packet,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [[api.ProtocolVersion.MINECRAFT_1_20, 0x28, api.ProtocolVersion.MINECRAFT_1_20]],
    S2CJoinGame763Packet,
  );

  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_13, 0x2e],
      [api.ProtocolVersion.MINECRAFT_1_14, 0x31],
      [api.ProtocolVersion.MINECRAFT_1_15, 0x32],
      [api.ProtocolVersion.MINECRAFT_1_16, 0x31],
      [api.ProtocolVersion.MINECRAFT_1_16_2, 0x30],
      [api.ProtocolVersion.MINECRAFT_1_17, 0x32],
      [api.ProtocolVersion.MINECRAFT_1_19, 0x2f],
      [api.ProtocolVersion.MINECRAFT_1_19_1, 0x31],
      [api.ProtocolVersion.MINECRAFT_1_19_3, 0x30],
      [api.ProtocolVersion.MINECRAFT_1_19_4, 0x34, api.ProtocolVersion.MINECRAFT_1_20],
    ],
    S2CPlayerAbilitiesPacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_13, 0x32],
      [api.ProtocolVersion.MINECRAFT_1_14, 0x35],
      [api.ProtocolVersion.MINECRAFT_1_15, 0x36],
      [api.ProtocolVersion.MINECRAFT_1_16, 0x35],
      [api.ProtocolVersion.MINECRAFT_1_16_2, 0x34],
      [api.ProtocolVersion.MINECRAFT_1_17, 0x38],
      [api.ProtocolVersion.MINECRAFT_1_19, 0x36],
      [api.ProtocolVersion.MINECRAFT_1_19_1, 0x39],
      [api.ProtocolVersion.MINECRAFT_1_19_3, 0x38],
      [api.ProtocolVersion.MINECRAFT_1_19_4, 0x3c, api.ProtocolVersion.MINECRAFT_1_20],
    ],
    S2CSyncPlayerPositionPacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_13, 0x49],
      [api.ProtocolVersion.MINECRAFT_1_14, 0x4d],
      [api.ProtocolVersion.MINECRAFT_1_15, 0x4e],
      [api.ProtocolVersion.MINECRAFT_1_16, 0x42],
      [api.ProtocolVersion.MINECRAFT_1_17, 0x4b],
      [api.ProtocolVersion.MINECRAFT_1_19, 0x4a],
      [api.ProtocolVersion.MINECRAFT_1_19_1, 0x4d],
      [api.ProtocolVersion.MINECRAFT_1_19_3, 0x4c],
      [api.ProtocolVersion.MINECRAFT_1_19_4, 0x50, api.ProtocolVersion.MINECRAFT_1_20],
    ],
    S2CSetDefaultSpawnPositionPacket,
  );

  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_13, 0x30],
      [api.ProtocolVersion.MINECRAFT_1_14, 0x33],
      [api.ProtocolVersion.MINECRAFT_1_15, 0x34],
      [api.ProtocolVersion.MINECRAFT_1_16, 0x33],
      [api.ProtocolVersion.MINECRAFT_1_16_2, 0x32],
      [api.ProtocolVersion.MINECRAFT_1_17, 0x36],
      [api.ProtocolVersion.MINECRAFT_1_19, 0x34],
      [api.ProtocolVersion.MINECRAFT_1_19_1, 0x37, api.ProtocolVersion.MINECRAFT_1_19_1],
    ],
    S2CPlayerInfoUpdate393Packet,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_19_3, 0x36],
      [api.ProtocolVersion.MINECRAFT_1_19_4, 0x3a, api.ProtocolVersion.MINECRAFT_1_20],
    ],
    S2CPlayerInfoUpdatePacket,
  );

  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_13, 0x20],
      [api.ProtocolVersion.MINECRAFT_1_14, 0x1e],
      [api.ProtocolVersion.MINECRAFT_1_15, 0x1f],
      [api.ProtocolVersion.MINECRAFT_1_16, 0x1e],
      [api.ProtocolVersion.MINECRAFT_1_16_2, 0x1d],
      [api.ProtocolVersion.MINECRAFT_1_17, 0x1e],
      [api.ProtocolVersion.MINECRAFT_1_19, 0x1b],
      [api.ProtocolVersion.MINECRAFT_1_19_1, 0x1d],
      [api.ProtocolVersion.MINECRAFT_1_19_3, 0x1c],
      [api.ProtocolVersion.MINECRAFT_1_19_4, 0x1f, api.ProtocolVersion.MINECRAFT_1_20],
    ],
    S2CGameEventPacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_13, 0x22],
      [api.ProtocolVersion.MINECRAFT_1_14, 0x21],
      [api.ProtocolVersion.MINECRAFT_1_15, 0x22],
      [api.ProtocolVersion.MINECRAFT_1_16, 0x21],
      [api.ProtocolVersion.MINECRAFT_1_16_2, 0x20],
      [api.ProtocolVersion.MINECRAFT_1_17, 0x22],
      [api.ProtocolVersion.MINECRAFT_1_19, 0x1f],
      [api.ProtocolVersion.MINECRAFT_1_19_1, 0x21],
      [api.ProtocolVersion.MINECRAFT_1_19_3, 0x20],
      [api.ProtocolVersion.MINECRAFT_1_19_4, 0x24, api.ProtocolVersion.MINECRAFT_1_20],
    ],
    S2CChunkDataAndLightUpdatePacket,
  );
  common.registerOutPacket(
    api.Phase.PLAY,
    [
      [api.ProtocolVersion.MINECRAFT_1_13, 0x21],
      [api.ProtocolVersion.MINECRAFT_1_14, 0x20],
      [api.ProtocolVersion.MINECRAFT_1_15, 0x21],
      [api.ProtocolVersion.MINECRAFT_1_16, 0x20],
      [api.ProtocolVersion.MINECRAFT_1_16_2, 0x1f],
      [api.ProtocolVersion.MINECRAFT_1_17, 0x21],
      [api.ProtocolVersion.MINECRAFT_1_19, 0x1e],
      [api.ProtocolVersion.MINECRAFT_1_19_1, 0x20],
      [api.ProtocolVersion.MINECRAFT_1_19_3, 0x1f],
      [api.ProtocolVersion.MINECRAFT_1_19_4, 0x23, api.ProtocolVersion.MINECRAFT_1_20],
    ],
    S2CKeepAlivePacket,
  );
}
