/// <reference path='../../global.d.ts' />

const { readFile } = require('fs/promises');
const { join } = require('path');

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

class PlayService {
  constructor() {
    api.eventManager.subscribe('phase-changed', event => this.onPhaseChanged(event));
  }

  async onPhaseChanged(event) {
    const { channel, phase } = event;
    if (phase !== api.Phase.PLAY) {
      return;
    }

    const protocolVersion = channel.getProtocolVersion();
    if (
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_13) < 0 ||
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_20_2) >= 0
    ) {
      return;
    }

    const player = channel.getAssociation();
    player.initId();

    const cancelled = await api.eventManager.fire('player-join', { player });
    if (cancelled) {
      return;
    }

    await this.sendJoinGame(channel, player, protocolVersion);
    await this.sendPlayerAbilities(channel);
    await this.syncPlayerPosition(channel, player);
    await this.setDefaultSpawnPosition(channel);
    await this.sendPlayerInfo(channel, player, protocolVersion);
    await this.disableChunkWaiting(channel);
    await this.sendChunks(channel);

    await this.startKeepAlive(channel);
  }

  async sendJoinGame(channel, player, protocolVersion) {
    if (
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_13) >= 0 &&
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_13_2) <= 0
    ) {
      await channel.writeMessage(
        new S2CJoinGame393Packet({
          entityId: player.getId(),
          gamemode: 2,
          dimension: 0,
          difficulty: 0,
          maxPlayers: 100,
          levelType: 'default',
          reducedDebugInfo: false,
        }),
      );
    } else if (
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_14) >= 0 &&
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_14_4) <= 0
    ) {
      await channel.writeMessage(
        new S2CJoinGame477Packet({
          entityId: player.getId(),
          gamemode: 2,
          dimension: 0,
          maxPlayers: 100,
          levelType: 'default',
          viewDistance: 10,
          reducedDebugInfo: false,
        }),
      );
    } else if (
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_15) >= 0 &&
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_15_2) <= 0
    ) {
      await channel.writeMessage(
        new S2CJoinGame573Packet({
          entityId: player.getId(),
          gamemode: 2,
          dimension: 0,
          hashedSeed: 0n,
          maxPlayers: 100,
          levelType: 'default',
          viewDistance: 10,
          reducedDebugInfo: false,
          enableRespawnScreen: false,
        }),
      );
    } else if (
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_16) >= 0 &&
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_16_1) <= 0
    ) {
      await channel.writeMessage(
        new S2CJoinGame735Packet({
          entityId: player.getId(),
          gamemode: 2,
          previousGamemode: 2,
          worldNames: ['minecraft:overworld'],
          dimensionCodec: await readFile(
            join(process.cwd(), 'data', 'registries', channel.getProtocolVersion().getVersion().toString(), '0.dat'),
          ),
          dimension: 'minecraft:overworld',
          worldName: 'minecraft:overworld',
          hashedSeed: 0n,
          maxPlayers: 100,
          viewDistance: 10,
          reducedDebugInfo: false,
          enableRespawnScreen: false,
          isDebug: false,
          isFlat: false,
        }),
      );
    } else if (
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_16_2) >= 0 &&
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_17_1) <= 0
    ) {
      await channel.writeMessage(
        new S2CJoinGame751Packet({
          entityId: player.getId(),
          isHardcore: false,
          gamemode: 2,
          previousGamemode: 2,
          worldNames: ['minecraft:overworld'],
          dimensionCodec: await readFile(
            join(process.cwd(), 'data', 'registries', channel.getProtocolVersion().getVersion().toString(), '0.dat'),
          ),
          dimension: await readFile(
            join(process.cwd(), 'data', 'registries', channel.getProtocolVersion().getVersion().toString(), '1.dat'),
          ),
          worldName: 'minecraft:overworld',
          hashedSeed: 0n,
          maxPlayers: 100,
          viewDistance: 10,
          reducedDebugInfo: false,
          enableRespawnScreen: false,
          isDebug: false,
          isFlat: false,
        }),
      );
    } else if (
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_18) >= 0 &&
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_18_2) <= 0
    ) {
      await channel.writeMessage(
        new S2CJoinGame757Packet({
          entityId: player.getId(),
          isHardcore: false,
          gamemode: 2,
          previousGamemode: 2,
          worldNames: ['minecraft:overworld'],
          dimensionCodec: await readFile(
            join(process.cwd(), 'data', 'registries', channel.getProtocolVersion().getVersion().toString(), '0.dat'),
          ),
          dimension: await readFile(
            join(process.cwd(), 'data', 'registries', channel.getProtocolVersion().getVersion().toString(), '1.dat'),
          ),
          worldName: 'minecraft:overworld',
          hashedSeed: 0n,
          maxPlayers: 100,
          viewDistance: 10,
          simulationDistance: 10,
          reducedDebugInfo: false,
          enableRespawnScreen: false,
          isDebug: false,
          isFlat: false,
        }),
      );
    } else if (
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_19) >= 0 &&
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_19_4) <= 0
    ) {
      await channel.writeMessage(
        new S2CJoinGame759Packet({
          entityId: player.getId(),
          isHardcore: false,
          gamemode: 2,
          previousGamemode: 2,
          worldNames: ['minecraft:overworld'],
          dimensionCodec: await readFile(
            join(process.cwd(), 'data', 'registries', channel.getProtocolVersion().getVersion().toString(), '0.dat'),
          ),
          dimension: 'minecraft:overworld',
          worldName: 'minecraft:overworld',
          hashedSeed: 0n,
          maxPlayers: 100,
          viewDistance: 10,
          simulationDistance: 10,
          reducedDebugInfo: false,
          enableRespawnScreen: false,
          isDebug: false,
          isFlat: false,
        }),
      );
    } else {
      await channel.writeMessage(
        new S2CJoinGame763Packet({
          entityId: player.getId(),
          isHardcore: false,
          gamemode: 2,
          previousGamemode: 2,
          worldNames: ['minecraft:overworld'],
          dimensionCodec: await readFile(
            join(process.cwd(), 'data', 'registries', channel.getProtocolVersion().getVersion().toString(), '0.dat'),
          ),
          dimension: 'minecraft:overworld',
          worldName: 'minecraft:overworld',
          hashedSeed: 0n,
          maxPlayers: 100,
          viewDistance: 10,
          simulationDistance: 10,
          reducedDebugInfo: false,
          enableRespawnScreen: false,
          isDebug: false,
          isFlat: false,
          portalCooldown: 0,
        }),
      );
    }
  }

  async sendPlayerAbilities(channel) {
    await channel.writeMessage(
      new S2CPlayerAbilitiesPacket({
        flags: 0x02,
        flyingSpeed: 0.1,
        fieldOfViewModifier: 0.1,
      }),
    );
  }

  async syncPlayerPosition(channel, player) {
    const positionAndRotation = player.getPositionAndRotation();

    positionAndRotation.x = 24;
    positionAndRotation.y = 124;
    positionAndRotation.z = 24;
    positionAndRotation.yaw = 0;
    positionAndRotation.pitch = 0;

    await channel.writeMessage(
      new S2CSyncPlayerPositionPacket({
        x: positionAndRotation.x,
        y: positionAndRotation.y,
        z: positionAndRotation.z,
        yaw: positionAndRotation.yaw,
        pitch: positionAndRotation.pitch,
        flags: 0x08,
        teleportId: 1,
      }),
    );
  }

  async setDefaultSpawnPosition(channel) {
    await channel.writeMessage(
      new S2CSetDefaultSpawnPositionPacket({
        location: BigInt((0 & 0x3ffffff) << 38) | BigInt((0 & 0x3ffffff) << 12) | BigInt(65 & 0xfff),
        angle: 0,
      }),
    );
  }

  async sendPlayerInfo(channel, player, protocolVersion) {
    const gameProfile = player.getGameProfile();

    if (
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_13) >= 0 &&
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_19_1) <= 0
    ) {
      await channel.writeMessage(
        new S2CPlayerInfoUpdate393Packet({
          action: S2CPlayerInfoUpdate393Packet.ACTIONS.ADD_PLAYER,
          players: [
            {
              uuid: gameProfile.uuid,
              name: gameProfile.name,
              properties: gameProfile.properties,
              gamemode: 0,
              ping: 0,
              displayName: null,
            },
          ],
        }),
      );
    } else {
      await channel.writeMessage(
        new S2CPlayerInfoUpdatePacket({
          actions:
            S2CPlayerInfoUpdatePacket.ACTIONS.ADD_PLAYER |
            S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_GAMEMODE |
            S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_LISTED,

          players: [
            {
              uuid: gameProfile.uuid,
              name: gameProfile.name,
              properties: gameProfile.properties,
              listed: true,
              gamemode: 0,
            },
          ],
        }),
      );
    }
  }

  async disableChunkWaiting(channel) {
    await channel.writeMessage(new S2CGameEventPacket({ event: 13, value: 0 }));
  }

  async sendChunks() {
    // for (let i = -8; i <= 8; i++) {
    //   for (let j = -8; j <= 8; j++) {
    //     try {
    //       await channel.writeMessage(
    //         new S2CChunkDataAndLightUpdatePacket({
    //           buffer: await readFile(
    //             join(process.cwd(), 'data', channel.getProtocolVersion().getVersion().toString(), 'map', `chunk.${i}.${j}.dat`),
    //           ),
    //         }),
    //       );
    //     } catch (err) {}
    //   }
    // }
  }

  async startKeepAlive(channel) {
    const keepAliveInterval = setInterval(() => channel.writeMessage(new S2CKeepAlivePacket({ id: BigInt(Date.now()) })), 5000);

    const destroy = channel.destroy;
    channel.destroy = () => {
      clearInterval(keepAliveInterval);
      destroy.call(channel);
    };
  }
}

module.exports = { PlayService };
