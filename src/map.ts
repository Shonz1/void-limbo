import { createWriteStream } from 'fs';
import { join } from 'path';

import { ProtocolVersion } from './api';
import { MapConverter } from './map-converter';
import { MinecraftStream } from './map-converter/minecraft.stream';
import { WrapperStream } from './map-converter/wrapper.stream';

const generateChunkFile = async (protocolVersion: ProtocolVersion, regionX: number, regionZ: number) => {
  const mapConverter = await MapConverter.fromRegionFile(
    join(process.cwd(), `/data/map/Lobby/region/r.${regionX}.${regionZ}.mca`),
    protocolVersion,
  );
  const chunks = mapConverter.getChunks();

  for (const chunk of chunks) {
    const writeStream = createWriteStream(join(process.cwd(), `/data/${protocolVersion.getVersion()}/map/chunk.${chunk.x}.${chunk.z}.dat`));
    const minecraftStream = new MinecraftStream(new WrapperStream(writeStream as any));

    await chunk.encode(minecraftStream, protocolVersion);
  }
};

(async () => {
  for (let regionX = -1; regionX <= 0; regionX++) {
    for (let regionZ = -1; regionZ <= 0; regionZ++) {
      await generateChunkFile(ProtocolVersion.MINECRAFT_1_20, regionX, regionZ);
    }
  }

  // await generateChunkFile(0, 0);
})();
