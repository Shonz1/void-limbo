class S2CSetDefaultSpawnPositionPacket {
  location;
  angle;

  constructor({ location, angle }) {
    this.location = location;
    this.angle = angle;
  }

  async encode(stream) {
    stream.writeLong(this.location);
    stream.writeFloat(this.angle);
  }
}

module.exports = { S2CSetDefaultSpawnPositionPacket };
