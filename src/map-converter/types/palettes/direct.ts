import { MinecraftStream } from '../../../network';

import { Palette } from './palette';

export class DirectPalette extends Palette {
  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async encode(stream: MinecraftStream) {}
}
