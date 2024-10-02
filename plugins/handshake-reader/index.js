/// <reference path="../global.d.ts" />

api.eventManager.subscribe(
  'connection-created',
  async event => {
    const { channel } = event;
    const stream = channel.head;

    const packetSize = await stream.readVarInt();
    if (packetSize === 0x00) {
      return;
    }

    await stream.readVarInt(); // Packet id
    const protocolVersion = await stream.readVarInt();
    const remoteAddress = await stream.readString();
    const remotePort = await stream.readShort();
    const nextState = await stream.readVarInt();

    const protocol = api.ProtocolVersion.get(protocolVersion);
    if (!protocol) {
      stream.destroy();
      return;
    }

    channel.add(new common.MinecraftPacketMessageStream(channel));

    channel.setRemoteAddress(remoteAddress);
    channel.setRemotePort(remotePort);
    channel.setProtocolVersion(protocol);
    channel.setPhase(nextState);

    await api.eventManager.fire('handshake-completed', { channel });
  },
  api.EventPriority.HIGH,
);
