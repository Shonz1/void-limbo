class C2SStatusRequestPacket extends network.PacketIn {
  static id = 0x00;

  constructor() {
    super();
  }

  async decode() {}

  toString() {
    return `C2SStatusRequestPacket{}`;
  }
}

module.exports = { C2SStatusRequestPacket };
