class S2CLoginSuccessPacket {
  static id = 0x02;

  playerUuid;
  playerName;
  properties;

  constructor({ playerUuid, playerName, properties }) {
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
}

module.exports = { S2CLoginSuccessPacket };
