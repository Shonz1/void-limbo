class C2SPluginMessagePacket extends network.PacketIn {
  static id = 0x01;

  channel;
  data;

  constructor() {
    super();
  }

  async decode(stream, size) {
    this.channel = await stream.readStringAsync();
    this.data = await stream.readAsync(size - network.getVarIntSize(this.channel.length) - this.channel.length);
  }

  toString() {
    return `C2SPluginMessagePacket{channel=${this.channel}, data=${this.data.toString('hex')}}`;
  }
}

module.exports = {
  C2SPluginMessagePacket,
};
