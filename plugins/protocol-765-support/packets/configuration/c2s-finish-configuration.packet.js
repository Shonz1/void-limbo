class C2SFinishConfigurationPacket extends network.PacketIn {
  static id = 0x02;

  constructor() {
    super();
  }

  async decode() {}

  toString() {
    return 'C2SFinishConfigurationPacket{}';
  }
}

module.exports = {
  C2SFinishConfigurationPacket,
};
