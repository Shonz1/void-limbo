/// <reference path='../../global.d.ts' />

const { readFile } = require('fs/promises');
const { join } = require('path');

const { S2CChunkDataAndLightUpdatePacket } = require('../packets/outbound/play/chunk-data-and-light-update');
const { S2CGameEventPacket } = require('../packets/outbound/play/game-event');
const { S2CJoinGamePacket } = require('../packets/outbound/play/join-game');
const { S2CKeepAlivePacket } = require('../packets/outbound/play/keep-alive');
const { S2CPlayerAbilitiesPacket } = require('../packets/outbound/play/player-abilities');
const { S2CPlayerInfoUpdatePacket } = require('../packets/outbound/play/player-info-update');
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
    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_20_2) < 0) {
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
    await this.sendPlayerInfo(channel, player);
    await this.disableChunkWaiting(channel);
    await this.sendChunks(channel);

    await this.startKeepAlive(channel);
  }

  async sendJoinGame(channel, player, protocolVersion) {
    const dimensionType = protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_20_5) < 0 ? 'minecraft:overworld' : 0;

    await channel.writeMessage(
      new S2CJoinGamePacket({
        entityId: player.getId(),
        isHardcore: false,
        dimensions: ['minecraft:overworld'],
        maxPlayers: 100,
        viewDistance: 10,
        simulationDistance: 10,
        reducedDebugInfo: false,
        enableRespawnScreen: true,
        doLimitedCrafting: false,
        dimensionType,
        dimensionName: 'minecraft:overworld',
        hashedSeed: 0n,
        gameMode: 2,
        previousGameMode: -1,
        isDebug: false,
        isFlat: false,
        portalCooldown: 0,
        enforcedSecureChat: false,
      }),
    );
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

  async sendPlayerInfo(channel, player) {
    const gameProfile = player.getGameProfile();

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

  async disableChunkWaiting(channel) {
    await channel.writeMessage(new S2CGameEventPacket({ event: 13, value: 0 }));
  }

  async sendChunks(channel) {
    for (let i = -8; i <= 8; i++) {
      for (let j = -8; j <= 8; j++) {
        try {
          await channel.writeMessage(
            new S2CChunkDataAndLightUpdatePacket({
              buffer: await readFile(
                join(process.cwd(), 'data', channel.getProtocolVersion().getVersion().toString(), 'map', `chunk.${i}.${j}.dat`),
              ),
            }),
          );
        } catch (err) {}
      }
    }
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
