class S2CRegistryDataPacket {
  codec;

  constructor({ codec }) {
    this.codec = codec;
  }

  async encode(stream) {
    stream.write(this.codec);
  }
}

module.exports = { S2CRegistryDataPacket };
