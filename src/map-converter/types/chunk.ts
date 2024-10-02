import { ProtocolVersion } from '../../api';
import { Long } from '../../nbt/types';
import { MinecraftStream } from '../minecraft.stream';
import { WrapperStream } from '../wrapper.stream';

import { BitSet } from './bitset';
import { BlockEntity } from './block-entity';
import { ChunkSection } from './chunk-section';

export class Chunk {
  constructor(
    public readonly x: number,
    public readonly z: number,
    private heightmaps: Record<string, Long[]>,
    private sections: ChunkSection[],
    private blockEntities: BlockEntity[] = [],
    private skyLightMask: BitSet,
    private blockLightMask: BitSet,
    private emptySkyLightMask: BitSet,
    private emptyBlockLightMask: BitSet,
    private skyLight: Buffer[],
    private blockLight: Buffer[],
  ) {}

  async encode(stream: MinecraftStream, protocolVersion: ProtocolVersion) {
    if (protocolVersion.compare(ProtocolVersion.MINECRAFT_1_13) === 0) {
      stream.writeInt(this.x);
      stream.writeInt(this.z);
      stream.writeBoolean(true);
      stream.writeVarInt(Number(this.blockLightMask.getValues()[0]));

      const dataBuf: number[] = [];
      const dataStream = new MinecraftStream(new WrapperStream({ write: (chunk: Buffer) => dataBuf.push(...chunk) } as any));

      for (const section of this.sections) {
        await section.encode(dataStream);
      }

      stream.writeVarInt(dataBuf.length);
      stream.write(Buffer.from(dataBuf));

      stream.writeVarInt(this.blockEntities.length);
      for (const blockEntity of this.blockEntities) {
        stream.writeCompound({
          x: blockEntity.getX(),
          y: blockEntity.getY(),
          z: blockEntity.getZ(),
          ...blockEntity.getNbt(),
        });
      }
    } else {
      stream.writeInt(this.x);
      stream.writeInt(this.z);

      stream.writeCompound(this.heightmaps);

      const dataBuf: number[] = [];
      const dataStream = new MinecraftStream(new WrapperStream({ write: (chunk: Buffer) => dataBuf.push(...chunk) } as any));

      for (const section of this.sections) {
        await section.encode(dataStream);
      }

      stream.writeVarInt(dataBuf.length);
      stream.write(Buffer.from(dataBuf));

      stream.writeVarInt(this.blockEntities.length);
      for (const blockEntity of this.blockEntities) {
        await blockEntity.encode(stream);
      }

      await this.skyLightMask.toStream(stream);
      await this.blockLightMask.toStream(stream);
      await this.emptySkyLightMask.toStream(stream);
      await this.emptyBlockLightMask.toStream(stream);

      stream.writeVarInt(this.skyLight.length);
      for (const light of this.skyLight) {
        stream.writeVarInt(light.length);
        stream.write(light);
      }

      stream.writeVarInt(this.blockLight.length);
      for (const light of this.blockLight) {
        stream.writeVarInt(light.length);
        stream.write(light);
      }
    }
  }
}
