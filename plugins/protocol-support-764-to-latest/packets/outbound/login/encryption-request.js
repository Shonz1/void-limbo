class S2CEncryptionRequestPacket {
  serverId;
  publicKey;
  verifyToken;
  shouldAuthenticate;

  constructor({ serverId, publicKey, verifyToken, shouldAuthenticate }) {
    this.serverId = serverId;
    this.publicKey = publicKey;
    this.verifyToken = verifyToken;
    this.shouldAuthenticate = shouldAuthenticate;
  }

  async encode(stream, protocolVersion) {
    stream.writeString(this.serverId);

    stream.writeVarInt(this.publicKey.length);
    stream.write(this.publicKey);
    stream.writeVarInt(this.verifyToken.length);
    stream.write(this.verifyToken);

    if (protocolVersion.compare(api.ProtocolVersion.MINECRAFT_1_20_5) >= 0) {
      if (this.shouldAuthenticate === undefined || this.shouldAuthenticate === null) {
        throw new Error('shouldAuthenticate is not set');
      }

      stream.writeBoolean(this.shouldAuthenticate);
    }
  }
}

module.exports = { S2CEncryptionRequestPacket };
