class S2CStatusResponsePacket {
  response;

  constructor({ response }) {
    this.response = response;
  }

  async encode(stream) {
    stream.writeString(this.response);
  }
}

module.exports = { S2CStatusResponsePacket };
