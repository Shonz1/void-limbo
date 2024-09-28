class S2CSetHeadRotationPacket extends network.PacketOut {
  static id = 0x46;

  entityId;
  headYaw;

  constructor({ entityId, headYaw }) {
    super();

    this.entityId = entityId;
    this.headYaw = headYaw;
  }

  async encode(stream) {
    stream.writeVarInt(this.entityId);
    stream.writeByte(this.headYaw);
  }

  getSize() {
    let size = 0;

    size += network.getVarIntSize(this.entityId);
    size += 1; // yaw

    return size;
  }
}

module.exports = { S2CSetHeadRotationPacket };
