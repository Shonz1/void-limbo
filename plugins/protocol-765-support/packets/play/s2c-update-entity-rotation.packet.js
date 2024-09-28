class S2CUpdateEntityRotationPacket extends network.PacketOut {
  static id = 0x2e;

  entityId;
  yaw;
  pitch;
  onGround;

  constructor({ entityId, yaw, pitch, onGround }) {
    super();

    this.entityId = entityId;
    this.yaw = yaw;
    this.pitch = pitch;
    this.onGround = onGround;
  }

  async encode(stream) {
    stream.writeVarInt(this.entityId);
    stream.writeByte(this.yaw);
    stream.writeByte(this.pitch);
    stream.writeBoolean(this.onGround);
  }

  getSize() {
    let size = 0;

    size += network.getVarIntSize(this.entityId);
    size += 1; // yaw
    size += 1; // pitch
    size += 1; // onGround

    return size;
  }
}

module.exports = { S2CUpdateEntityRotationPacket };
