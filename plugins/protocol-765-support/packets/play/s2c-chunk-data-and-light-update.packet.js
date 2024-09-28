class S2CChunkDataAndLightUpdatePacket extends network.PacketOut {
  static id = 0x25;

  buffer;

  constructor({ buffer }) {
    super();

    this.buffer = buffer;
  }

  async encode(stream) {
    stream.write(this.buffer);
  }

  getSize() {
    let size = 0;

    size += this.buffer.length;

    return size;
  }
}

module.exports = { S2CChunkDataAndLightUpdatePacket };
