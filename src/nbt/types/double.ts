import { Endian } from '../endian';

export class Double {
  private readonly value;

  constructor(value: number) {
    this.value = value;

    this.validate();
  }

  static fromBuffer(buffer: Buffer, endian = Endian.BIG_ENDIAN) {
    return new Double(endian === Endian.BIG_ENDIAN ? buffer.readDoubleBE() : buffer.readDoubleLE());
  }

  toBuffer(endian = Endian.BIG_ENDIAN) {
    const buffer = Buffer.alloc(8);
    endian === Endian.BIG_ENDIAN ? buffer.writeDoubleBE(this.value) : buffer.writeDoubleLE(this.value);

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
