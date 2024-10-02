class S2CSetDefaultSpawnPosition4Packet {
  x;
  y;
  z;

  constructor({ x, y, z }) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  async encode(stream) {
    stream.writeInt(this.x);
    stream.writeInt(this.y);
    stream.writeInt(this.z);
  }
}

module.exports = { S2CSetDefaultSpawnPosition4Packet };
