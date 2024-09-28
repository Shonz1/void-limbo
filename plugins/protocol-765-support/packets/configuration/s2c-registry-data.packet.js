class S2CRegistryDataPacket extends network.PacketOut {
  static id = 0x05;

  codec;

  constructor({ codec }) {
    super();

    this.codec = codec;
  }

  async encode(stream) {
    stream.write(this.codec);
  }

  getSize() {
    return this.codec.length;
  }

  toString() {
    return `S2CRegistryDataPacket{codec: ${this.codec.toString('hex')}}`;
  }
}

module.exports = { S2CRegistryDataPacket };
