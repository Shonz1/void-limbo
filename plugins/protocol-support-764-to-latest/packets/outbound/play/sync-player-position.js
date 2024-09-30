class S2CSyncPlayerPositionPacket {
  x;
  y;
  z;
  yaw;
  pitch;
  flags;
  teleportId;

  constructor({ x, y, z, yaw, pitch, flags, teleportId }) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.yaw = yaw;
    this.pitch = pitch;
    this.flags = flags;
    this.teleportId = teleportId;
  }

  async encode(stream) {
    stream.writeDouble(this.x);
    stream.writeDouble(this.y);
    stream.writeDouble(this.z);
    stream.writeFloat(this.yaw);
    stream.writeFloat(this.pitch);
    stream.writeByte(this.flags);
    stream.writeVarInt(this.teleportId);
  }
}

module.exports = { S2CSyncPlayerPositionPacket };
