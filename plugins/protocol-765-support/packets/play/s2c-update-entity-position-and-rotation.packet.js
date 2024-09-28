class S2CUpdateEntityPositionAndRotationPacket extends network.PacketOut {
  static id = 0x2d;

  entityId;
  deltaX;
  deltaY;
  deltaZ;
  yaw;
  pitch;
  onGround;

  constructor({ entityId, deltaX, deltaY, deltaZ, yaw, pitch, onGround }) {
    super();

    this.entityId = entityId;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.deltaZ = deltaZ;
    this.yaw = yaw;
    this.pitch = pitch;
    this.onGround = onGround;
  }

  async encode(stream) {
    stream.writeVarInt(this.entityId);
    stream.writeShort(this.deltaX);
    stream.writeShort(this.deltaY);
    stream.writeShort(this.deltaZ);
    stream.writeByte(this.yaw);
    stream.writeByte(this.pitch);
    stream.writeBoolean(this.onGround);
  }

  getSize() {
    let size = 0;

    size += network.getVarIntSize(this.entityId);
    size += 2; // deltaX
    size += 2; // deltaY
    size += 2; // deltaZ
    size += 1; // yaw
    size += 1; // pitch
    size += 1; // onGround

    return size;
  }
}

module.exports = { S2CUpdateEntityPositionAndRotationPacket };
