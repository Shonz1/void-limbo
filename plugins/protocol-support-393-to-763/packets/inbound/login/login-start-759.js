class C2SLoginStart759Packet {
  playerName;
  timestamp;
  publicKey;
  signature;
  playerUuid;

  async decode(stream, protocolVersion) {
    this.playerName = await stream.readString();

    if (await stream.readBoolean()) {
      this.timestamp = await stream.readLong();

      const publicKeyLength = await stream.readVarInt();
      this.publicKey = await stream.read(publicKeyLength);

      const signatureLength = await stream.readVarInt();
      this.signature = await stream.read(signatureLength);
    }

    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_19_1) >= 0) {
      if (await stream.readBoolean()) {
        this.playerUuid = await stream.readUuid();
      }
    }
  }
}

module.exports = { C2SLoginStart759Packet };
