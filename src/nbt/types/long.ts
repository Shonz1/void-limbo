import { Endian } from '../endian';

export class Long {
  private readonly value;

  constructor(value: bigint) {
    this.value = value;

    this.validate();
  }

  static fromBuffer(buffer: Buffer, endian = Endian.BIG_ENDIAN) {
    return new Long(endian === Endian.BIG_ENDIAN ? buffer.readBigInt64BE() : buffer.readBigInt64LE());
  }

  toBuffer(endian = Endian.BIG_ENDIAN) {
    const buffer = Buffer.alloc(8);
    endian === Endian.BIG_ENDIAN ? buffer.writeBigInt64BE(this.value) : buffer.writeBigInt64LE(this.value);

    return buffer;
  }

  valueOf(): bigint {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }

  private validate() {
    return !!this.toBuffer();
  }
}
