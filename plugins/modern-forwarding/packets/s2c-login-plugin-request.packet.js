class S2CLoginPluginRequestPacket {
  static id = 0x04;

  messageId;
  channel;
  data;

  constructor({ messageId, channel, data }) {
    this.messageId = messageId;
    this.channel = channel;
    this.data = data;
  }

  async encode(stream) {
    stream.writeVarInt(this.messageId);
    stream.writeString(this.channel);
    stream.write(this.data);
  }
}

module.exports = { S2CLoginPluginRequestPacket };
