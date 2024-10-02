class S2CChunkDataAndLightUpdatePacket {
  buffer;

  constructor({ buffer }) {
    this.buffer = buffer;
  }

  async encode(stream) {
    stream.write(this.buffer);
  }
}

module.exports = { S2CChunkDataAndLightUpdatePacket };
