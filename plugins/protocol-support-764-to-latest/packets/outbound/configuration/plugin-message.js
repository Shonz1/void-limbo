class S2CPluginMessagePacket {
  channel;
  data;

  constructor({ channel, data }) {
    this.channel = channel;
    this.data = data;
  }

  async encode(stream) {
    stream.writeString(this.channel);
    stream.write(this.data);
  }
}

module.exports = { S2CPluginMessagePacket };
