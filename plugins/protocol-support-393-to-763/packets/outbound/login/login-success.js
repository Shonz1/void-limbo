class S2CLoginSuccessPacket {
  playerUuid;
  playerName;
  properties;

  constructor({ playerUuid, playerName, properties }) {
    this.playerUuid = playerUuid;
    this.playerName = playerName;
    this.properties = properties;
  }

  async encode(stream, protocolVersion) {
    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_16) < 0) {
      stream.writeString(this.playerUuid);
    } else {
      stream.writeUuid(this.playerUuid);
    }

    stream.writeString(this.playerName);

    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_19) >= 0) {
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
}

module.exports = { S2CLoginSuccessPacket };
