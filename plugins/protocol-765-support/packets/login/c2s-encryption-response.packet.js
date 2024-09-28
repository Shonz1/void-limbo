class C2SEncryptionResponsePacket extends network.PacketIn {
  static id = 0x01;

  sharedSecret;
  verifyToken;

  constructor() {
    super();
  }

  async decode(stream) {
    const sharedSecretLength = await stream.readVarIntAsync();
    this.sharedSecret = await stream.readAsync(sharedSecretLength);

    const verifyTokenLength = await stream.readVarIntAsync();
    this.verifyToken = await stream.readAsync(verifyTokenLength);
  }

  toString() {
    return `C2SEncryptionResponsePacket{sharedSecret=${this.sharedSecret.toString('base64')}, verifyToken=${this.verifyToken.toString(
      'base64',
    )}}`;
  }
}

module.exports = { C2SEncryptionResponsePacket };
