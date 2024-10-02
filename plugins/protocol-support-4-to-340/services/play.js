/// <reference path='../../global.d.ts' />

const { S2CGameEventPacket } = require('../packets/outbound/play/game-event');
const { S2CJoinGamePacket } = require('../packets/outbound/play/join-game');
const { S2CKeepAlivePacket } = require('../packets/outbound/play/keep-alive');
const { S2CPlayerAbilitiesPacket } = require('../packets/outbound/play/player-abilities');
const { S2CPlayerInfoUpdatePacket } = require('../packets/outbound/play/player-info-update');
const { S2CPlayerInfoUpdate4Packet } = require('../packets/outbound/play/player-info-update-4');
const { S2CSetDefaultSpawnPositionPacket } = require('../packets/outbound/play/set-default-spawn-position');
const { S2CSetDefaultSpawnPosition4Packet } = require('../packets/outbound/play/set-default-spawn-position-4');
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
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_7_2) < 0 ||
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_12_2) > 0
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
    await this.setDefaultSpawnPosition(channel, protocolVersion);
    await this.sendPlayerInfo(channel, player, protocolVersion);
    await this.disableChunkWaiting(channel);
    await this.sendChunks(channel);

    await this.startKeepAlive(channel);
  }

  async sendJoinGame(channel, player) {
    await channel.writeMessage(
      new S2CJoinGamePacket({
        entityId: player.getId(),
        gamemode: 2,
        dimension: 0,
        difficulty: 0,
        maxPlayers: 100,
        levelType: 'default',
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
      }),
    );
  }

  async setDefaultSpawnPosition(channel, protocolVersion) {
    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_8) < 0) {
      await channel.writeMessage(
        new S2CSetDefaultSpawnPosition4Packet({
          x: 0,
          y: 65,
          z: 0,
        }),
      );
    } else {
      await channel.writeMessage(
        new S2CSetDefaultSpawnPositionPacket({
          location: BigInt((0 & 0x3ffffff) << 38) | BigInt((0 & 0x3ffffff) << 12) | BigInt(65 & 0xfff),
        }),
      );
    }
  }

  async sendPlayerInfo(channel, player, protocolVersion) {
    const gameProfile = player.getGameProfile();

    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_8) < 0) {
      await channel.writeMessage(
        new S2CPlayerInfoUpdate4Packet({
          playerName: gameProfile.name,
          online: true,
          ping: 0,
        }),
      );
    } else {
      await channel.writeMessage(
        new S2CPlayerInfoUpdatePacket({
          action: 0,
          players: [
            {
              uuid: gameProfile.uuid,
              name: gameProfile.name,
              properties: gameProfile.properties,
              gamemode: 2,
              ping: 0,
              displayName: null,
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
