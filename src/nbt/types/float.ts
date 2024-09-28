import { Endian } from '../endian';

export class Float {
  private readonly value;

  constructor(value: number) {
    this.value = value;

    this.validate();
  }

  static fromBuffer(buffer: Buffer, endian = Endian.BIG_ENDIAN) {
    return new Float(endian === Endian.BIG_ENDIAN ? buffer.readFloatBE() : buffer.readFloatLE());
  }

  toBuffer(endian = Endian.BIG_ENDIAN) {
    const buffer = Buffer.alloc(4);
    endian === Endian.BIG_ENDIAN ? buffer.writeFloatBE(this.value) : buffer.writeFloatLE(this.value);

    return buffer;
  }

  valueOf(): number {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }

  private validate() {
    return !!this.toBuffer();
  }
}
