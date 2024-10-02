class S2CPlayerAbilitiesPacket {
  flags;
  flyingSpeed;
  fieldOfViewModifier;

  constructor({ flags, flyingSpeed, fieldOfViewModifier }) {
    this.flags = flags;
    this.flyingSpeed = flyingSpeed;
    this.fieldOfViewModifier = fieldOfViewModifier;
  }

  async encode(stream) {
    stream.writeByte(this.flags);
    stream.writeFloat(this.flyingSpeed);
    stream.writeFloat(this.fieldOfViewModifier);
  }
}

module.exports = { S2CPlayerAbilitiesPacket };
