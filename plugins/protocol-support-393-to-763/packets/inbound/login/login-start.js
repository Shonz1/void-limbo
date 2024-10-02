class C2SLoginStartPacket {
  playerName;
  playerUuid;

  async decode(stream, protocolVersion) {
    this.playerName = await stream.readString();

    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_19_3) >= 0) {
      if (await stream.readBoolean()) {
        this.playerUuid = await stream.readUuid();
      }
    }
  }
}

module.exports = { C2SLoginStartPacket };
