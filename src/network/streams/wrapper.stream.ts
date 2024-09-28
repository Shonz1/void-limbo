import { Duplex } from 'node:stream';

export class WrapperStream {
  constructor(public stream: Duplex | WrapperStream) {}

  get readableLength(): number {
    return this.stream.readableLength;
  }

  get closed(): boolean {
    return this.stream.closed;
  }

  once(event: 'readable', listener: () => void): void {
    this.stream.once(event, listener);
  }

  on(event: 'readable', listener: () => void): void {
    this.stream.on(event, listener);
  }

  off(event: 'readable', listener: () => void): void {
    this.stream.off(event, listener);
  }

  read(size: number): Buffer | null {
    return this.stream.read(size);
  }

  write(chunk: Buffer, encoding?: BufferEncoding): boolean {
    return this.stream.write(chunk, encoding);
  }

  end(chunk?: Buffer): void {
    this.stream.end(chunk);
  }

  cork(): void {
    return this.stream.cork();
  }

  uncork(): void {
    return this.stream.uncork();
  }
}
