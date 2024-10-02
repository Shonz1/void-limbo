class S2CSyncPlayerPositionPacket {
  x;
  y;
  z;
  yaw;
  pitch;
  flags;
  teleportId;
  dismountVehicle;

  constructor({ x, y, z, yaw, pitch, flags, teleportId, dismountVehicle }) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.yaw = yaw;
    this.pitch = pitch;
    this.flags = flags;
    this.teleportId = teleportId;
    this.dismountVehicle = dismountVehicle;
  }

  async encode(stream, protocolVersion) {
    stream.writeDouble(this.x);
    stream.writeDouble(this.y);
    stream.writeDouble(this.z);
    stream.writeFloat(this.yaw);
    stream.writeFloat(this.pitch);
    stream.writeByte(this.flags);
    stream.writeVarInt(this.teleportId);

    if (
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_17) >= 0 &&
      protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_19_3) <= 0
    ) {
      stream.writeBoolean(!!this.dismountVehicle);
    }
  }
}

module.exports = { S2CSyncPlayerPositionPacket };
