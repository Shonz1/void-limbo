class S2CKeepAlivePacket {
  id;

  constructor({ id }) {
    this.id = id;
  }

  async encode(stream) {
    stream.writeLong(this.id);
  }
}

module.exports = { S2CKeepAlivePacket };
