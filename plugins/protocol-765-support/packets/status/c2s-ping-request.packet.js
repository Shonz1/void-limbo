class C2SPingRequestPacket extends network.PacketIn {
  static id = 0x01;

  payload;

  constructor() {
    super();
  }

  async decode(stream) {
    this.payload = await stream.readLongAsync();
  }

  toString() {
    return `C2SPingRequestPacket[payload=${this.payload}]`;
  }
}

module.exports = { C2SPingRequestPacket };
