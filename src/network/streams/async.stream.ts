import { Readable } from 'stream';

export class AsyncStream {
  constructor(private readonly stream: Readable) {}

  async readAsync(size = 1): Promise<Buffer> {
    await this.waitReadableSize(size);

    return this.stream.read(size) ?? Buffer.alloc(0);
  }

  async readByteAsync(): Promise<number> {
    return this.readAsync(1).then(buffer => buffer.readUInt8());
  }

  private waitReadableSize(size: number): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (this.stream.readableLength >= size) {
          resolve();
        } else {
          this.stream.once('readable', check);
        }
      };

      check();
    });
  }
}
