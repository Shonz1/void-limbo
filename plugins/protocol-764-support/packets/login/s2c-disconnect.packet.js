class S2CDisconnectPacket extends network.PacketOut {
  static id = 0x00;

  reason;

  constructor({ reason }) {
    super();

    this.reason = reason;
  }

  async encode(stream) {
    stream.writeString(this.reason);
  }

  getSize() {
    const size = this.reason.length ?? 0;
    return size + network.getVarIntSize(size);
  }

  toString() {
    return `S2CDisconnectPacket{reason=${this.reason}}`;
  }
}

module.exports = { S2CDisconnectPacket };
