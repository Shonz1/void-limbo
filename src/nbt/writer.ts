import assert from 'assert';
import { Writable } from 'stream';

import { DataType } from './data-type';
import { Endian } from './endian';
import { Byte, Double, Float, Int, Long, Short } from './types';

export class Writer {
  private readonly stream: Writable;
  private readonly endian: Endian;

  private readonly typeToReadMethod = new Map<DataType, (...args: any[]) => void>([
    [DataType.BYTE, this.writeByte],
    [DataType.SHORT, this.writeShort],
    [DataType.INT, this.writeInt],
    [DataType.LONG, this.writeLong],
    [DataType.FLOAT, this.writeFloat],
    [DataType.DOUBLE, this.writeDouble],
    [DataType.BYTE_ARRAY, this.writeByteArray],
    [DataType.STRING, this.writeString],
    [DataType.LIST, this.writeList],
    [DataType.COMPOUND, this.writeCompound],
    [DataType.INT_ARRAY, this.writeIntArray],
    [DataType.LONG_ARRAY, this.writeLongArray],
  ]);

  constructor(stream: Writable, endian: Endian = Endian.BIG_ENDIAN) {
    this.stream = stream;
    this.endian = endian;
  }

  writeByte(value: Byte) {
    this.write(value.toBuffer());
  }

  writeShort(value: Short) {
    this.write(value.toBuffer(this.endian));
  }

  writeInt(value: Int) {
    this.write(value.toBuffer(this.endian));
  }

  writeLong(value: Long) {
    this.write(value.toBuffer(this.endian));
  }

  writeFloat(value: Float) {
    this.write(value.toBuffer(this.endian));
  }

  writeDouble(value: Double) {
    this.write(value.toBuffer(this.endian));
  }

  writeByteArray(value: Buffer | number[]) {
    this.writeInt(new Int(value.length));
    this.write(Buffer.from(value));
  }

  writeString(value: string) {
    this.writeShort(new Short(value.length));
    if (value.length) {
      this.write(Buffer.from(value, 'utf8'));
    }
  }

  writeList(value: any[], type: DataType) {
    this.writeByte(new Byte(type));
    this.writeInt(new Int(value.length));

    for (const item of value) {
      this.writeType(type, item);
    }
  }

  writeCompound(value: Record<string, unknown>) {
    for (const [name, item] of Object.entries(value)) {
      const type = this.getItemType(item);
      if (!type) {
        continue;
      }

      if (type === DataType.LIST) {
        assert(Array.isArray(item));
        const listType = this.getItemType(item[0]);
        if (!listType) {
          continue;
        }

        this.writeByte(new Byte(type));
        this.writeString(name);
        this.writeList(item, listType);
      } else {
        this.writeByte(new Byte(type));
        this.writeString(name);
        this.writeType(type, item);
      }
    }

    this.writeByte(new Byte(DataType.END));
  }

  writeIntArray(value: number[]) {
    this.writeInt(new Int(value.length));
    for (const item of value) {
      this.writeInt(new Int(item));
    }
  }

  writeLongArray(value: bigint[]) {
    this.writeInt(new Int(value.length));
    for (const item of value) {
      this.writeLong(new Long(item));
    }
  }

  encode(value: Record<string, unknown>) {
    this.writeByte(new Byte(DataType.COMPOUND));
    this.writeCompound(value);
  }

  encodeNamed(value: Record<string, unknown>) {
    this.writeByte(new Byte(DataType.COMPOUND));
    this.writeString('');
    this.writeCompound(value);
  }

  private getItemType(item: any): DataType | null {
    if (item instanceof Byte) {
      return DataType.BYTE;
    } else if (item instanceof Short) {
      return DataType.SHORT;
    } else if (item instanceof Int) {
      return DataType.INT;
    } else if (item instanceof Long) {
      return DataType.LONG;
    } else if (item instanceof Float) {
      return DataType.FLOAT;
    } else if (item instanceof Double) {
      return DataType.DOUBLE;
    } else if (typeof item === 'boolean') {
      return DataType.BYTE;
    } else if (typeof item === 'string') {
      return DataType.STRING;
    } else if (item instanceof Buffer) {
      return DataType.BYTE_ARRAY;
    } else if (Array.isArray(item)) {
      if (item[0] instanceof Int) {
        return DataType.INT_ARRAY;
      }

      if (item[0] instanceof Long) {
        return DataType.LONG_ARRAY;
      }

      return DataType.LIST;
    } else if (typeof item === 'object') {
      return DataType.COMPOUND;
    }

    return null;
  }

  private writeType(type: DataType, value: any, listType?: DataType) {
    this.typeToReadMethod.get(type)?.call(this, value, listType);
  }

  private write(data: Buffer) {
    if (!data.length) {
      return;
    }

    return this.stream.write(data, 'utf8');
  }
}
