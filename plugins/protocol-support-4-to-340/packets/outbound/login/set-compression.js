class S2CSetCompressionPacket {
  threshold;

  constructor({ threshold }) {
    this.threshold = threshold;
  }

  async encode(stream) {
    stream.writeVarInt(this.threshold);
  }
}

module.exports = { S2CSetCompressionPacket };
