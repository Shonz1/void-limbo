import { MinecraftStream } from '../minecraft.stream';

import { PaletteContainer } from './palette-container';

export class ChunkSection {
  constructor(
    private blockCount: number,
    private blockStates: PaletteContainer,
    private biomes: PaletteContainer,
  ) {}

  async encode(stream: MinecraftStream) {
    stream.writeShort(this.blockCount);
    await this.blockStates.encode(stream);
    await this.biomes.encode(stream);
  }
}
