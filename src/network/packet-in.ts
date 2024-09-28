import { MinecraftStream } from './minecraft.stream';

export abstract class PacketIn {
  abstract decode(stream: MinecraftStream, size: number): Promise<void>;
  abstract toString(): string;
}

export type PacketInType = (new () => PacketIn) & typeof PacketIn;
