class C2SLoginAcknowledgedPacket extends network.PacketIn {
  static id = 0x03;

  constructor() {
    super();
  }

  async decode() {}

  toString() {
    return `C2SLoginAcknowledgedPacket{}`;
  }
}

module.exports = { C2SLoginAcknowledgedPacket };
