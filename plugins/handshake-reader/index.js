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
    await stream.readString(); // remoteAddress
    await stream.readShort(); // remotePort
    const nextState = await stream.readVarInt();

    const protocol = api.ProtocolVersion.get(protocolVersion);
    if (!protocol) {
      stream.destroy();
      return;
    }

    channel.setProtocolVersion(protocol);
    channel.setPhase(nextState);

    await api.eventManager.fire('handshake-completed', { channel });
  },
  api.EventPriority.HIGH,
);
