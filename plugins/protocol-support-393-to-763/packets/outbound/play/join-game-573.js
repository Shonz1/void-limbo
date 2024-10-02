class S2CJoinGame573Packet {
  entityId;
  gamemode;
  dimension;
  hashedSeed;
  maxPlayers;
  levelType;
  viewDistance;
  reducedDebugInfo;
  enableRespawnScreen;

  constructor({ entityId, gamemode, dimension, hashedSeed, maxPlayers, levelType, viewDistance, reducedDebugInfo, enableRespawnScreen }) {
    this.entityId = entityId;
    this.gamemode = gamemode;
    this.dimension = dimension;
    this.hashedSeed = hashedSeed;
    this.maxPlayers = maxPlayers;
    this.levelType = levelType;
    this.viewDistance = viewDistance;
    this.reducedDebugInfo = reducedDebugInfo;
    this.enableRespawnScreen = enableRespawnScreen;
  }

  async encode(stream) {
    stream.writeInt(this.entityId);
    stream.writeByte(this.gamemode);
    stream.writeInt(this.dimension);
    stream.writeLong(this.hashedSeed);
    stream.writeByte(this.maxPlayers);
    stream.writeString(this.levelType);
    stream.writeVarInt(this.viewDistance);
    stream.writeBoolean(this.reducedDebugInfo);
    stream.writeBoolean(this.enableRespawnScreen);
  }
}

module.exports = { S2CJoinGame573Packet };
