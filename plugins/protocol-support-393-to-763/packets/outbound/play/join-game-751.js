class S2CJoinGame751Packet {
  entityId;
  isHardcore;
  gamemode;
  previousGamemode;
  worldNames;
  dimensionCodec;
  dimension;
  worldName;
  hashedSeed;
  maxPlayers;
  viewDistance;
  reducedDebugInfo;
  enableRespawnScreen;
  isDebug;
  isFlat;

  constructor({
    entityId,
    isHardcore,
    gamemode,
    previousGamemode,
    worldNames,
    dimensionCodec,
    dimension,
    worldName,
    hashedSeed,
    maxPlayers,
    viewDistance,
    reducedDebugInfo,
    enableRespawnScreen,
    isDebug,
    isFlat,
  }) {
    this.entityId = entityId;
    this.isHardcore = isHardcore;
    this.gamemode = gamemode;
    this.previousGamemode = previousGamemode;
    this.worldNames = worldNames;
    this.dimensionCodec = dimensionCodec;
    this.dimension = dimension;
    this.worldName = worldName;
    this.hashedSeed = hashedSeed;
    this.maxPlayers = maxPlayers;
    this.viewDistance = viewDistance;
    this.reducedDebugInfo = reducedDebugInfo;
    this.enableRespawnScreen = enableRespawnScreen;
    this.isDebug = isDebug;
    this.isFlat = isFlat;
  }

  async encode(stream) {
    stream.writeInt(this.entityId);
    stream.writeBoolean(this.isHardcore);
    stream.writeByte(this.gamemode);
    stream.writeByte(this.previousGamemode);

    stream.writeVarInt(this.worldNames.length);
    for (const worldName of this.worldNames) {
      stream.writeString(worldName);
    }

    stream.write(this.dimensionCodec);
    stream.write(this.dimension);
    stream.writeString(this.worldName);
    stream.writeLong(this.hashedSeed);
    stream.writeVarInt(this.maxPlayers);
    stream.writeVarInt(this.viewDistance);
    stream.writeBoolean(this.reducedDebugInfo);
    stream.writeBoolean(this.enableRespawnScreen);
    stream.writeBoolean(this.isDebug);
    stream.writeBoolean(this.isFlat);
  }
}

module.exports = { S2CJoinGame751Packet };
