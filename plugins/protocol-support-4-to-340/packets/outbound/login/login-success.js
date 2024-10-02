class S2CLoginSuccessPacket {
  playerUuid;
  playerName;

  constructor({ playerUuid, playerName }) {
    this.playerUuid = playerUuid;
    this.playerName = playerName;
  }

  async encode(stream) {
    stream.writeString(this.playerUuid);
    stream.writeString(this.playerName);
  }
}

module.exports = { S2CLoginSuccessPacket };
