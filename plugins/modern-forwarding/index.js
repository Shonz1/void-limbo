/// <reference path="../global.d.ts" />

const { createHmac } = require('node:crypto');

const { S2CLoginPluginRequestPacket, S2CLoginSuccessPacket, C2SLoginPluginResponsePacket, C2SLoginStartPacket } = require('./packets');

api.eventManager
  .subscribe('phase-changed', async event => {
    const { channel, phase } = event;

    const protocolVersion = channel.getProtocolVersion();
    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_13) < 0) {
      return;
    }

    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_20_2) < 0) {
      console.log('Not implemented yet');
    }

    if (phase === api.Phase.CONFIGURATION) {
      return true;
    }
  })
  .subscribe(
    'packet-received',
    async event => {
      const { channel, packetId } = event;

      if (configs.FORWARDING_MODE !== 'modern') {
        return;
      }

      const protocolVersion = channel.getProtocolVersion();
      if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_13) < 0) {
        return;
      }

      const stream = event.getStream();

      const phase = channel.getPhase();
      if (phase === api.Phase.LOGIN) {
        if (packetId === 0x00) {
          const packet = new C2SLoginStartPacket();
          await packet.decode(stream, protocolVersion, event.size);

          const player = channel.getAssociation();

          const gameProfile = new api.GameProfile({ uuid: packet.playerUuid, name: packet.playerName, properties: [] });
          player.setGameProfile(gameProfile);

          const messageId = Math.ceil(Math.random() * 0xffff);
          channel.modernForwardingMessageId = messageId;

          const memoryStream = new common.SimpleMemoryStream();
          new S2CLoginPluginRequestPacket({ messageId, channel: 'velocity:player_info', data: Buffer.alloc(0) }).encode(memoryStream);

          await channel.writeMessage(new common.MinecraftBinaryPacket(S2CLoginPluginRequestPacket.id, memoryStream));

          return true;
        }

        if (packetId === 0x02) {
          const packet = new C2SLoginPluginResponsePacket();
          await packet.decode(stream, protocolVersion, event.size);

          const player = channel.getAssociation();

          const { messageId, successful, data } = packet;

          if (messageId === channel.modernForwardingMessageId) {
            if (successful) {
              const memoryStream = new common.SimpleMemoryStream(data);

              const signature = await memoryStream.read(32);

              const forwardedData = await memoryStream.read(data.length - 32);

              const mySignature = createHmac('sha256', Buffer.from(configs.MODERN_FORWARDING_SECRET, 'utf8'))
                .update(forwardedData)
                .digest('hex');

              if (signature.toString('hex') === mySignature) {
                const forwardedDataMemoryStream = new common.SimpleMemoryStream(forwardedData);
                await forwardedDataMemoryStream.readVarInt(); // Forwarding version
                await forwardedDataMemoryStream.readString(); // Remote address
                const playerUuid = await forwardedDataMemoryStream.read(16).then(b => b.toString('hex'));
                const playerName = await forwardedDataMemoryStream.readString();
                const properties = [];

                const propertiesLength = await forwardedDataMemoryStream.readVarInt();
                for (let i = 0; i < propertiesLength; i++) {
                  properties.push({
                    name: await forwardedDataMemoryStream.readString(),
                    value: await forwardedDataMemoryStream.readString(),
                    signature: await forwardedDataMemoryStream
                      .readBoolean()
                      .then(v => (v ? forwardedDataMemoryStream.readString() : undefined)),
                  });
                }

                player.setGameProfile(
                  new api.GameProfile({
                    uuid: playerUuid,
                    name: playerName,
                    properties,
                  }),
                );
              }
            }

            const gameProfile = player.getGameProfile();

            const memoryStream = new common.SimpleMemoryStream();
            new S2CLoginSuccessPacket({
              playerUuid: gameProfile.uuid,
              playerName: gameProfile.name,
              properties: gameProfile.properties,
            }).encode(memoryStream);

            await channel.writeMessage(new common.MinecraftBinaryPacket(S2CLoginSuccessPacket.id, memoryStream));

            return true;
          }
        }
      }
    },
    api.EventPriority.HIGHEST,
  );
