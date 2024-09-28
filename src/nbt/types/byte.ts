export class Byte {
  private readonly value;

  constructor(value: number) {
    this.value = value;

    this.validate();
  }

  static fromBuffer(buffer: Buffer) {
    return new Byte(buffer.readInt8());
  }

  toBuffer() {
    const buffer = Buffer.alloc(1);
    buffer.writeInt8(this.value);
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
