class S2CSyncPlayerPositionPacket extends network.PacketOut {
  static id = 0x3e;

  x;
  y;
  z;
  yaw;
  pitch;
  flags;
  teleportId;

  constructor({ x, y, z, yaw, pitch, flags, teleportId }) {
    super();

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

  getSize() {
    let size = 0;

    size += 8; // x
    size += 8; // y
    size += 8; // z
    size += 4; // yaw
    size += 4; // pitch
    size += 1; // flags
    size += network.getVarIntSize(this.teleportId);

    return size;
  }

  toString() {
    return `S2CSyncPlayerPositionPacket{x=${this.x}, y=${this.y}, z=${this.z}, yaw=${this.yaw}, pitch=${this.pitch}, flags=${this.flags}, teleportId=${this.teleportId}}`;
  }
}

module.exports = { S2CSyncPlayerPositionPacket };
