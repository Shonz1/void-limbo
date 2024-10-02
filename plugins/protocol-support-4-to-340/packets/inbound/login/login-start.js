class C2SLoginStartPacket {
  playerName;

  async decode(stream) {
    this.playerName = await stream.readString();
  }
}

module.exports = { C2SLoginStartPacket };
