import { PassThrough } from 'stream';

import { MinecraftManualStream } from '../../../../../api';

export class SimpleMemoryStream extends MinecraftManualStream {
  baseStream = new PassThrough({ highWaterMark: Number.MAX_SAFE_INTEGER });

  constructor(buffer?: Buffer) {
    super();

    if (buffer) {
      this.baseStream.write(buffer);
    }
  }

  get closed(): boolean {
    return this.baseStream?.closed ?? true;
  }

  async read(size = 1): Promise<Buffer> {
    await this.waitReadableSize(size);

    return this.baseStream?.read(size) ?? Buffer.alloc(0);
  }

  write(data: Buffer): void {
    if (!this.baseStream?.write(data)) {
      throw new Error(`Cannot write data to stream`);
    }
  }

  destroy(): void {
    this.baseStream?.destroy();
  }

  private waitReadableSize(size: number): Promise<void> {
    return new Promise(resolve => this.check(size, resolve));
  }

  private check(size: number, callback: () => void) {
    if (!this.baseStream) {
      throw new Error('Stream is not connected');
    }

    if (this.baseStream.readableLength >= size) {
      callback();
    } else {
      this.baseStream.once('readable', () => this.check(size, callback));
    }
  }
}
