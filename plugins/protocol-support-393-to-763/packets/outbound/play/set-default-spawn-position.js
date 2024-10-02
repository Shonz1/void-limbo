class S2CSetDefaultSpawnPositionPacket {
  location;
  angle;

  constructor({ location, angle }) {
    this.location = location;
    this.angle = angle;
  }

  async encode(stream, protocolVersion) {
    stream.writeLong(this.location);

    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_17) >= 0) {
      stream.writeFloat(this.angle);
    }
  }
}

module.exports = { S2CSetDefaultSpawnPositionPacket };
