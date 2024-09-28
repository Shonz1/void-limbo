/// <reference path="../global.d.ts" />

const { readFile } = require('fs/promises');
const crypto = require('node:crypto');
const { join } = require('node:path');
const { PassThrough } = require('node:stream');

const {
  S2CStatusResponsePacket,
  C2SStatusRequestPacket,
  C2SPingRequestPacket,
  S2CPingResponsePacket,
  S2CLoginSuccessPacket,
  C2SLoginStartPacket,
  C2SLoginAcknowledgedPacket,
  S2CRegistryDataPacket,
  S2CFinishConfigurationPacket,
  C2SFinishConfigurationPacket,
  S2CJoinGamePacket,
  S2CPlayerAbilitiesPacket,
  S2CSyncPlayerPositionPacket,
  S2CSetDefaultSpawnPositionPacket,
  S2CKeepAlivePacket,
  S2CEncryptionRequestPacket,
  C2SEncryptionResponsePacket,
  S2CDisconnectPacket,
  S2CPlayerInfoUpdatePacket,
  S2CGameEventPacket,
  S2CChunkDataAndLightUpdatePacket,
  C2SSetPlayerPositionAndRotationPacket,
  C2SSetPlayerPositionPacket,
  C2SSetPlayerRotationPacket,
  C2SSetPlayerOnGroundPacket,
  S2CSpawnEntityPacket,
  S2CUpdateEntityPositionPacket,
  S2CUpdateEntityRotationPacket,
  S2CUpdateEntityPositionAndRotationPacket,
  S2CPlayerInfoRemovePacket,
  S2CRemoveEntitiesPacket,
  S2CSetHeadRotationPacket,
} = require('./packets');
const { REGISTRY_MAP } = require('./registry');

const PROTOCOL_VERSION = 765;

const currentProtocolVersion = new network.ProtocolVersion({ version: PROTOCOL_VERSION, names: ['1.20.3', '1.20.4'] });

const createMinecraftStream = buffer => {
  const memoryStream = new PassThrough();
  memoryStream.end(buffer);

  return new network.MinecraftStream(memoryStream);
};

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

eventManager
  .subscribe('handshake-completed', async event => {
    const { connection } = event;

    if (connection.getProtocolVersion().compare(currentProtocolVersion) !== 0) {
      return;
    }

    const stream = connection.getStream();

    while (!stream.closed) {
      try {
        const packetSize = await stream.readVarIntAsync();
        const packetId = await stream.readVarIntAsync();

        const dataBuffer = await stream.readAsync(packetSize - network.getVarIntSize(packetId));
        const dataSize = dataBuffer?.length || 0;

        console.log(`[IN] 0x${packetId.toString(16).padStart(2, '0')} in phase ${network.Phase[connection.getPhase()]}`);

        const packetType = REGISTRY_MAP.get(network.Direction.SERVERBOUND)?.get(connection.getPhase())?.get(packetId);
        if (!packetType) {
          await eventManager.fire('packet-received', {
            connection,
            packetId,
            packet: null,
            stream: createMinecraftStream(dataBuffer),
            size: dataSize,
          });

          continue;
        }

        const packet = new packetType();
        await packet.decode(createMinecraftStream(dataBuffer), dataSize);

        await eventManager.fire('packet-received', {
          connection,
          packetId,
          packet,
          stream: createMinecraftStream(dataBuffer),
          size: dataSize,
        });
      } catch (err) {
        console.error(err);
      }
    }
  })
  .subscribe('packet-received', async event => {
    const { connection, packet } = event;

    if (connection.getProtocolVersion().compare(currentProtocolVersion) !== 0) {
      return;
    }

    if (packet instanceof C2SStatusRequestPacket) {
      const protocolVersion = connection.getProtocolVersion();

      await connection.send(
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
      await connection.send(new S2CPingResponsePacket({ payload: packet.payload }));
      connection.destroy();

      return;
    }

    if (packet instanceof C2SLoginStartPacket) {
      const gameProfile = new network.GameProfile({ uuid: packet.playerUuid, name: packet.playerName, properties: [] });

      connection.setGameProfile(gameProfile);

      await connection.send(
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

      const minecraftStream = connection.stream;
      const encryptedStream = new network.EncryptedStream(decryptedSecret, minecraftStream.stream);
      minecraftStream.stream = encryptedStream;

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

      const response = await fetch(configs.HAS_JOINED_URL + `?username=${connection.gameProfile.name}&serverId=${serverIdComplement}`);
      if (response.status === 204) {
        await connection.send(new S2CDisconnectPacket({ reason: JSON.stringify({ text: 'Offline player', color: 'red' }) }));
        return;
      }

      const responseJson = await response.json();

      const gameProfile = new network.GameProfile({ uuid: responseJson.id, name: responseJson.name, properties: responseJson.properties });
      connection.setGameProfile(gameProfile);

      await connection.send(
        new S2CLoginSuccessPacket({ playerUuid: gameProfile.uuid, playerName: gameProfile.name, properties: gameProfile.properties }),
      );
    }

    if (packet instanceof C2SLoginAcknowledgedPacket) {
      connection.setPhase(network.Phase.CONFIGURATION);

      await connection.send(
        new S2CRegistryDataPacket({ codec: await readFile(join(process.cwd(), 'data', PROTOCOL_VERSION.toString(), 'codec.dat')) }),
      );
      await connection.send(new S2CFinishConfigurationPacket());

      return;
    }

    if (packet instanceof C2SFinishConfigurationPacket) {
      connection.setPhase(network.Phase.PLAY);
      connection.setId();

      await connection.send(
        new S2CJoinGamePacket({
          entityId: connection.getId(),
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

      await connection.send(
        new S2CPlayerAbilitiesPacket({
          flags: 0x02,
          flyingSpeed: 0.1,
          fieldOfViewModifier: 0.1,
        }),
      );

      const positionAndRotation = connection.getPositionAndRotation();

      positionAndRotation.x = 24;
      positionAndRotation.y = 124;
      positionAndRotation.z = 24;
      positionAndRotation.yaw = 0;
      positionAndRotation.pitch = 0;

      await connection.send(
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

      for (const otherConnection of connection.constructor.getConnections()) {
        if (otherConnection === connection) {
          continue;
        }

        if (otherConnection.getPhase() === network.Phase.PLAY) {
          // Send current player to other players
          await eventManager.fire('send-spawn-entity', {
            connection: otherConnection,
            entityId: connection.getId(),
            gameProfile: connection.getGameProfile(),
            type: 'minecraft:player',
            position: positionAndRotation,
          });
        }

        // Send other players to current player
        await eventManager.fire('send-spawn-entity', {
          connection,
          entityId: otherConnection.getId(),
          gameProfile: otherConnection.getGameProfile(),
          type: 'minecraft:player',
          position: otherConnection.getPositionAndRotation(),
        });
      }

      await connection.send(
        new S2CSetDefaultSpawnPositionPacket({
          location: BigInt((0 & 0x3ffffff) << 38) | BigInt((0 & 0x3ffffff) << 12) | BigInt(65 & 0xfff),
          angle: 0,
        }),
      );

      // To fix skin
      await connection.send(
        new S2CPlayerInfoUpdatePacket({
          actions:
            S2CPlayerInfoUpdatePacket.ACTIONS.ADD_PLAYER |
            S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_GAMEMODE |
            S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_LISTED,

          players: [
            {
              uuid: connection.gameProfile.uuid,
              name: connection.gameProfile.name,
              properties: connection.gameProfile.properties,
              listed: true,
              gamemode: 0,
            },
          ],
        }),
      );

      // To disable loading screen without chunk loading
      await connection.send(new S2CGameEventPacket({ event: 13, value: 0 }));

      for (let i = -32; i <= 32; i++) {
        for (let j = -32; j <= 32; j++) {
          try {
            await connection.send(
              new S2CChunkDataAndLightUpdatePacket({
                buffer: await readFile(join(process.cwd(), 'data', PROTOCOL_VERSION.toString(), 'map', `chunk.${i}.${j}.dat`)),
              }),
            );
          } catch (err) {}
        }
      }

      const keepAliveInterval = setInterval(() => connection.send(new S2CKeepAlivePacket({ id: BigInt(Date.now()) })), 5000);

      const destroy = connection.destroy;
      connection.destroy = () => {
        clearInterval(keepAliveInterval);
        destroy.call(connection);
      };
    }

    if (packet instanceof C2SSetPlayerPositionAndRotationPacket) {
      await eventManager.fire('player-position-update', {
        connection,
        position: { x: packet.x, y: packet.y, z: packet.z, yaw: packet.yaw, pitch: packet.pitch, onGround: packet.onGround },
      });
    }

    if (packet instanceof C2SSetPlayerPositionPacket) {
      await eventManager.fire('player-position-update', {
        connection,
        position: { x: packet.x, y: packet.y, z: packet.z, onGround: packet.onGround },
      });
    }

    if (packet instanceof C2SSetPlayerRotationPacket) {
      await eventManager.fire('player-position-update', {
        connection,
        position: { yaw: packet.yaw, pitch: packet.pitch, onGround: packet.onGround },
      });
    }

    if (packet instanceof C2SSetPlayerOnGroundPacket) {
      await eventManager.fire('player-position-update', {
        connection,
        position: { onGround: packet.onGround },
      });
    }
  })
  .subscribe('send-spawn-entity', async event => {
    const { connection, entityId, gameProfile, type, position } = event;

    const registriesBin = await readFile(join(process.cwd(), 'data', PROTOCOL_VERSION.toString(), 'registries.json'));
    const registries = JSON.parse(registriesBin.toString('utf8'));
    const entityTypes = registries['minecraft:entity_type'];
    const currentEntityType = Object.entries(entityTypes.entries).find(([key]) => key === type);
    const currentEntityTypeId = currentEntityType?.[1]?.protocol_id ?? 0;

    await connection.send(
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

    await connection.send(
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
    const { connection, entityId, gameProfile } = event;

    if (gameProfile) {
      await connection.send(new S2CPlayerInfoRemovePacket({ players: [gameProfile.uuid] }));
    }

    await connection.send(new S2CRemoveEntitiesPacket({ entities: [entityId] }));
  })
  .subscribe('send-update-entity-position', async event => {
    const { connection, entityId, deltaX, deltaY, deltaZ, onGround } = event;

    await connection.send(new S2CUpdateEntityPositionPacket({ entityId, deltaX, deltaY, deltaZ, onGround }));
  })
  .subscribe('send-update-entity-rotation', async event => {
    const { connection, entityId, yaw, pitch, onGround } = event;

    await connection.send(
      new S2CUpdateEntityRotationPacket({
        entityId,
        yaw,
        pitch,
        onGround,
      }),
    );

    await connection.send(new S2CSetHeadRotationPacket({ entityId, headYaw: yaw }));
  })
  .subscribe('send-update-entity-position-and-rotation', async event => {
    const { connection, entityId, deltaX, deltaY, deltaZ, yaw, pitch, onGround } = event;

    await connection.send(
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

    await connection.send(new S2CSetHeadRotationPacket({ entityId, headYaw: yaw }));
  });
