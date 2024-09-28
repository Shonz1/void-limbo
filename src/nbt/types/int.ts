import { Endian } from '../endian';

export class Int {
  private readonly value;

  constructor(value: number) {
    this.value = value;

    this.validate();
  }

  static fromBuffer(buffer: Buffer, endian = Endian.BIG_ENDIAN) {
    return new Int(endian === Endian.BIG_ENDIAN ? buffer.readInt32BE() : buffer.readInt32LE());
  }

  toBuffer(endian = Endian.BIG_ENDIAN) {
    const buffer = Buffer.alloc(4);
    endian === Endian.BIG_ENDIAN ? buffer.writeInt32BE(this.value) : buffer.writeInt32LE(this.value);

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
