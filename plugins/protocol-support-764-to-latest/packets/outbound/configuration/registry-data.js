class S2CRegistryDataPacket {
  codec;
  registryId;
  entries;

  constructor({ codec, registryId, entries }) {
    this.codec = codec;
    this.registryId = registryId;
    this.entries = entries;
  }

  async encode(stream) {
    stream.write(this.codec);
  }
}

module.exports = { S2CRegistryDataPacket };
