class S2CGameEventPacket {
  event;
  value;

  constructor({ event, value }) {
    this.event = event;
    this.value = value;
  }

  async encode(stream) {
    stream.writeByte(this.event);
    stream.writeFloat(this.value);
  }
}

module.exports = { S2CGameEventPacket };
