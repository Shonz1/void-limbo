import { Reader } from '../nbt';

import { Chunk, RegionCompound, RegionFile } from './types';

export class MapConverter {
  constructor(private chunks: Chunk[]) {}

  static async fromRegionFile(path: string, protocolVersion: number): Promise<MapConverter> {
    const regionFile = new RegionFile(path);
    await regionFile.load();

    const result = [];

    for (let chunkX = 0; chunkX < 32; chunkX++) {
      for (let chunkZ = 0; chunkZ < 32; chunkZ++) {
        const dataStream = await regionFile.getChunkDataStream(chunkX, chunkZ);
        if (!dataStream) {
          continue;
        }

        const reader = new Reader(dataStream);
        const chunkData = (await reader.decodeNamedAsync()) as RegionCompound;

        const { parse }: { parse: (chunkData: RegionCompound, protocolVersion: number) => Chunk } = await import(
          `./versions/region/version-${chunkData.DataVersion}`
        );

        result.push(await parse(chunkData, protocolVersion));
      }
    }

    return new MapConverter(result);
  }

  getChunks(): Chunk[] {
    return [...this.chunks];
  }
}
