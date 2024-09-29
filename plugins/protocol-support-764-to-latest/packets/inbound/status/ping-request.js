class C2SPingRequestPacket {
  payload;

  async decode(stream) {
    this.payload = await stream.readLong();
  }
}

module.exports = { C2SPingRequestPacket };
