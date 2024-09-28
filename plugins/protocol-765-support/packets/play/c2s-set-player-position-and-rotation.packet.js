class C2SSetPlayerPositionAndRotationPacket extends network.PacketIn {
  static id = 0x18;

  x;
  y;
  z;
  yaw;
  pitch;
  onGround;

  constructor() {
    super();
  }

  async decode(stream) {
    this.x = await stream.readDoubleAsync();
    this.y = await stream.readDoubleAsync();
    this.z = await stream.readDoubleAsync();
    this.yaw = await stream.readFloatAsync();
    this.pitch = await stream.readFloatAsync();
    this.onGround = await stream.readBooleanAsync();
  }
}

module.exports = { C2SSetPlayerPositionAndRotationPacket };
