import { MinecraftStreamBase } from './minecraft-stream-base';

export interface MinecraftStream extends MinecraftStreamBase {
  baseStream?: MinecraftStreamBase;
}
