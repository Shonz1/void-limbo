import { PassThrough } from 'node:stream';

import { MinecraftManualStream } from '../../../../../api';

export class SimpleMemoryStream extends MinecraftManualStream {
  baseStream = new PassThrough();

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

  async write(data: Buffer): Promise<void> {
    this.baseStream?.write(data);
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
