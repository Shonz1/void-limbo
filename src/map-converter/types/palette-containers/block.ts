import { BitSet } from '../bitset';
import { PaletteContainer } from '../palette-container';
import { Palette } from '../palettes';

export class BlockPaletteContainer extends PaletteContainer {
  private blocks = Array(4096).fill(0);

  constructor(bitPerEntity: number, palette: Palette, data: BitSet) {
    super(bitPerEntity, palette, data);
  }
}
