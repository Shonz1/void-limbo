class S2CPlayerInfoUpdatePacket extends network.PacketOut {
  static id = 0x3c;

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
    super();

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

  getSize() {
    let size = 0;

    size += 1; // actions
    size += this.players.length; // players count

    for (const data of this.players) {
      size += 16; // uuid

      if ((this.actions & S2CPlayerInfoUpdatePacket.ACTIONS.ADD_PLAYER) !== 0) {
        size += network.getVarIntSize(data.name.length);
        size += data.name.length;

        size += network.getVarIntSize(data.properties.length);

        for (const property of data.properties) {
          size += network.getVarIntSize(property.name.length);
          size += property.name.length;

          size += network.getVarIntSize(property.value.length);
          size += property.value.length;

          size += 1;

          if (property.signature) {
            size += network.getVarIntSize(property.signature.length);
            size += property.signature.length;
          }
        }
      }

      if ((this.actions & S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_GAMEMODE) !== 0) {
        size += network.getVarIntSize(data.gamemode);
      }

      if ((this.actions & S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_LISTED) !== 0) {
        size += 1;
      }

      if ((this.actions & S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_LATENCY) !== 0) {
        size += network.getVarIntSize(data.ping);
      }

      if ((this.actions & S2CPlayerInfoUpdatePacket.ACTIONS.UPDATE_DISPLAY_NAME) !== 0) {
        size += 1;
        size += network.getVarIntSize(JSON.stringify(data.displayName).length);
        size += JSON.stringify(data.displayName).length;
      }
    }

    return size;
  }
}

module.exports = { S2CPlayerInfoUpdatePacket };
