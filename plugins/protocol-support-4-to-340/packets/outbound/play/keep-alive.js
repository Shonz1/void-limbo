class S2CKeepAlivePacket {
  id;

  constructor({ id }) {
    this.id = id;
  }

  async encode(stream, protocolVersion) {
    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_12_2) < 0) {
      stream.writeVarInt(Number(this.id));
    } else {
      stream.writeLong(this.id);
    }
  }
}

module.exports = { S2CKeepAlivePacket };
