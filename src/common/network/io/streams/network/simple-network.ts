import { Duplex } from 'node:stream';

import { MinecraftManualStream } from '../../../../../api';

export class SimpleNetworkStream extends MinecraftManualStream {
  baseStream?: Duplex;

  constructor(baseStream?: Duplex) {
    super();

    this.baseStream = baseStream;
  }

  get closed(): boolean {
    return this.baseStream?.closed ?? true;
  }

  destroy(): void {
    this.baseStream?.destroy();
  }

  async read(size = 1): Promise<Buffer> {
    await this.waitReadableSize(size);

    return this.baseStream?.read(size) ?? Buffer.alloc(0);
  }

  async write(data: Buffer): Promise<void> {
    this.baseStream?.write(data);
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
