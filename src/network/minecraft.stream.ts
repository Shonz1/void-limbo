import { Reader, Writer } from '../nbt';

import { WrapperStream } from './streams/wrapper.stream';

export class MinecraftStream {
  public stream;

  constructor(stream: WrapperStream) {
    this.stream = stream;
  }

  get closed() {
    return this.stream.closed;
  }

  close() {
    this.stream.end();
  }

  async readAsync(size = 1): Promise<Buffer> {
    await this.waitReadableSize(size);

    return this.stream.read(size) ?? Buffer.alloc(0);
  }

  async readByteAsync(): Promise<number> {
    return this.readAsync().then(buffer => buffer.readUInt8());
  }

  async readBooleanAsync(): Promise<boolean> {
    return this.readAsync().then(buffer => buffer.readUInt8() === 1);
  }

  async readShortAsync(): Promise<number> {
    return this.readAsync(2).then(buffer => buffer.readUInt16BE());
  }

  async readIntAsync(): Promise<number> {
    return this.readAsync(4).then(buffer => buffer.readUInt32BE());
  }

  async readLongAsync(): Promise<bigint> {
    return this.readAsync(8).then(buffer => buffer.readBigUInt64BE());
  }

  async readFloatAsync(): Promise<number> {
    return this.readAsync(4).then(buffer => buffer.readFloatBE());
  }

  async readDoubleAsync(): Promise<number> {
    return this.readAsync(8).then(buffer => buffer.readDoubleBE());
  }

  async readVarIntAsync(): Promise<number> {
    let numRead = 0;
    let result = 0;
    let read;
    do {
      read = await this.readAsync().then(buffer => buffer.readUInt8());
      const value = read & 0b01111111;
      result |= value << (7 * numRead);

      numRead++;
      if (numRead > 5) {
        throw new Error('VarInt is too big');
      }
    } while ((read & 0b10000000) !== 0);

    return result;
  }

  async readStringAsync(): Promise<string> {
    const length = await this.readVarIntAsync();

    return this.readAsync(length).then(buffer => buffer.toString('utf-8'));
  }

  readCompoundAsync(): Promise<Record<string, unknown>> {
    const reader = new Reader(this as any);
    return reader.decodeAsync();
  }

  readNamedCompoundAsync(): Promise<Record<string, unknown>> {
    const reader = new Reader(this as any);
    return reader.decodeNamedAsync();
  }

  write(data: Buffer): void {
    this.stream.write(data);
  }

  writeByte(value: number): void {
    this.write(Buffer.from([value]));
  }

  writeBoolean(value: boolean): void {
    this.write(Buffer.from([value ? 1 : 0]));
  }

  writeShort(value: number): void {
    this.write(Buffer.from([(value >> 8) & 0xff, value & 0xff]));
  }

  writeInt(value: number): void {
    this.write(Buffer.from([(value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]));
  }

  writeLong(value: bigint): void {
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(value);
    this.write(buffer);
  }

  writeFloat(value: number): void {
    const buffer = Buffer.alloc(4);
    buffer.writeFloatBE(value);

    this.write(buffer);
  }

  writeDouble(value: number): void {
    const buffer = Buffer.alloc(8);
    buffer.writeDoubleBE(value);

    this.write(buffer);
  }

  writeVarInt(value: number): void {
    const SEGMENT_BITS = 0x7f;
    const CONTINUE_BIT = 0x80;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if ((value & ~SEGMENT_BITS) === 0) {
        this.writeByte(value);
        return;
      }

      this.writeByte((value & SEGMENT_BITS) | CONTINUE_BIT);

      value >>>= 7;
    }
  }

  writeString(value: string): void {
    this.writeVarInt(value.length);
    this.write(Buffer.from(value, 'utf8'));
  }

  writeUuid(value: string): void {
    this.write(Buffer.from(value, 'hex'));
  }

  writeTextComponent(value: Record<string, unknown>) {
    this.writeString(JSON.stringify(value));
  }

  writeCompound(value: Record<string, unknown>) {
    const writer = new Writer(this as any);
    writer.encode(value);
  }

  writeNamedCompound(value: Record<string, unknown>) {
    const writer = new Writer(this as any);
    writer.encodeNamed(value);
  }

  private waitReadableSize(size: number): Promise<void> {
    return new Promise(resolve => this.check(size, resolve));
  }

  private check(size: number, callback: () => void) {
    if (this.stream.readableLength >= size) {
      callback();
    } else {
      this.stream.once('readable', () => this.check(size, callback));
    }
  }
}
