class S2CEncryptionRequestPacket {
  serverId;
  publicKey;
  verifyToken;

  constructor({ serverId, publicKey, verifyToken }) {
    this.serverId = serverId;
    this.publicKey = publicKey;
    this.verifyToken = verifyToken;
  }

  async encode(stream) {
    stream.writeString(this.serverId);

    stream.writeVarInt(this.publicKey.length);
    stream.write(this.publicKey);
    stream.writeVarInt(this.verifyToken.length);
    stream.write(this.verifyToken);
  }
}

module.exports = { S2CEncryptionRequestPacket };
