class S2CPingResponsePacket {
  payload;

  constructor({ payload }) {
    this.payload = payload;
  }

  async encode(stream) {
    stream.writeLong(this.payload);
  }
}

module.exports = { S2CPingResponsePacket };
