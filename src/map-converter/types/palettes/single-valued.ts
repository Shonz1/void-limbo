import { MinecraftStream } from '../../minecraft.stream';

import { Palette } from './palette';

export class SingleValuedPalette extends Palette {
  constructor(private value: number) {
    super();
  }

  async encode(stream: MinecraftStream) {
    stream.writeVarInt(this.value);
  }
}
