import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

import { ProtocolVersion } from '../api';
import { SimpleMemoryStream } from '../common';

export const readRegistry = async (protocolVersion: ProtocolVersion) => {
  const registriesPath = join(process.cwd(), 'data', 'registries', protocolVersion.getVersion().toString());

  if (protocolVersion.compare(ProtocolVersion.MINECRAFT_1_20_5) < 0) {
    const data = await readFile(join(registriesPath, '0.dat'));
    const memoryStream = new SimpleMemoryStream(data);

    return memoryStream.readCompound();
  }

  const registryFiles = await readdir(registriesPath);
  const registry: Record<string, any[]> = {};

  for (const file of registryFiles) {
    const data = await readFile(join(registriesPath, file));
    const memoryStream = new SimpleMemoryStream(data);

    const registryId = await memoryStream.readString();
    const entries: any[] = [];

    const entryCount = await memoryStream.readVarInt();
    for (let i = 0; i < entryCount; i++) {
      const key = await memoryStream.readString();
      const hasValue = await memoryStream.readBoolean();

      const value = hasValue ? await memoryStream.readCompound() : null;

      entries.push({ key, value });
    }

    registry[registryId] = entries;
  }
};
