import { FileHandle, open } from 'node:fs/promises';
import { PassThrough, Readable } from 'node:stream';
import { unzipSync } from 'node:zlib';

export class RegionFile {
  static readonly SECTOR_BYTES = 4096;
  static readonly SECTOR_INTS = RegionFile.SECTOR_BYTES / 4;

  private readonly offsets: number[] = new Array(RegionFile.SECTOR_INTS).fill(0);
  private sectorsFree: boolean[] = new Array(RegionFile.SECTOR_INTS).fill(true);

  constructor(private readonly filePath: string) {}

  async load() {
    const file = await this.openFile(this.filePath);

    const fileSize = await file.stat().then(i => i.size);
    const nSectors = fileSize / RegionFile.SECTOR_BYTES;
    this.sectorsFree = new Array(nSectors).fill(true);

    this.sectorsFree[0] = false;
    this.sectorsFree[1] = false;

    for (let i = 0; i < RegionFile.SECTOR_INTS; i++) {
      const offset = await file.read(Buffer.alloc(4), 0, 4, i * 4).then(buffer => buffer.buffer.readUInt32BE());
      this.offsets[i] = offset;

      if (offset !== 0 && (offset >> 8) + (offset & 0xff) <= this.sectorsFree.length) {
        for (let sectorNum = 0; sectorNum < (offset & 0xff); ++sectorNum) {
          this.sectorsFree[(offset >> 8) + sectorNum] = false;
        }
      }
    }

    await this.closeFile(file);
  }

  async getChunkDataStream(chunkX: number, chunkZ: number): Promise<Readable | null> {
    const file = await this.openFile(this.filePath);

    try {
      const offset = this.getOffset(chunkX, chunkZ);
      if (offset === 0) {
        console.warn('Chunk not found');
        return null;
      }

      const sectorNumber = offset >> 8;
      const numSectors = offset & 0xff;
      if (sectorNumber + numSectors > this.sectorsFree.length) {
        console.warn('Sector number out of bounds', offset, sectorNumber, numSectors, this.sectorsFree.length);
        return null;
      }

      const fileOffset = sectorNumber * RegionFile.SECTOR_BYTES;

      const length = await file.read(Buffer.alloc(4), 0, 4, fileOffset).then(buffer => buffer.buffer.readUInt32BE());
      if (length > RegionFile.SECTOR_BYTES * numSectors) {
        console.warn('Chunk length out of bounds');
        return null;
      }

      const compressionType = await file.read(Buffer.alloc(1), 0, 1, fileOffset + 4).then(buffer => buffer.buffer.readUInt8());

      const data = Buffer.alloc(length - 1);
      await file.read(data, 0, data.length, fileOffset + 5);

      const stream = new PassThrough();

      switch (compressionType) {
        case 1:
        case 2: {
          const inflatedData = unzipSync(data);
          stream.end(inflatedData);
          break;
        }

        default:
          stream.end(data);
          break;
      }

      return stream;
    } finally {
      await this.closeFile(file);
    }
  }

  getOffset(chunkX: number, chunkZ: number) {
    return this.offsets[chunkX + chunkZ * 32];
  }

  private async openFile(filePath: string) {
    return open(filePath, 'r');
  }

  private async closeFile(file: FileHandle) {
    return file.close();
  }
}
