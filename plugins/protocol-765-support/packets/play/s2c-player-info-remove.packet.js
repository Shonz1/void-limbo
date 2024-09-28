class S2CPlayerInfoRemovePacket extends network.PacketOut {
  static id = 0x3b;

  players;

  constructor({ players }) {
    super();

    this.players = players;
  }

  async encode(stream) {
    stream.writeVarInt(this.players.length);

    for (const player of this.players) {
      stream.writeUuid(player);
    }
  }

  getSize() {
    let size = 0;

    size += this.players.length; // players count

    for (let i = 0; i < this.players.length; i++) {
      size += 16; // uuid
    }

    return size;
  }
}

module.exports = { S2CPlayerInfoRemovePacket };
