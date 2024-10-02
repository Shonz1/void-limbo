class S2CDisconnectPacket {
  reason;

  constructor({ reason }) {
    this.reason = reason;
  }

  async encode(stream) {
    stream.writeString(this.reason);
  }
}

module.exports = { S2CDisconnectPacket };
