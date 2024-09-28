// import { createWriteStream, readFileSync } from 'node:fs';
// import { join } from 'node:path';

import { createWriteStream } from 'node:fs';
import { join } from 'node:path';

import { MapConverter } from './map-converter';
import { MinecraftStream } from './network';
import { WrapperStream } from './network/streams/wrapper.stream';

const generateChunkFile = async (regionX: number, regionZ: number) => {
  const mapConverter = await MapConverter.fromRegionFile(join(process.cwd(), `/data/map/Lobby/region/r.${regionX}.${regionZ}.mca`));
  const chunks = mapConverter.getChunks();

  for (const chunk of chunks) {
    const writeStream = createWriteStream(join(process.cwd(), `/data/765/map/chunk.${chunk.x}.${chunk.z}.dat`));
    const minecraftStream = new MinecraftStream(new WrapperStream(writeStream as any));

    await chunk.encode(minecraftStream);
  }
};

(async () => {
  for (let regionX = -1; regionX <= 0; regionX++) {
    for (let regionZ = -1; regionZ <= 0; regionZ++) {
      await generateChunkFile(regionX, regionZ);
    }
  }

  // await generateChunkFile(0, 0);
})();
