class S2CRemoveEntitiesPacket extends network.PacketOut {
  static id = 0x40;

  entities;

  constructor({ entities }) {
    super();

    this.entities = entities;
  }

  async encode(stream) {
    stream.writeVarInt(this.entities.length);

    for (const entity of this.entities) {
      stream.writeVarInt(entity);
    }
  }

  getSize() {
    let size = 0;

    size += this.entities.length;

    for (const entity of this.entities) {
      size += network.getVarIntSize(entity);
    }

    return size;
  }
}

module.exports = { S2CRemoveEntitiesPacket };
