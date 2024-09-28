const { readFile } = require('fs/promises');
const { PassThrough } = require('node:stream');
const { join } = require('path');

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
} = require('./packets');
const { REGISTRY_MAP } = require('./registry');

const currentProtocolVersion = new network.ProtocolVersion({ version: 764, names: ['1.20.2'] });

const createMinecraftStream = buffer => {
  const memoryStream = new PassThrough();
  memoryStream.end(buffer);

  return new network.MinecraftStream(memoryStream);
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
        new S2CLoginSuccessPacket({ playerUuid: gameProfile.uuid, playerName: gameProfile.name, properties: gameProfile.properties }),
      );

      return;
    }

    if (packet instanceof C2SLoginAcknowledgedPacket) {
      connection.setPhase(network.Phase.CONFIGURATION);
      await connection.send(new S2CRegistryDataPacket({ codec: await readFile(join(process.cwd(), 'data/codec_1_20.dat')) }));
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
          viewDistance: 0,
          simulationDistance: 0,
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
          flyingSpeed: 0,
          fieldOfViewModifier: 0.1,
        }),
      );

      await connection.send(
        new S2CSyncPlayerPositionPacket({
          x: 0,
          y: 400,
          z: 0,
          yaw: 0,
          pitch: 0,
          flags: 0x08,
          teleportId: 1,
        }),
      );

      await connection.send(
        new S2CSetDefaultSpawnPositionPacket({
          location: BigInt((0 & 0x3ffffff) << 38) | BigInt((0 & 0x3ffffff) << 12) | BigInt(400 & 0xfff),
          angle: 0,
        }),
      );

      const keepAliveInterval = setInterval(() => connection.send(new S2CKeepAlivePacket({ id: BigInt(Date.now()) })), 5000);

      const destroy = connection.destroy;
      connection.destroy = () => {
        clearInterval(keepAliveInterval);
        destroy.call(connection);
      };
    }
  });
