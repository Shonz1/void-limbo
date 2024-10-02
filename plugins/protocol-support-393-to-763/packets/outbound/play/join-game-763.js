class S2CJoinGame763Packet {
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
  simulationDistance;
  reducedDebugInfo;
  enableRespawnScreen;
  isDebug;
  isFlat;
  deathDimensionName;
  deathLocation;
  portalCooldown;

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
    simulationDistance,
    isDebug,
    isFlat,
    deathDimensionName,
    deathLocation,
    portalCooldown,
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
    this.simulationDistance = simulationDistance;
    this.reducedDebugInfo = reducedDebugInfo;
    this.enableRespawnScreen = enableRespawnScreen;
    this.isDebug = isDebug;
    this.isFlat = isFlat;
    this.deathDimensionName = deathDimensionName;
    this.deathLocation = deathLocation;
    this.portalCooldown = portalCooldown;
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
    stream.writeString(this.dimension);
    stream.writeString(this.worldName);
    stream.writeLong(this.hashedSeed);
    stream.writeVarInt(this.maxPlayers);
    stream.writeVarInt(this.viewDistance);
    stream.writeVarInt(this.simulationDistance);
    stream.writeBoolean(this.reducedDebugInfo);
    stream.writeBoolean(this.enableRespawnScreen);
    stream.writeBoolean(this.isDebug);
    stream.writeBoolean(this.isFlat);

    if (this.deathDimensionName && this.deathLocation) {
      stream.writeBoolean(true);
      stream.writeString(this.deathDimensionName);
      stream.writeLong(this.deathLocation);
    } else {
      stream.writeBoolean(false);
    }

    stream.writeVarInt(this.portalCooldown);
  }
}

module.exports = { S2CJoinGame763Packet };
