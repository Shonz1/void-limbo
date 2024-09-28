class S2CFinishConfigurationPacket extends network.PacketOut {
  static id = 0x02;

  constructor() {
    super();
  }

  async encode() {}

  getSize() {
    return 0;
  }

  toString() {
    return 'S2CFinishConfigurationPacket{}';
  }
}

module.exports = { S2CFinishConfigurationPacket };
