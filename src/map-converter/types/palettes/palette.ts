import { MinecraftStream } from '../../../network';

export abstract class Palette {
  abstract encode(stream: MinecraftStream): Promise<void>;
}
