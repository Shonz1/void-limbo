const crypto = require('crypto');
const { readFile } = require('fs/promises');
const { join } = require('path');

const {
  S2CJoinGamePacket,
  S2CPlayerAbilitiesPacket,
  S2CSyncPlayerPositionPacket,
  S2CSetDefaultSpawnPositionPacket,
  S2CPlayerInfoUpdatePacket,
  S2CGameEventPacket,
  S2CChunkDataAndLightUpdatePacket,
  S2CKeepAlivePacket,
  C2SSetPlayerOnGroundPacket,
  C2SSetPlayerRotationPacket,
  C2SSetPlayerPositionPacket,
  C2SSetPlayerPositionAndRotationPacket,
  S2CPlayerInfoRemovePacket,
  S2CRemoveEntitiesPacket,
  S2CUpdateEntityPositionPacket,
  S2CUpdateEntityRotationPacket,
  S2CSetHeadRotationPacket,
  S2CUpdateEntityPositionAndRotationPacket,
  S2CSpawnEntityPacket,
} = require('../.protocol-765-support/packets');

const { C2SFinishConfigurationPacket } = require('./packets/inbound/configuration/finish-configuration');
const { C2SEncryptionResponsePacket } = require('./packets/inbound/login/encryption-response');
const { C2SLoginAcknowledgedPacket } = require('./packets/inbound/login/login-acknowledged');
const { C2SLoginStartPacket } = require('./packets/inbound/login/login-start');
const { C2SPingRequestPacket } = require('./packets/inbound/status/ping-request');
const { C2SStatusRequestPacket } = require('./packets/inbound/status/status-request');
const { S2CFinishConfigurationPacket } = require('./packets/outbound/configuration/finish-configuration');
const { S2CRegistryDataPacket } = require('./packets/outbound/configuration/registry-data');
const { S2CDisconnectPacket } = require('./packets/outbound/login/disconnect');
const { S2CEncryptionRequestPacket } = require('./packets/outbound/login/encryption-request');
const { S2CLoginSuccessPacket } = require('./packets/outbound/login/login-success');
const { S2CSetCompressionPacket } = require('./packets/outbound/login/set-compression');
const { S2CPingResponsePacket } = require('./packets/outbound/status/ping-response');
const { S2CStatusResponsePacket } = require('./packets/outbound/status/status-response');

require('./registries');

const twosComplement = data => {
  let carry = true;
  for (let i = data.length - 1; i >= 0; i--) {
    data[i] = ~data[i] & 0xff;
    if (carry) {
      carry = data[i] === 0xff;
      data[i]++;
    }
  }
  return data;
};

api.eventManager
  .subscribe('handshake-completed', async event => {
    const { channel } = event;

    if (channel.getProtocolVersion().compare(api.ProtocolVersion.MINECRAFT_1_20_2) < 0) {
      return;
    }

    channel.add(new common.MinecraftPacketMessageStream(channel));

    while (!channel.closed) {
      await channel.readMessage();
    }
  })
  .subscribe('packet-received', async event => {
    const { channel, packet } = event;
    const player = channel.getAssociation();

    if (packet instanceof C2SStatusRequestPacket) {
      const protocolVersion = channel.getProtocolVersion();

      await channel.writeMessage(
        new S2CStatusResponsePacket({
          response: JSON.stringify({
            version: {
              name: protocolVersion.getNames().at(-1),
              protocol: protocolVersion.getVersion(),
            },
            players: { max: 100, online: 0 },
            description: { text: 'Void Limbo' },
          }),
        }),
      );

      return;
    }

    if (packet instanceof C2SPingRequestPacket) {
      await channel.writeMessage(new S2CPingResponsePacket({ payload: packet.payload }));
    }

    if (packet instanceof C2SLoginStartPacket) {
      const gameProfile = new api.GameProfile({ uuid: packet.playerUuid, name: packet.playerName, properties: [] });
      channel.getAssociation().setGameProfile(gameProfile);

      await channel.writeMessage(
        new S2CEncryptionRequestPacket({
          serverId: '',
          publicKey: configs.PUBLIC_KEY,
          verifyToken: crypto.randomBytes(4),
        }),
      );

      return;
    }

    if (packet instanceof C2SEncryptionResponsePacket) {
      const decryptedSecret = crypto.privateDecrypt(
        {
          key: configs.PRIVATE_KEY,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        packet.sharedSecret,
      );

      channel.addBefore(common.MinecraftPacketMessageStream, new common.AesCfb8EncryptionStream(decryptedSecret));

      let serverId = crypto
        .createHash('sha1')
        .update(Buffer.concat([decryptedSecret, configs.PUBLIC_KEY]))
        .digest();

      const isNegative = (serverId[0] & 0x80) === 0x80;
      if (isNegative) {
        serverId = twosComplement(Buffer.from(serverId));
      }

      let serverIdComplement = serverId.toString('hex').replace(/^0+/, '');
      if (isNegative) {
        serverIdComplement = '-' + serverIdComplement;
      }

      const response = await fetch(configs.HAS_JOINED_URL + `?username=${player.getGameProfile().name}&serverId=${serverIdComplement}`);
      if (response.status === 204) {
        await channel.writeMessage(new S2CDisconnectPacket({ reason: JSON.stringify({ text: 'Offline player', color: 'red' }) }));
        return;
      }

      const responseJson = await response.json();

      const gameProfile = new api.GameProfile({ uuid: responseJson.id, name: responseJson.name, properties: responseJson.properties });
      player.setGameProfile(gameProfile);

      await channel.writeMessage(new S2CSetCompressionPacket({ threshold: configs.COMPRESSION_THRESHOLD }));
      channel.addBefore(common.MinecraftPacketMessageStream, new common.ZlibCompressionStream(configs.COMPRESSION_THRESHOLD));

      await channel.writeMessage(
        new S2CLoginSuccessPacket({ playerUuid: gameProfile.uuid, playerName: gameProfile.name, properties: gameProfile.properties }),
      );
    }

    if (packet instanceof C2SLoginAcknowledgedPacket) {
      channel.setPhase(api.Phase.CONFIGURATION);

      await channel.writeMessage(
        new S2CRegistryDataPacket({
          codec: await readFile(join(process.cwd(), 'data', channel.getProtocolVersion().getVersion().toString(), 'codec.dat')),
        }),
      );
      await channel.writeMessage(new S2CFinishConfigurationPacket());

      return;
    }

    if (packet instanceof C2SFinishConfigurationPacket) {
      channel.setPhase(api.Phase.PLAY);

      player.initId();

      await api.eventManager.fire('player-join', { player });
    }

    if (packet instanceof C2SSetPlayerPositionAndRotationPacket) {
      await api.eventManager.fire('player-position-update', {
        player,
        position: { x: packet.x, y: packet.y, z: packet.z, yaw: packet.yaw, pitch: packet.pitch, onGround: packet.onGround },
      });
    }

    if (packet instanceof C2SSetPlayerPositionPacket) {
      await api.eventManager.fire('player-position-update', {
        player,
        position: { x: packet.x, y: packet.y, z: packet.z, onGround: packet.onGround },
      });
    }

    if (packet instanceof C2SSetPlayerRotationPacket) {
      await api.eventManager.fire('player-position-update', {
        player,
        position: { yaw: packet.yaw, pitch: packet.pitch, onGround: packet.onGround },
      });
    }

    if (packet instanceof C2SSetPlayerOnGroundPacket) {
      await api.eventManager.fire('player-position-update', {
        player,
        position: { onGround: packet.onGround },
      });
    }
  })
  .subscribe('player-join', async event => {
    const { player } = event;
    const channel = player.getChannel();
    const gameProfile = player.getGameProfile();

    console.log(`${gameProfile.name} joined the game`);

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
        dimensionType: 'minecraft:overworld',
        dimensionName: 'minecraft:overworld',
        hashedSeed: 0n,
        gameMode: 2,
        previousGameMode: -1,
        isDebug: false,
        isFlat: false,
        portalCooldown: 0,
      }),
    );

    await channel.writeMessage(
      new S2CPlayerAbilitiesPacket({
        flags: 0x02,
        flyingSpeed: 0.1,
        fieldOfViewModifier: 0.1,
      }),
    );

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

    for (const otherPlayer of api.Player.getPlayers()) {
      if (otherPlayer === player) {
        continue;
      }

      const otherChannel = otherPlayer.getChannel();

      if (otherChannel.getPhase() === api.Phase.PLAY) {
        // Send current player to other players
        await api.eventManager.fire('send-spawn-entity', {
          channel: otherChannel,
          entityId: player.getId(),
          gameProfile: player.getGameProfile(),
          type: 'minecraft:player',
          position: positionAndRotation,
        });
      }

      // Send other players to current player
      await api.eventManager.fire('send-spawn-entity', {
        channel,
        entityId: otherPlayer.getId(),
        gameProfile: otherPlayer.getGameProfile(),
        type: 'minecraft:player',
        position: otherPlayer.getPositionAndRotation(),
      });
    }

    await channel.writeMessage(
      new S2CSetDefaultSpawnPositionPacket({
        location: BigInt((0 & 0x3ffffff) << 38) | BigInt((0 & 0x3ffffff) << 12) | BigInt(65 & 0xfff),
        angle: 0,
      }),
    );

    // To fix skin
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

    // To disable loading screen without chunk loading
    await channel.writeMessage(new S2CGameEventPacket({ event: 13, value: 0 }));

    for (let i = -32; i <= 32; i++) {
      for (let j = -32; j <= 32; j++) {
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

    const keepAliveInterval = setInterval(() => channel.writeMessage(new S2CKeepAlivePacket({ id: BigInt(Date.now()) })), 5000);

    const destroy = channel.destroy;
    channel.destroy = () => {
      clearInterval(keepAliveInterval);
      destroy.call(channel);
    };
  })
  .subscribe('send-spawn-entity', async event => {
    const { channel, entityId, gameProfile, type, position } = event;

    const registriesBin = await readFile(
      join(process.cwd(), 'data', channel.getProtocolVersion().getVersion().toString(), 'registries.json'),
    );
    const registries = JSON.parse(registriesBin.toString('utf8'));
    const entityTypes = registries['minecraft:entity_type'];
    const currentEntityType = Object.entries(entityTypes.entries).find(([key]) => key === type);
    const currentEntityTypeId = currentEntityType?.[1]?.protocol_id ?? 0;

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

    await channel.writeMessage(
      new S2CSpawnEntityPacket({
        entityId,
        entityUuid: gameProfile.uuid,
        type: currentEntityTypeId,
        x: position.x,
        y: position.y,
        z: position.z,
        pitch: Math.round((position.pitch * 256) / 360) & 0xff,
        yaw: Math.round((position.yaw * 256) / 360) & 0xff,
        headYaw: Math.round((position.yaw * 256) / 360) & 0xff,
        data: 0,
        velocityX: 0,
        velocityY: 0,
        velocityZ: 0,
      }),
    );
  })
  .subscribe('send-remove-entity', async event => {
    const { channel, entityId, gameProfile } = event;

    if (gameProfile) {
      await channel.writeMessage(new S2CPlayerInfoRemovePacket({ players: [gameProfile.uuid] }));
    }

    await channel.writeMessage(new S2CRemoveEntitiesPacket({ entities: [entityId] }));
  })
  .subscribe('send-update-entity-position', async event => {
    const { channel, entityId, deltaX, deltaY, deltaZ, onGround } = event;

    await channel.writeMessage(new S2CUpdateEntityPositionPacket({ entityId, deltaX, deltaY, deltaZ, onGround }));
  })
  .subscribe('send-update-entity-rotation', async event => {
    const { channel, entityId, yaw, pitch, onGround } = event;

    await channel.writeMessage(
      new S2CUpdateEntityRotationPacket({
        entityId,
        yaw,
        pitch,
        onGround,
      }),
    );

    await channel.writeMessage(new S2CSetHeadRotationPacket({ entityId, headYaw: yaw }));
  })
  .subscribe('send-update-entity-position-and-rotation', async event => {
    const { channel, entityId, deltaX, deltaY, deltaZ, yaw, pitch, onGround } = event;

    await channel.writeMessage(
      new S2CUpdateEntityPositionAndRotationPacket({
        entityId,
        deltaX,
        deltaY,
        deltaZ,
        yaw,
        pitch,
        onGround,
      }),
    );

    await channel.writeMessage(new S2CSetHeadRotationPacket({ entityId, headYaw: yaw }));
  });
