import { MinecraftStream } from '../../minecraft.stream';

import { Palette } from './palette';

export class IndirectPalette extends Palette {
  constructor(private values: number[]) {
    super();
  }

  async encode(stream: MinecraftStream) {
    stream.writeVarInt(this.values.length);

    for (const value of this.values) {
      stream.writeVarInt(value);
    }
  }
}
