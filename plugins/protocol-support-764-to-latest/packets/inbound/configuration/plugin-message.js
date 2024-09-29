class C2SPluginMessagePacket {
  channel;
  data;

  async decode(stream, protocolVersion, size) {
    this.channel = await stream.readString();
    this.data = await stream.read(size - common.getVarIntSize(this.channel.length) - this.channel.length);
  }
}

module.exports = { C2SPluginMessagePacket };
