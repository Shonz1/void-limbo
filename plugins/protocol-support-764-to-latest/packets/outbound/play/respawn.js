class S2CRespawnPacket {
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
  dataKept;

  constructor({
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
    dataKept,
  }) {
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
    this.dataKept = dataKept;
  }

  async encode(stream) {
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
    stream.writeByte(this.dataKept);
  }
}

module.exports = { S2CRespawnPacket };
