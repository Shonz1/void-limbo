class S2CJoinGame477Packet {
  entityId;
  gamemode;
  dimension;
  maxPlayers;
  levelType;
  viewDistance;
  reducedDebugInfo;

  constructor({ entityId, gamemode, dimension, maxPlayers, levelType, viewDistance, reducedDebugInfo }) {
    this.entityId = entityId;
    this.gamemode = gamemode;
    this.dimension = dimension;
    this.maxPlayers = maxPlayers;
    this.levelType = levelType;
    this.viewDistance = viewDistance;
    this.reducedDebugInfo = reducedDebugInfo;
  }

  async encode(stream) {
    stream.writeInt(this.entityId);
    stream.writeByte(this.gamemode);
    stream.writeInt(this.dimension);
    stream.writeByte(this.maxPlayers);
    stream.writeString(this.levelType);
    stream.writeVarInt(this.viewDistance);
    stream.writeBoolean(this.reducedDebugInfo);
  }
}

module.exports = { S2CJoinGame477Packet };
