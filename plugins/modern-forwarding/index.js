/// <reference path="../global.d.ts" />

const { createHmac } = require('node:crypto');
const { PassThrough } = require('node:stream');

const { S2CLoginPluginRequestPacket, S2CLoginSuccessPacket, C2SLoginPluginResponsePacket, C2SLoginStartPacket } = require('./packets');

eventManager
  .subscribe('phase-changed', async event => {
    const { connection, phase } = event;

    const protocolVersion = connection.getProtocolVersion();
    if (protocolVersion.getVersion() < 393) {
      return;
    }

    if (protocolVersion.getVersion() < 764) {
      console.log('Not implemented yet');
    }

    if (phase === network.Phase.CONFIGURATION) {
      return true;
    }
  })
  .subscribe(
    'packet-received',
    async event => {
      const { connection, packetId } = event;

      if (configs.FORWARDING_MODE !== 'modern') {
        return;
      }

      const protocolVersion = connection.getProtocolVersion();
      if (protocolVersion.getVersion() < 393) {
        return;
      }

      const phase = connection.getPhase();
      if (phase === network.Phase.LOGIN) {
        if (packetId === 0x00) {
          const packet = new C2SLoginStartPacket();
          await packet.decode(event.stream, event.size);

          const gameProfile = new network.GameProfile({ uuid: packet.playerUuid, name: packet.playerName, properties: [] });
          connection.setGameProfile(gameProfile);

          const messageId = Math.ceil(Math.random() * 0xffff);
          connection.modernForwardingMessageId = messageId;
          await connection.send(new S2CLoginPluginRequestPacket({ messageId, channel: 'velocity:player_info', data: Buffer.alloc(0) }));

          return true;
        }

        if (packetId === 0x02) {
          const packet = new C2SLoginPluginResponsePacket();
          await packet.decode(event.stream, event.size);

          const { messageId, successful, data } = packet;

          if (messageId === connection.modernForwardingMessageId) {
            if (successful) {
              const memoryStream = new PassThrough();
              memoryStream.end(data);
              const stream = new network.MinecraftStream(memoryStream);

              const signature = await stream.readAsync(32);

              const forwardedData = await stream.readAsync(data.length - 32);

              const mySignature = createHmac('sha256', Buffer.from(configs.MODERN_FORWARDING_SECRET, 'utf8'))
                .update(forwardedData)
                .digest('hex');

              if (signature.toString('hex') === mySignature) {
                const forwardedDataMemoryStream = new PassThrough();
                forwardedDataMemoryStream.end(forwardedData);
                const forwardedDataStream = new network.MinecraftStream(forwardedDataMemoryStream);

                await forwardedDataStream.readVarIntAsync(); // Forwarding version
                const remoteAddress = await forwardedDataStream.readStringAsync(); // IP address
                const playerUuid = await forwardedDataStream.readAsync(16).then(b => b.toString('hex'));
                const playerName = await forwardedDataStream.readStringAsync();
                const properties = [];

                const propertiesLength = await forwardedDataStream.readVarIntAsync();
                for (let i = 0; i < propertiesLength; i++) {
                  properties.push({
                    name: await forwardedDataStream.readStringAsync(),
                    value: await forwardedDataStream.readStringAsync(),
                    signature: await forwardedDataStream
                      .readBooleanAsync()
                      .then(v => (v ? forwardedDataStream.readStringAsync() : undefined)),
                  });
                }

                connection.setRemoteAddress(remoteAddress);
                connection.setGameProfile(
                  new network.GameProfile({
                    uuid: playerUuid,
                    name: playerName,
                    properties,
                  }),
                );
              }
            }

            const gameProfile = connection.getGameProfile();

            await connection.send(
              new S2CLoginSuccessPacket({ playerUuid: gameProfile.uuid, playerName: gameProfile.name, properties: gameProfile.properties }),
            );

            return true;
          }
        }
      }
    },
    EventPriority.HIGHEST,
  );
