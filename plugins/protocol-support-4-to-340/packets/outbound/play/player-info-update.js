class S2CPlayerInfoUpdatePacket {
  static ACTIONS = Object.freeze({
    ADD_PLAYER: 0,
    UPDATE_GAMEMODE: 1,
    UPDATE_LATENCY: 2,
    UPDATE_DISPLAY_NAME: 3,
    REMOVE_PLAYER: 4,
  });

  action;
  players;

  constructor({ action, players }) {
    this.action = action;
    this.players = players;
  }

  async encode(stream) {
    stream.writeVarInt(this.action);
    stream.writeVarInt(this.players.length);

    for (const player of this.players) {
      const { uuid, ...data } = player;

      stream.writeUuid(uuid);

      if (this.action === S2CPlayerInfoUpdatePacket.ACTIONS.ADD_PLAYER) {
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
        stream.writeVarInt(data.gamemode);
        stream.writeVarInt(data.ping);
        stream.writeBoolean(!!data.displayName);
        if (data.displayName) {
          stream.writeTextComponent(data.displayName);
        }
      }

      if (this.action === S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_GAMEMODE) {
        stream.writeVarInt(data.gamemode);
      }

      if (this.action === S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_LATENCY) {
        stream.writeVarInt(data.ping);
      }

      if (this.action === S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_DISPLAY_NAME) {
        stream.writeBoolean(!!data.displayName);
        stream.writeTextComponent(data.displayName);
      }
    }
  }
}

module.exports = { S2CPlayerInfoUpdatePacket };
