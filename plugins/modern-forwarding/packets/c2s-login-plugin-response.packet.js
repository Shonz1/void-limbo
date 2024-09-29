class C2SLoginPluginResponsePacket {
  messageId;
  successful;
  data;

  async decode(stream, protocolVersion, size) {
    this.messageId = await stream.readVarInt();
    this.successful = await stream.readBoolean();
    this.data = this.successful ? await stream.read(size - common.getVarIntSize(this.messageId) - 1) : Buffer.alloc(0);
  }
}

module.exports = { C2SLoginPluginResponsePacket };
