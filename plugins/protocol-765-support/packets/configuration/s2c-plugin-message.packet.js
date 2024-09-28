class S2CPluginMessagePacket extends network.PacketIn {
  static id = 0x01;

  channel;
  data;

  constructor({ channel, data }) {
    super();

    this.channel = channel;
    this.data = data;
  }

  async encode(stream) {
    stream.writeString(this.channel);
    stream.write(this.data);
  }

  getSize() {
    let size = 0;

    size += network.getVarIntSize(this.channel.length);
    size += this.channel.length;
    size += this.data.length;

    return size;
  }

  toString() {
    return `S2CPluginMessagePacket{channel=${this.channel}, data=${this.data.toString('hex')}}`;
  }
}

module.exports = {
  S2CPluginMessagePacket,
};
