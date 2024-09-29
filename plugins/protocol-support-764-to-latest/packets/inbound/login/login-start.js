class C2SLoginStartPacket {
  playerName;
  playerUuid;

  async decode(stream) {
    this.playerName = await stream.readString();
    const buffer = await stream.read(16);
    this.playerUuid = buffer.toString('hex');
  }
}

module.exports = { C2SLoginStartPacket };
