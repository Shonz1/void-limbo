class S2CRespawnPacket extends network.PacketOut {
  static id = 0x43;

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
    super();

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

  getSize() {
    let size = 0;

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
    size += 1; // dataKept

    return size;
  }

  toString() {
    return `S2CRespawnPacket{dimensionType=${this.dimensionType},dimensionName=${this.dimensionName},hashedSeed=${this.hashedSeed},gameMode=${this.gameMode},previousGameMode=${this.previousGameMode},isDebug=${this.isDebug},isFlat=${this.isFlat},deathDimensionName=${this.deathDimensionName},deathLocation=${this.deathLocation},portalCooldown=${this.portalCooldown},dataKept=${this.dataKept}}`;
  }
}

module.exports = { S2CRespawnPacket };
