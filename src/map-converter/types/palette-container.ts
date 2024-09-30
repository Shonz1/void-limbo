import { MinecraftStream } from '../minecraft.stream';

import { BitSet } from './bitset';
import { Palette } from './palettes';

export class PaletteContainer {
  constructor(
    private bitPerEntity: number,
    private palette: Palette,
    private data: BitSet,
  ) {}

  async encode(stream: MinecraftStream) {
    stream.writeByte(this.bitPerEntity);
    await this.palette.encode(stream);
    await this.data.toStream(stream);
  }
}
