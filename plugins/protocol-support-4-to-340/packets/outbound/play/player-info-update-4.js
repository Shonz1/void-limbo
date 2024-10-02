class S2CPlayerInfoUpdate4Packet {
  playerName;
  online;
  ping;

  constructor({ playerName, online, ping }) {
    this.playerName = playerName;
    this.online = online;
    this.ping = ping;
  }

  async encode(stream) {
    stream.writeString(this.playerName);
    stream.writeBoolean(this.online);
    stream.writeShort(this.ping);
  }
}

module.exports = { S2CPlayerInfoUpdate4Packet };
