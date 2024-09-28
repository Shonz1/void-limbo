import { Endian } from '../endian';

export class Short {
  private readonly value;

  constructor(value: number) {
    this.value = value;

    this.validate();
  }

  static fromBuffer(buffer: Buffer, endian = Endian.BIG_ENDIAN) {
    return new Short(endian === Endian.BIG_ENDIAN ? buffer.readInt16BE() : buffer.readInt16LE());
  }

  toBuffer(endian = Endian.BIG_ENDIAN) {
    const buffer = Buffer.alloc(2);
    endian === Endian.BIG_ENDIAN ? buffer.writeInt16BE(this.value) : buffer.writeInt16LE(this.value);

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
