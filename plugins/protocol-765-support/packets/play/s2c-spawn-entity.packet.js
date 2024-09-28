class S2CSpawnEntityPacket extends network.PacketOut {
  static id = 0x01;

  entityId;
  entityUuid;
  type;
  x;
  y;
  z;
  pitch;
  yaw;
  headYaw;
  data;
  velocityX;
  velocityY;
  velocityZ;

  constructor({ entityId, entityUuid, type, x, y, z, pitch, yaw, headYaw, data, velocityX, velocityY, velocityZ }) {
    super();

    this.entityId = entityId;
    this.entityUuid = entityUuid;
    this.type = type;
    this.x = x;
    this.y = y;
    this.z = z;
    this.pitch = pitch;
    this.yaw = yaw;
    this.headYaw = headYaw;
    this.data = data;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.velocityZ = velocityZ;
  }

  async encode(stream) {
    stream.writeVarInt(this.entityId);
    stream.writeUuid(this.entityUuid);
    stream.writeVarInt(this.type);
    stream.writeDouble(this.x);
    stream.writeDouble(this.y);
    stream.writeDouble(this.z);
    stream.writeByte(this.pitch);
    stream.writeByte(this.yaw);
    stream.writeByte(this.headYaw);
    stream.writeVarInt(this.data);
    stream.writeShort(this.velocityX);
    stream.writeShort(this.velocityY);
    stream.writeShort(this.velocityZ);
  }

  getSize() {
    let size = 0;

    size += network.getVarIntSize(this.entityId);
    size += 16; // entityUuid
    size += network.getVarIntSize(this.type);
    size += 8; // x
    size += 8; // y
    size += 8; // z
    size += 1; // pitch
    size += 1; // yaw
    size += 1; // headYaw
    size += network.getVarIntSize(this.data);
    size += 2; // velocityX
    size += 2; // velocityY
    size += 2; // velocityZ

    return size;
  }
}

module.exports = { S2CSpawnEntityPacket };
