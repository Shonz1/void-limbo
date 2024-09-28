class C2SLoginStartPacket extends network.PacketIn {
  static id = 0x00;

  playerName;
  playerUuid;

  constructor() {
    super();
  }

  async decode(stream) {
    this.playerName = await stream.readStringAsync();
    const buffer = await stream.readAsync(16);
    this.playerUuid = buffer.toString('hex');
  }

  toString() {
    return `C2SLoginStartPacket{playerName=${this.playerName}, playerUuid=${this.playerUuid}}`;
  }
}

module.exports = { C2SLoginStartPacket };
