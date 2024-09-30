import { MinecraftStream } from '../minecraft.stream';

export class BlockEntity {
  constructor(
    private x: number,
    private y: number,
    private z: number,
    private type: number,
    private nbt: Record<string, unknown>,
  ) {}

  async encode(stream: MinecraftStream) {
    stream.writeByte(((this.x & 0xf) << 4) | (this.z & 0xf));
    stream.writeShort(this.y);
    stream.writeVarInt(this.type);
    stream.writeCompound(this.nbt);
  }
}
