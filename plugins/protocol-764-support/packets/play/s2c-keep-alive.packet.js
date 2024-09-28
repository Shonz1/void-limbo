class S2CKeepAlivePacket extends network.PacketOut {
  static id = 0x24;

  id;

  constructor({ id }) {
    super();

    this.id = id;
  }

  async encode(stream) {
    stream.writeLong(this.id);
  }

  getSize() {
    let size = 0;

    size += 8; // id

    return size;
  }

  toString() {
    return `S2CKeepAlivePacket{id:${this.id}}`;
  }
}

module.exports = { S2CKeepAlivePacket };
