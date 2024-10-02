import { join } from 'path';

import { ProtocolVersion } from '../../../api';
import { Byte, Long } from '../../../nbt/types';
import {
  BitSet,
  Chunk,
  ChunkSection,
  DirectPalette,
  IndirectPalette,
  Palette,
  PaletteContainer,
  RegionCompound,
  SingleValuedPalette,
} from '../../types';
import { getBiomeStateBitsPerEntity, getBlockStateBitsPerEntity, getBlockStateId } from '../../utils';

interface BlockStates {
  palette: { Name: string; Properties: Record<string, string> }[];
  data: Long[];
}

interface Biomes {
  palette: string[];
  data: Long[];
}

interface SectionData {
  Y: Byte;
  block_states?: BlockStates;
  biomes?: Biomes;
  SkyLight?: Byte[];
  BlockLight?: Byte[];
}

interface ChunkData extends RegionCompound {
  Heightmaps: Record<string, Long[]>;
  sections: SectionData[];
}

export const parse = (chunkData: ChunkData, protocolVersion: ProtocolVersion): Chunk => {
  const minecraftBlocksData = require(join(process.cwd(), 'data', protocolVersion.getVersion().toString(), 'blocks.json'));

  const xPos = chunkData.xPos.valueOf();
  const zPos = chunkData.zPos.valueOf();

  const heightmaps = chunkData.Heightmaps;

  const sections: ChunkSection[] = [];

  for (const section of chunkData.sections) {
    if (!section.block_states) {
      console.warn('No block states found for section', section.Y?.valueOf());
      continue;
    }

    const blockStatesData = (section.block_states.data as Long[]) ?? [];
    const blockPalettes = section.block_states.palette ?? [];

    const blockBitsPerEntity = getBlockStateBitsPerEntity(blockPalettes.length);
    let blockPalette: Palette = new SingleValuedPalette(0);

    if (blockBitsPerEntity === 0) {
      blockPalette = new SingleValuedPalette(getBlockStateId(minecraftBlocksData, blockPalettes[0].Name));
    } else if (blockBitsPerEntity <= 8) {
      blockPalette = new IndirectPalette(
        blockPalettes.map(palette => getBlockStateId(minecraftBlocksData, palette.Name, palette.Properties)),
      );
    } else {
      blockPalette = new DirectPalette();
    }

    const blockData = new BitSet(blockStatesData.map(i => i.valueOf()));

    const biomeBitsPerEntity = getBiomeStateBitsPerEntity(1);
    const biomePalette = new IndirectPalette([1]);
    const biomeData = new BitSet();

    sections.push(
      new ChunkSection(
        blockStatesData.filter(i => !!i.valueOf()).length,
        new PaletteContainer(blockBitsPerEntity, blockPalette, blockData),
        new PaletteContainer(biomeBitsPerEntity, biomePalette, biomeData),
      ),
    );
  }

  // Light
  const sectionsWithSkyLight = chunkData.sections.map((s, i) => ({ index: i, section: s })).filter(i => !!i.section.SkyLight);
  const sectionsWithBlockLight = chunkData.sections.map((s, i) => ({ index: i, section: s })).filter(i => !!i.section.BlockLight);

  const skyLightMask = new BitSet();
  for (const { index } of sectionsWithSkyLight) {
    skyLightMask.set(index, 1);
  }

  const blockLightMask = new BitSet();
  for (const { index } of sectionsWithBlockLight) {
    blockLightMask.set(index, 1);
  }

  return new Chunk(
    xPos,
    zPos,
    heightmaps,
    sections,
    [],
    skyLightMask,
    blockLightMask,
    new BitSet(),
    new BitSet(),
    sectionsWithSkyLight.map(({ section }) => Buffer.from(section.SkyLight?.map(byte => byte.valueOf()) ?? [])),
    sectionsWithBlockLight.map(({ section }) => Buffer.from(section.BlockLight?.map(byte => byte.valueOf()) ?? [])),
  );
};
