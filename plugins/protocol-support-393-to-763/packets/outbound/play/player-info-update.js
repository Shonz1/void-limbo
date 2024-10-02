class S2CPlayerInfoUpdatePacket {
  static ACTIONS = Object.freeze({
    ADD_PLAYER: 1,
    INITIALIZE_CHAT: 2,
    UPDATE_GAMEMODE: 4,
    UPDATE_LISTED: 8,
    UPDATE_LATENCY: 16,
    UPDATE_DISPLAY_NAME: 32,
  });

  actions;
  players;

  constructor({ actions, players }) {
    this.actions = actions;
    this.players = players;
  }

  async encode(stream) {
    stream.writeVarInt(this.actions);
    stream.writeVarInt(this.players.length);

    for (const player of this.players) {
      const { uuid, ...data } = player;

      stream.writeUuid(uuid);

      if ((this.actions & S2CPlayerInfoUpdatePacket.ACTIONS.ADD_PLAYER) !== 0) {
        stream.writeString(data.name);
        stream.writeVarInt(data.properties.length);
        for (const property of data.properties) {
          stream.writeString(property.name);
          stream.writeString(property.value);
          stream.writeBoolean(!!property.signature);
          if (property.signature) {
            stream.writeString(property.signature);
          }
        }
      }

      if ((this.actions & S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_GAMEMODE) !== 0) {
        stream.writeVarInt(data.gamemode);
      }

      if ((this.actions & S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_LISTED) !== 0) {
        stream.writeBoolean(data.listed);
      }

      if ((this.actions & S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_LATENCY) !== 0) {
        stream.writeVarInt(data.ping);
      }

      if ((this.actions & S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_DISPLAY_NAME) !== 0) {
        stream.writeBoolean(!!data.displayName);
        stream.writeTextComponent(data.displayName);
      }
    }
  }
}

module.exports = { S2CPlayerInfoUpdatePacket };
