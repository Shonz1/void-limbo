class S2CPingResponsePacket extends network.PacketOut {
  static id = 0x01;

  payload;

  constructor({ payload }) {
    super();

    this.payload = payload;
  }

  async encode(stream) {
    stream.writeLong(this.payload);
  }

  getSize() {
    return 8;
  }

  toString() {
    return `S2CPingResponsePacket[payload=${this.payload}]`;
  }
}

module.exports = { S2CPingResponsePacket };
