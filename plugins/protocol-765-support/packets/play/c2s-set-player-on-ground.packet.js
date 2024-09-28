class C2SSetPlayerOnGroundPacket extends network.PacketIn {
  static id = 0x1a;

  onGround;

  constructor() {
    super();
  }

  async decode(stream) {
    this.onGround = await stream.readBooleanAsync();
  }
}

module.exports = { C2SSetPlayerOnGroundPacket };
