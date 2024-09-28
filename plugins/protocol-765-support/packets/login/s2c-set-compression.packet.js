class S2CSetCompressionPacket extends network.PacketOut {
  static id = 0x03;

  threshold;

  constructor({ threshold }) {
    super();

    this.threshold = threshold;
  }

  async encode(stream) {
    stream.writeVarInt(this.threshold);
  }

  getSize() {
    let size = 0;

    size += network.getVarIntSize(this.threshold);

    return size;
  }

  toString() {
    return `S2CSetCompressionPacket{threshold=${this.threshold}}`;
  }
}

module.exports = { S2CSetCompressionPacket };
