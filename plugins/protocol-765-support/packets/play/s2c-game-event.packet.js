class S2CGameEventPacket extends network.PacketOut {
  static id = 0x20;

  event;
  value;

  constructor({ event, value }) {
    super();

    this.event = event;
    this.value = value;
  }

  async encode(stream) {
    stream.writeByte(this.event);
    stream.writeFloat(this.value);
  }

  getSize() {
    let size = 0;

    size += 1;
    size += 4;

    return size;
  }
}

module.exports = { S2CGameEventPacket };
