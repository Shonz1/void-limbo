import { Int } from '../../nbt/types';

export interface RegionCompound {
  [key: string]: unknown;

  DataVersion: Int;
  xPos: Int;
  yPos: Int;
  zPos: Int;
}
