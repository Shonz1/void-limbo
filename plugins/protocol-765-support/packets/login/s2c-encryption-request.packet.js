class S2CEncryptionRequestPacket extends network.PacketOut {
  static id = 0x01;

  serverId;
  publicKey;
  verifyToken;

  constructor({ serverId, publicKey, verifyToken }) {
    super();

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

  getSize() {
    let size = 0;

    size += network.getVarIntSize(this.serverId.length);
    size += this.serverId.length;
    size += network.getVarIntSize(this.publicKey.length);
    size += this.publicKey.length;
    size += network.getVarIntSize(this.verifyToken.length);
    size += this.verifyToken.length;

    return size;
  }

  toString() {
    return `S2CEncryptionRequestPacket{serverId=${this.serverId}, publicKey=${this.publicKey.toString(
      'base64',
    )}, verifyToken=${this.verifyToken.toString('base64')}}`;
  }
}

module.exports = { S2CEncryptionRequestPacket };
