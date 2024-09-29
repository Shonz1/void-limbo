import { createWriteStream, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { MinecraftStream } from './map-converter/minecraft.stream';
import { RegionFile } from './map-converter/types';
import { WrapperStream } from './map-converter/wrapper.stream';
import { Reader } from './nbt';
import { Byte, Long } from './nbt/types';

const BLOCKS_DATA = JSON.parse(readFileSync(join(process.cwd(), `/data/765/blocks.json`)).toString('utf8'));

const deepEqual = (obj1: any, obj2: any) => {
  if (obj1 === obj2) {
    return true;
  }

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

const getBlockStateBitsPerEntity = (variantCount: number) => {
  const bitsPerEntity = Math.ceil(Math.log2(variantCount));

  if (bitsPerEntity === 0) {
    return variantCount;
  } else if (bitsPerEntity <= 4) {
    return 4;
  } else if (bitsPerEntity <= 8) {
    return bitsPerEntity;
  } else {
    return 0;
  }
};

const getBiomeStateBitsPerEntity = (variantCount: number) => {
  const bitsPerEntity = Math.ceil(Math.log2(variantCount));

  if (bitsPerEntity <= 3) {
    return variantCount;
  } else {
    return 0;
  }
};

const getBlockStateId = async (name: string, properties?: Record<string, unknown>) => {
  const blockData = BLOCKS_DATA[name] ?? {};
  const state = blockData.states.find((i: any) => deepEqual(i.properties, properties));
  const defaultState = blockData.states.find((i: any) => i.default);

  if (!state) {
    console.warn(`Block state ${name} ${JSON.stringify(properties)} not found`);
  }

  return state?.id ?? defaultState?.id ?? 0;
};

const generateChunkFile = async (regionX: number, regionZ: number, chunkX: number, chunkZ: number) => {
  const regionFile = new RegionFile(join(process.cwd(), `/data/map/Lobby/region/r.${regionX}.${regionZ}.mca`));
  await regionFile.load();

  const chunkStream = await regionFile.getChunkDataStream(chunkX, chunkZ);
  if (!chunkStream) {
    console.warn(`Chunk ${regionX * 32 + chunkX}, ${regionZ * 32 + chunkZ} not found`);
    return;
  }

  const reader = new Reader(chunkStream);
  const chunkData: any = await reader.decodeNamedAsync();

  const writeStream = createWriteStream(join(process.cwd(), `/data/765/map/chunk.${regionX * 32 + chunkX}.${regionZ * 32 + chunkZ}.dat`));

  const minecraftStream = new MinecraftStream(new WrapperStream(writeStream as any));

  minecraftStream.writeInt(chunkData.xPos);
  minecraftStream.writeInt(chunkData.zPos);

  minecraftStream.writeCompound(chunkData.Heightmaps);

  const buff: number[] = [];
  const minecraftStream2 = new MinecraftStream(new WrapperStream({ write: (chunk: Buffer) => buff.push(...chunk) } as any));

  const sections = chunkData.sections as any[];

  for (const section of sections) {
    if (!section.block_states) {
      console.warn('No block states found for section', section.Y?.valueOf());
      continue;
    }

    const blockStatesData = (section.block_states.data as Long[]) ?? [];

    const blockCount = blockStatesData.filter(i => !!i.valueOf()).length ?? 0;
    minecraftStream2.writeShort(blockCount);

    const blockPalettes = section.block_states.palette ?? [];
    const bitsPerEntity = getBlockStateBitsPerEntity(blockPalettes.length);
    minecraftStream2.writeByte(bitsPerEntity);

    if (bitsPerEntity === 0) {
      minecraftStream2.writeVarInt(await getBlockStateId(blockPalettes[0].Name));

      minecraftStream2.writeVarInt(0);

      continue;
    } else if (bitsPerEntity <= 8) {
      minecraftStream2.writeVarInt(blockPalettes.length);

      for (const palette of blockPalettes) {
        minecraftStream2.writeVarInt(await getBlockStateId(palette.Name, palette.Properties));
      }
    }

    minecraftStream2.writeVarInt(blockStatesData.length);
    for (const long of blockStatesData) {
      minecraftStream2.write(long.toBuffer());
    }

    const biomeBitsPerEntry = getBiomeStateBitsPerEntity(1);
    minecraftStream2.writeByte(biomeBitsPerEntry);
    minecraftStream2.writeVarInt(1);
    minecraftStream2.writeVarInt(1);

    minecraftStream2.writeVarInt(1);
    minecraftStream2.writeLong(0n);
  }

  minecraftStream.writeVarInt(buff.length);
  minecraftStream.write(Buffer.from(buff));

  // Number of block entities
  minecraftStream.writeVarInt(0);

  const sectionsWithSkyLight = sections.map((s, i) => [i, s]).filter(i => i[1].SkyLight);
  const sectionsWithBlockLight = sections.map((s, i) => [i, s]).filter(i => i[1].BlockLight);

  let skyLightMask = 0n;
  for (const [i] of sectionsWithSkyLight) {
    skyLightMask |= 1n << BigInt(i);
  }

  let blockLightMask = 0n;
  for (const [i] of sectionsWithBlockLight) {
    blockLightMask |= 1n << BigInt(i);
  }

  // Sky light mask
  minecraftStream.writeVarInt(1);
  minecraftStream.writeLong(skyLightMask);

  // Block light mask
  minecraftStream.writeVarInt(1);
  minecraftStream.writeLong(blockLightMask);

  // Empty sky light mask
  minecraftStream.writeVarInt(0);

  // Empty block light mask
  minecraftStream.writeVarInt(0);

  // Sky light array
  minecraftStream.writeVarInt(sectionsWithSkyLight.length);
  for (const [, section] of sectionsWithSkyLight) {
    const skyLight = section.SkyLight as Byte[];
    minecraftStream.writeVarInt(skyLight.length);
    for (const byte of skyLight) {
      minecraftStream.writeByte(byte.valueOf());
    }
  }

  // Block light array
  minecraftStream.writeVarInt(sectionsWithBlockLight.length);
  for (const [, section] of sectionsWithBlockLight) {
    const blockLight = section.BlockLight as Byte[];
    minecraftStream.writeVarInt(blockLight.length);
    for (const byte of blockLight) {
      minecraftStream.writeByte(byte.valueOf());
    }
  }

  writeStream.close();

  console.log(`Chunk ${regionX * 32 + chunkX}, ${regionZ * 32 + chunkZ} generated`);
};

(async () => {
  // for (let regionX = -1; regionX <= 0; regionX++) {
  //   for (let regionZ = -1; regionZ <= 0; regionZ++) {
  //     for (let i = 0; i < 32; i++) {
  //       for (let j = 0; j < 32; j++) {
  //         await generateChunkFile(regionX, regionZ, i, j);
  //       }
  //     }
  //   }
  // }

  // // await generateChunkFile(-1, -1, 25, 25);

  await generateChunkFile(0, 0, 0, 0);
})();
