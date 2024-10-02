class C2SEncryptionResponsePacket {
  sharedSecret;
  verifyToken;

  async decode(stream) {
    const sharedSecretLength = await stream.readVarInt();
    this.sharedSecret = await stream.read(sharedSecretLength);

    const verifyTokenLength = await stream.readVarInt();
    this.verifyToken = await stream.read(verifyTokenLength);
  }
}

module.exports = { C2SEncryptionResponsePacket };
