class S2CLoginSuccessPacket extends network.PacketOut {
  static id = 0x02;

  playerUuid;
  playerName;
  properties;

  constructor({ playerUuid, playerName, properties }) {
    super();

    this.playerUuid = playerUuid;
    this.playerName = playerName;
    this.properties = properties;
  }

  async encode(stream) {
    stream.write(Buffer.from(this.playerUuid, 'hex'));
    stream.writeString(this.playerName);
    stream.writeVarInt(this.properties.length);

    for (const property of this.properties) {
      stream.writeString(property.name);
      stream.writeString(property.value);
      stream.writeBoolean(!!property.signature);
      if (property.signature) {
        stream.writeString(property.signature);
      }
    }
  }

  getSize() {
    let size = 0;

    size += 16; // uuid
    size += network.getVarIntSize(this.playerName.length);
    size += this.playerName.length;
    size += network.getVarIntSize(this.properties.length);

    for (const property of this.properties) {
      size += network.getVarIntSize(property.name.length);
      size += property.name.length;
      size += network.getVarIntSize(property.value.length);
      size += property.value.length;
      size += 1; // boolean
      if (property.signature) {
        size += network.getVarIntSize(property.signature.length);
        size += property.signature.length;
      }
    }

    return size;
  }

  toString() {
    return `S2CLoginSuccessPacket{playerUuid=${this.playerUuid}, playerName=${this.playerName}, properties=${JSON.stringify(
      this.properties,
    )}}`;
  }
}

module.exports = { S2CLoginSuccessPacket };
