eventManager.subscribe(
  'connection-created',
  async event => {
    const { connection } = event;
    const stream = connection.getStream();

    const packetSize = await stream.readVarIntAsync();
    if (packetSize === 0x00) {
      return false;
    }

    await stream.readVarIntAsync(); // Packet id
    const protocolVersion = await stream.readVarIntAsync();
    const remoteAddress = await stream.readStringAsync();
    const remotePort = await stream.readShortAsync();
    const nextState = await stream.readVarIntAsync();

    connection.setProtocolVersion(network.ProtocolVersion.get(protocolVersion));
    connection.setRemoteAddress(remoteAddress);
    connection.setRemotePort(remotePort);
    connection.setPhase(nextState);

    await eventManager.fire('handshake-completed', { connection });

    return true;
  },
  EventPriority.HIGH,
);
