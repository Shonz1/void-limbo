class S2CJoinGamePacket {
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
  enforcedSecureChat;

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
    enforcedSecureChat,
  }) {
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
    this.enforcedSecureChat = enforcedSecureChat;
  }

  async encode(stream, protocolVersion) {
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

    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_20_5) < 0) {
      stream.writeString(this.dimensionType);
    } else {
      stream.writeVarInt(this.dimensionType);
    }

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

    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_20_5) >= 0) {
      stream.writeBoolean(this.enforcedSecureChat);
    }
  }
}

module.exports = { S2CJoinGamePacket };
