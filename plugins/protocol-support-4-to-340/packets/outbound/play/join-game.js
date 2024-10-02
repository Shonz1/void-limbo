class S2CJoinGamePacket {
  entityId;
  gamemode;
  dimension;
  difficulty;
  maxPlayers;
  levelType;
  reduceDebugInfo;

  constructor({ entityId, gamemode, dimension, difficulty, maxPlayers, levelType, reduceDebugInfo }) {
    this.entityId = entityId;
    this.gamemode = gamemode;
    this.dimension = dimension;
    this.difficulty = difficulty;
    this.maxPlayers = maxPlayers;
    this.levelType = levelType;
    this.reduceDebugInfo = reduceDebugInfo;
  }

  async encode(stream, protocolVersion) {
    stream.writeInt(this.entityId);
    stream.writeByte(this.gamemode);

    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_9_1) < 0) {
      stream.writeByte(this.dimension);
    } else {
      stream.writeInt(this.dimension);
    }

    stream.writeByte(this.difficulty);
    stream.writeByte(this.maxPlayers);
    stream.writeString(this.levelType);

    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_8) >= 0) {
      stream.writeBoolean(this.reduceDebugInfo);
    }
  }
}

module.exports = { S2CJoinGamePacket };
