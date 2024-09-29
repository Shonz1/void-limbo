import { Reader, Writer } from '../../../../nbt';

import { MinecraftStream } from './minecraft-stream';
import { MinecraftStreamBase } from './minecraft-stream-base';

export abstract class MinecraftManualStream implements MinecraftStream {
  abstract baseStream?: MinecraftStreamBase;

  get closed(): boolean {
    return this.baseStream?.closed ?? true;
  }

  destroy(): void {
    this.baseStream?.destroy();
  }

  async readByte(): Promise<number> {
    return this.read(1).then(buffer => buffer.readUInt8());
  }

  async readBoolean(): Promise<boolean> {
    return this.read(1).then(buffer => buffer.readUInt8() === 1);
  }

  async readShort(): Promise<number> {
    return this.read(2).then(buffer => buffer.readUInt16BE());
  }

  async readInt(): Promise<number> {
    return this.read(4).then(buffer => buffer.readUInt32BE());
  }

  async readLong(): Promise<bigint> {
    return this.read(8).then(buffer => buffer.readBigUInt64BE());
  }

  async readFloat(): Promise<number> {
    return this.read(4).then(buffer => buffer.readFloatBE());
  }

  async readDouble(): Promise<number> {
    return this.read(8).then(buffer => buffer.readDoubleBE());
  }

  async readVarInt(): Promise<number> {
    let numRead = 0;
    let result = 0;
    let read;
    do {
      read = await this.read(1).then(buffer => buffer.readUInt8());
      const value = read & 0b01111111;
      result |= value << (7 * numRead);

      numRead++;
      if (numRead > 5) {
        throw new Error('VarInt is too big');
      }
    } while ((read & 0b10000000) !== 0);

    return result;
  }

  async readString(): Promise<string> {
    const length = await this.readVarInt();

    return this.read(length).then(buffer => buffer.toString('utf-8'));
  }

  readCompound(): Promise<Record<string, unknown>> {
    const reader = new Reader(this as any);
    return reader.decodeAsync();
  }

  readNamedCompound(): Promise<Record<string, unknown>> {
    const reader = new Reader(this as any);
    return reader.decodeNamedAsync();
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

  abstract read(size: number): Promise<Buffer>;
  abstract write(data: Buffer): Promise<void>;
}
