import { Readable } from 'stream';

import { DataType } from './data-type';
import { Endian } from './endian';
import { Byte, Double, Float, Int, Long, Short } from './types';

export class Reader {
  private readonly stream: Readable;
  private readonly endian: Endian;

  private readonly typeToReadMethod = new Map<DataType, () => unknown>([
    [DataType.BYTE, this.readByteAsync],
    [DataType.SHORT, this.readShortAsync],
    [DataType.INT, this.readIntAsync],
    [DataType.LONG, this.readLongAsync],
    [DataType.FLOAT, this.readFloatAsync],
    [DataType.DOUBLE, this.readDoubleAsync],
    [DataType.BYTE_ARRAY, this.readByteArrayAsync],
    [DataType.STRING, this.readStringAsync],
    [DataType.LIST, this.readListAsync],
    [DataType.COMPOUND, this.readCompoundAsync],
    [DataType.INT_ARRAY, this.readIntArrayAsync],
    [DataType.LONG_ARRAY, this.readLongArrayAsync],
  ]);

  constructor(stream: Readable, endian: Endian = Endian.BIG_ENDIAN) {
    this.stream = stream;
    this.endian = endian;
  }

  async readByteAsync() {
    return this.readAsync(1).then(b => Byte.fromBuffer(b));
  }

  async readShortAsync() {
    return this.readAsync(2).then(b => Short.fromBuffer(b, this.endian));
  }

  async readIntAsync() {
    return this.readAsync(4).then(b => Int.fromBuffer(b, this.endian));
  }

  async readLongAsync() {
    return this.readAsync(8).then(b => Long.fromBuffer(b, this.endian));
  }

  async readFloatAsync() {
    return this.readAsync(4).then(b => Float.fromBuffer(b, this.endian));
  }

  async readDoubleAsync() {
    return this.readAsync(8).then(b => Double.fromBuffer(b, this.endian));
  }

  async readByteArrayAsync() {
    const length = await this.readIntAsync();
    return this.readAsync(length.valueOf());
  }

  async readStringAsync() {
    const length = await this.readShortAsync();
    return this.readAsync(length.valueOf()).then(b => b.toString('utf8'));
  }

  async readListAsync() {
    const type = await this.readByteAsync();
    const length = await this.readIntAsync();
    const list = [];

    for (let i = 0; i < length.valueOf(); i++) {
      list.push(await this.readTypeAsync(type.valueOf()));
    }

    return list;
  }

  async readCompoundAsync() {
    const compound: Record<string, unknown> = {};

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const type = await this.readByteAsync();
      if (!type || type.valueOf() === DataType.END) {
        break;
      }

      const name = await this.readStringAsync();
      const value = await this.readTypeAsync(type.valueOf());

      compound[name] = value;
    }

    return compound;
  }

  async readIntArrayAsync() {
    const length = await this.readIntAsync();
    const array = [];
    for (let i = 0; i < length.valueOf(); i++) {
      array.push(await this.readIntAsync());
    }

    return array;
  }

  async readLongArrayAsync() {
    const length = await this.readIntAsync();
    const array = [];
    for (let i = 0; i < length.valueOf(); i++) {
      array.push(await this.readLongAsync());
    }

    return array;
  }

  async decodeAsync() {
    await this.readByteAsync();

    return this.readCompoundAsync();
  }

  async decodeNamedAsync() {
    await this.readByteAsync();
    await this.readStringAsync();

    return this.readCompoundAsync();
  }

  private async readTypeAsync(type: DataType): Promise<unknown> {
    return this.typeToReadMethod.get(type)?.call(this) ?? null;
  }

  private async readAsync(length = 1): Promise<Buffer> {
    if (length === 0) {
      return Buffer.alloc(0);
    }

    await this.waitReadableSize(length);

    return this.stream.read(length);
  }

  private waitReadableSize(size: number): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (this.stream.readableLength >= size) {
          resolve();
        } else {
          this.stream.once('readable', check);
        }
      };

      check();
    });
  }
}
