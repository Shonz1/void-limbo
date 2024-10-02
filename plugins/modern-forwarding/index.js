/// <reference path="../global.d.ts" />

const { createHmac } = require('crypto');

const { S2CLoginPluginRequestPacket, C2SLoginPluginResponsePacket } = require('./packets');

api.eventManager.subscribe(
  'pre-login-complete',
  async event => {
    const { channel } = event;

    if (configs.FORWARDING_MODE !== 'modern') {
      return;
    }

    const protocolVersion = channel.getProtocolVersion();
    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_13) < 0) {
      return;
    }

    const messageId = Math.ceil(Math.random() * 0xffff);

    const memoryStream = new common.SimpleMemoryStream();
    new S2CLoginPluginRequestPacket({ messageId, channel: 'velocity:player_info', data: Buffer.alloc(0) }).encode(memoryStream);

    await channel.writeMessage(new common.MinecraftBinaryPacket(S2CLoginPluginRequestPacket.id, memoryStream));

    /** @type {C2SLoginPluginResponsePacket} */
    let loginPluginResponsePacket;

    while (!loginPluginResponsePacket) {
      const packet = await channel.readMessage();
      if (packet.id !== 0x02) {
        continue;
      }

      const parsedPacket = new C2SLoginPluginResponsePacket();
      await parsedPacket.decode(packet.stream, protocolVersion, packet.__size);

      if (parsedPacket.messageId !== messageId) {
        continue;
      }

      loginPluginResponsePacket = parsedPacket;
    }

    if (loginPluginResponsePacket.successful) {
      const data = loginPluginResponsePacket.data;
      const memoryStream = new common.SimpleMemoryStream(data);

      const signature = await memoryStream.read(32);

      const forwardedData = await memoryStream.read(data.length - 32);

      const mySignature = createHmac('sha256', Buffer.from(configs.MODERN_FORWARDING_SECRET, 'utf8')).update(forwardedData).digest('hex');

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
            signature: await forwardedDataMemoryStream.readBoolean().then(v => (v ? forwardedDataMemoryStream.readString() : undefined)),
          });
        }

        const player = channel.getAssociation();

        console.log('Setting game profile', playerUuid, playerName, properties);

        player.setGameProfile(
          new api.GameProfile({
            uuid: playerUuid,
            name: playerName,
            properties,
          }),
        );
      }
    }
  },
  api.EventPriority.HIGHEST,
);
