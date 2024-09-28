import { MinecraftStream } from './minecraft.stream';

export abstract class PacketOut {
  static id: number;

  constructor(params: any = {}) {
    Object.assign(params, {});
  }
  abstract encode(stream: MinecraftStream): Promise<void>;
  abstract getSize(): number;
  abstract toString(): string;
}

export type PacketOutType = (new (params?: {} & any) => PacketOut) & typeof PacketOut;
