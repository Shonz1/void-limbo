class C2SSetPlayerRotationPacket extends network.PacketIn {
  static id = 0x19;

  yaw;
  pitch;
  onGround;

  constructor() {
    super();
  }

  async decode(stream) {
    this.yaw = await stream.readFloatAsync();
    this.pitch = await stream.readFloatAsync();
    this.onGround = await stream.readBooleanAsync();
  }
}

module.exports = { C2SSetPlayerRotationPacket };
