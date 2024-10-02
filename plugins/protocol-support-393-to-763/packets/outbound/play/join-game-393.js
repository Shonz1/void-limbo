class S2CJoinGame393Packet {
  entityId;
  gamemode;
  dimension;
  difficulty;
  maxPlayers;
  levelType;
  reducedDebugInfo;

  constructor({ entityId, gamemode, dimension, difficulty, maxPlayers, levelType, reducedDebugInfo }) {
    this.entityId = entityId;
    this.gamemode = gamemode;
    this.dimension = dimension;
    this.difficulty = difficulty;
    this.maxPlayers = maxPlayers;
    this.levelType = levelType;
    this.reducedDebugInfo = reducedDebugInfo;
  }

  async encode(stream) {
    stream.writeInt(this.entityId);
    stream.writeByte(this.gamemode);
    stream.writeInt(this.dimension);
    stream.writeByte(this.difficulty);
    stream.writeByte(this.maxPlayers);
    stream.writeString(this.levelType);
    stream.writeBoolean(this.reducedDebugInfo);
  }
}

module.exports = { S2CJoinGame393Packet };
