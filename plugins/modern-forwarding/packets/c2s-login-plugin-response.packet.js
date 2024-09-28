class C2SLoginPluginResponsePacket extends network.PacketIn {
  static id = 0x02;

  messageId;
  successful;
  data;

  constructor() {
    super();
  }

  async decode(stream, size) {
    this.messageId = await stream.readVarIntAsync();
    this.successful = await stream.readBooleanAsync();
    this.data = this.successful ? await stream.readAsync(size - network.getVarIntSize(this.messageId) - 1) : Buffer.alloc(0);
  }

  toString() {
    return `C2SLoginPluginResponsePacket{messageId=${this.messageId}, successful=${this.successful}, data=${this.data?.toString('hex')}}`;
  }
}

module.exports = { C2SLoginPluginResponsePacket };
