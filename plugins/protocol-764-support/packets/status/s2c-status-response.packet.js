class S2CStatusResponsePacket extends network.PacketOut {
  static id = 0x00;

  response;

  constructor({ response }) {
    super();

    this.response = response;
  }

  async encode(stream) {
    stream.writeString(this.response);
  }

  getSize() {
    const size = this.response.length ?? 0;
    return size + network.getVarIntSize(size);
  }

  toString() {
    return `StatusResponsePacket{response=${this.response}}`;
  }
}

module.exports = { S2CStatusResponsePacket };
