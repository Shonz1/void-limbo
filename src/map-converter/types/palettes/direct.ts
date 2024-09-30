import { MinecraftStream } from '../../minecraft.stream';

import { Palette } from './palette';

export class DirectPalette extends Palette {
  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async encode(stream: MinecraftStream) {}
}
