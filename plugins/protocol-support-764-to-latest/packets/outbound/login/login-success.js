class S2CLoginSuccessPacket {
  playerUuid;
  playerName;
  properties;

  constructor({ playerUuid, playerName, properties }) {
    this.playerUuid = playerUuid;
    this.playerName = playerName;
    this.properties = properties;
  }

  async encode(stream) {
    stream.writeUuid(this.playerUuid);
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
