class S2CJoinGamePacket extends network.PacketOut {
  static id = 0x29;

  entityId;
  isHardcore;
  dimensions;
  maxPlayers;
  viewDistance;
  simulationDistance;
  reducedDebugInfo;
  enableRespawnScreen;
  doLimitedCrafting;
  dimensionType;
  dimensionName;
  hashedSeed;
  gameMode;
  previousGameMode;
  isDebug;
  isFlat;
  deathDimensionName;
  deathLocation;
  portalCooldown;

  constructor({
    entityId,
    isHardcore,
    dimensions,
    maxPlayers,
    viewDistance,
    simulationDistance,
    reducedDebugInfo,
    enableRespawnScreen,
    doLimitedCrafting,
    dimensionType,
    dimensionName,
    hashedSeed,
    gameMode,
    previousGameMode,
    isDebug,
    isFlat,
    deathDimensionName,
    deathLocation,
    portalCooldown,
  }) {
    super();

    this.entityId = entityId;
    this.isHardcore = isHardcore;
    this.dimensions = dimensions;
    this.maxPlayers = maxPlayers;
    this.viewDistance = viewDistance;
    this.simulationDistance = simulationDistance;
    this.reducedDebugInfo = reducedDebugInfo;
    this.enableRespawnScreen = enableRespawnScreen;
    this.doLimitedCrafting = doLimitedCrafting;
    this.dimensionType = dimensionType;
    this.dimensionName = dimensionName;
    this.hashedSeed = hashedSeed;
    this.gameMode = gameMode;
    this.previousGameMode = previousGameMode;
    this.isDebug = isDebug;
    this.isFlat = isFlat;
    this.deathDimensionName = deathDimensionName;
    this.deathLocation = deathLocation;
    this.portalCooldown = portalCooldown;
  }

  async encode(stream) {
    stream.writeInt(this.entityId);
    stream.writeBoolean(this.isHardcore);

    stream.writeVarInt(this.dimensions.length);
    for (const dimension of this.dimensions) {
      stream.writeString(dimension);
    }

    stream.writeVarInt(this.maxPlayers);
    stream.writeVarInt(this.viewDistance);
    stream.writeVarInt(this.simulationDistance);
    stream.writeBoolean(this.reducedDebugInfo);
    stream.writeBoolean(this.enableRespawnScreen);
    stream.writeBoolean(this.doLimitedCrafting);
    stream.writeString(this.dimensionType);
    stream.writeString(this.dimensionName);
    stream.writeLong(this.hashedSeed);
    stream.writeByte(this.gameMode);
    stream.writeByte(this.previousGameMode);
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

  getSize() {
    let size = 0;

    size += 4; // entityId
    size += 1; // isHardcore

    size += network.getVarIntSize(this.dimensions.length); // dimensions
    for (const dimension of this.dimensions) {
      size += network.getVarIntSize(dimension.length); // dimension
      size += dimension.length; // dimension
    }

    size += network.getVarIntSize(this.maxPlayers); // maxPlayers
    size += network.getVarIntSize(this.viewDistance); // viewDistance
    size += network.getVarIntSize(this.simulationDistance); // simulationDistance
    size += 1; // reducedDebugInfo
    size += 1; // enableRespawnScreen
    size += 1; // doLimitedCrafting
    size += network.getVarIntSize(this.dimensionType.length); // dimensionType
    size += this.dimensionType.length; // dimensionType
    size += network.getVarIntSize(this.dimensionName.length); // dimensionName
    size += this.dimensionName.length; // dimensionName
    size += 8; // hashedSeed
    size += 1; // gameMode
    size += 1; // previousGameMode
    size += 1; // isDebug
    size += 1; // isFlat

    size += 1; // has deathLocation
    if (this.deathDimensionName && this.deathLocation) {
      size += network.getVarIntSize(this.deathDimensionName.length); // deathDimensionName
      size += this.deathDimensionName.length; // deathDimensionName
      size += 8; // deathLocation
    }

    size += network.getVarIntSize(this.portalCooldown); // portalCooldown

    return size;
  }

  toString() {
    return `JoinGamePacket{entityId=${this.entityId},isHardcore=${this.isHardcore},dimensions=${this.dimensions},maxPlayers=${this.maxPlayers},viewDistance=${this.viewDistance},simulationDistance=${this.simulationDistance},reducedDebugInfo=${this.reducedDebugInfo},enableRespawnScreen=${this.enableRespawnScreen},doLimitedCrafting=${this.doLimitedCrafting},dimensionType=${this.dimensionType},dimensionName=${this.dimensionName},hashedSeed=${this.hashedSeed},gameMode=${this.gameMode},previousGameMode=${this.previousGameMode},isDebug=${this.isDebug},isFlat=${this.isFlat},deathDimensionName=${this.deathDimensionName},deathLocation=${this.deathLocation},portalCooldown=${this.portalCooldown}}`;
  }
}

module.exports = { S2CJoinGamePacket };
