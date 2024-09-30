import { MinecraftStream } from '../minecraft.stream';

export class BitSet {
  constructor(private values: bigint[] = []) {}

  getValues() {
    return [...this.values];
  }

  get(index: number): 0 | 1 {
    const longIndex = Math.floor(index / 64);
    if (longIndex >= this.values.length) {
      return 0;
    }

    const long = this.values[longIndex];

    return (long & (1n << BigInt(index % 64))) !== 0n ? 1 : 0;
  }

  set(index: number, value: 0 | 1): void {
    const longIndex = Math.floor(index / 64);
    if (longIndex >= this.values.length) {
      for (let i = this.values.length; i <= longIndex; i++) {
        this.values[i] = 0n;
      }
    }

    if (value) {
      this.values[longIndex] |= 1n << BigInt(index % 64);
    } else {
      this.values[longIndex] &= ~(1n << BigInt(index % 64));
    }
  }

  async toStream(stream: MinecraftStream): Promise<void> {
    stream.writeVarInt(this.values.length);
    for (const value of this.values) {
      stream.writeLong(value);
    }
  }
}
