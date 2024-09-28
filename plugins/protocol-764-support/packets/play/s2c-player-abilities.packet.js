class S2CPlayerAbilitiesPacket extends network.PacketOut {
  static id = 0x36;

  flags;
  flyingSpeed;
  fieldOfViewModifier;

  constructor({ flags, flyingSpeed, fieldOfViewModifier }) {
    super();

    this.flags = flags;
    this.flyingSpeed = flyingSpeed;
    this.fieldOfViewModifier = fieldOfViewModifier;
  }

  async encode(stream) {
    stream.writeByte(this.flags);
    stream.writeFloat(this.flyingSpeed);
    stream.writeFloat(this.fieldOfViewModifier);
  }

  getSize() {
    let size = 0;

    size += 1; // flags
    size += 4; // flyingSpeed
    size += 4; // fieldOfViewModifier

    return size;
  }

  toString() {
    return `S2CPlayerAbilitiesPacket{flags=${this.flags}, flyingSpeed=${this.flyingSpeed}, fieldOfViewModifier=${this.fieldOfViewModifier}}`;
  }
}

module.exports = { S2CPlayerAbilitiesPacket };
