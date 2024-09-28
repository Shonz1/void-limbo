class C2SSetPlayerPositionPacket extends network.PacketIn {
  static id = 0x17;

  x;
  y;
  z;
  onGround;

  constructor() {
    super();
  }

  async decode(stream) {
    this.x = await stream.readDoubleAsync();
    this.y = await stream.readDoubleAsync();
    this.z = await stream.readDoubleAsync();
    this.onGround = await stream.readBooleanAsync();
  }
}

module.exports = { C2SSetPlayerPositionPacket };
