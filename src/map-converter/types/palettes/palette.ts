import { MinecraftStream } from '../../minecraft.stream';

export abstract class Palette {
  abstract encode(stream: MinecraftStream): Promise<void>;
}
