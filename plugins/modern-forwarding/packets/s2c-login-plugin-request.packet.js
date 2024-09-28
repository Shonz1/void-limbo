class S2CLoginPluginRequestPacket extends network.PacketOut {
  static id = 0x04;

  messageId;
  channel;
  data;

  constructor({ messageId, channel, data }) {
    super();

    this.messageId = messageId;
    this.channel = channel;
    this.data = data;
  }

  async encode(stream) {
    stream.writeVarInt(this.messageId);
    stream.writeString(this.channel);
    stream.write(this.data);
  }

  getSize() {
    let size = 0;

    size += network.getVarIntSize(this.messageId);
    size += network.getVarIntSize(this.channel.length);
    size += this.channel.length;
    size += this.data.length;

    return size;
  }

  toString() {
    return `S2CLoginPluginRequestPacket{messageId=${this.messageId}, channel=${this.channel}, data=${this.data.toString('hex')}}`;
  }
}

module.exports = { S2CLoginPluginRequestPacket };
