class S2CSetDefaultSpawnPositionPacket extends network.PacketOut {
  static id = 0x52;

  location;
  angle;

  constructor({ location, angle }) {
    super();

    this.location = location;
    this.angle = angle;
  }

  async encode(stream) {
    stream.writeLong(this.location);
    stream.writeFloat(this.angle);
  }

  getSize() {
    let size = 0;

    size += 8; // location
    size += 4; // angle

    return size;
  }

  toString() {
    return `S2CSetDefaultSpawnPositionPacket{location=${this.location}, angle=${this.angle}}`;
  }
}

module.exports = { S2CSetDefaultSpawnPositionPacket };
