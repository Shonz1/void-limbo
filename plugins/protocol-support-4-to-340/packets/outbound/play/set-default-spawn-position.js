class S2CSetDefaultSpawnPositionPacket {
  location;

  constructor({ location }) {
    this.location = location;
  }

  async encode(stream) {
    stream.writeLong(this.location);
  }
}

module.exports = { S2CSetDefaultSpawnPositionPacket };
