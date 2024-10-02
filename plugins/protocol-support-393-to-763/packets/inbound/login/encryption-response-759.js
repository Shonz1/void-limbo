class C2SEncryptionResponse759Packet {
  sharedSecret;
  verifyToken;
  salt;
  signature;

  async decode(stream) {
    const sharedSecretLength = await stream.readVarInt();
    this.sharedSecret = await stream.read(sharedSecretLength);

    if (await stream.readBoolean()) {
      const verifyTokenLength = await stream.readVarInt();
      this.verifyToken = await stream.read(verifyTokenLength);
    } else {
      this.salt = await stream.read(8);

      const signatureLength = await stream.readVarInt();
      this.signature = await stream.read(signatureLength);
    }
  }
}

module.exports = { C2SEncryptionResponse759Packet };
