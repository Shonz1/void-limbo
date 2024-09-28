class S2CUpdateEntityPositionPacket extends network.PacketOut {
  static id = 0x2c;

  entityId;
  deltaX;
  deltaY;
  deltaZ;
  onGround;

  constructor({ entityId, deltaX, deltaY, deltaZ, onGround }) {
    super();

    this.entityId = entityId;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.deltaZ = deltaZ;
    this.onGround = onGround;
  }

  async encode(stream) {
    stream.writeVarInt(this.entityId);
    stream.writeShort(this.deltaX);
    stream.writeShort(this.deltaY);
    stream.writeShort(this.deltaZ);
    stream.writeBoolean(this.onGround);
  }

  getSize() {
    let size = 0;

    size += network.getVarIntSize(this.entityId);
    size += 2; // deltaX
    size += 2; // deltaY
    size += 2; // deltaZ
    size += 1; // onGround

    return size;
  }
}

module.exports = { S2CUpdateEntityPositionPacket };
